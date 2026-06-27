import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AssistantConfig } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AssistantService } from './assistant.service';
import { AssistantToolsService } from './assistant-tools.service';
import { CENTS_TO_MICROS, costMicros } from './pricing';
import { ASSISTANT_PROVIDER, AssistantProvider } from './provider/assistant-provider.interface';
import { ChatDto } from './dto/chat.dto';
import { AppChatDto } from './dto/app-chat.dto';

const HISTORY_LIMIT = 20; // prior turns sent as context
const MAX_OUTPUT_TOKENS = 1024;

const WINDOW_MS = {
  Minute: 60_000,
  Hour: 3_600_000,
  Day: 86_400_000,
  Week: 7 * 86_400_000,
  Month: 30 * 86_400_000,
} as const;

// NOTE: limit/budget gates are read-then-act, so a burst of truly concurrent
// requests can each pass before any persists (overshoot bounded by concurrency).
// Acceptable at this scale; revisit with row-locking/serialization if traffic grows.
@Injectable()
export class AssistantChatService {
  constructor(
    private prisma: PrismaService,
    private config: AssistantService,
    private tools: AssistantToolsService,
    @Inject(ASSISTANT_PROVIDER) private provider: AssistantProvider,
  ) {}

  async chat(dto: ChatDto) {
    const cfg = await this.config.getConfig();
    if (!cfg.enabled) throw new ForbiddenException('The assistant is currently disabled.');
    if (cfg.locked) throw new ForbiddenException('The assistant is locked (budget reached).');
    if (!this.provider.isConfigured()) {
      throw new ServiceUnavailableException('AI assistant is not configured.');
    }

    const customer = await this.prisma.customer.findUnique({ where: { id: dto.customerId } });
    if (!customer) throw new NotFoundException('Customer not found.');
    if (!customer.assistantEnabled) {
      throw new ForbiddenException('The assistant is disabled for this customer.');
    }

    await this.enforcePerUserLimits(dto.customerId, cfg);
    await this.enforceBudget(cfg); // pre-check; throws + locks if already over

    // Resolve (or create) the conversation, scoped to this customer.
    const conversation = await this.resolveConversation(dto);

    const history = await this.loadHistory(conversation.id);
    const system = await this.buildSystemPrompt(dto.language);

    const result = await this.provider.chat({
      model: cfg.model,
      system,
      history,
      userMessage: dto.message,
      tools: this.tools.definitions,
      executeTool: (name, input) => this.tools.execute(name, input),
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    });

    const cost = costMicros(cfg.model, result.inputTokens, result.outputTokens);

    await this.prisma.$transaction([
      this.prisma.message.create({
        data: { conversationId: conversation.id, role: 'user', content: dto.message },
      }),
      this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: 'assistant',
          content: result.text,
          model: cfg.model,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          costMicros: cost,
        },
      }),
      this.prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      }),
    ]);

    // Post-check: lock for next time if this turn pushed spend over a cap.
    await this.lockIfOverBudget(cfg);

    return { conversationId: conversation.id, message: result.text };
  }

  // ---- Customer app (scoped to the authenticated customer) ----

  // Same engine as chat(), but the customer comes from the JWT, never the body.
  chatForCustomer(customerId: string, dto: AppChatDto) {
    return this.chat({ customerId, ...dto });
  }

  // A conversation, but only if it belongs to this customer (else 404).
  async getConversationForCustomer(customerId: string, id: string) {
    const conversation = await this.getConversation(id);
    if (conversation.customerId !== customerId) {
      throw new NotFoundException('Conversation not found.');
    }
    return conversation;
  }

  // ---- Admin viewing ----

  listConversations(customerId: string) {
    return this.prisma.conversation.findMany({
      where: { customerId },
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { messages: true } } },
    });
  }

  async getConversation(id: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!conversation) throw new NotFoundException('Conversation not found.');
    return conversation;
  }

  // ---- internals ----

  private async resolveConversation(dto: ChatDto) {
    if (dto.conversationId) {
      const existing = await this.prisma.conversation.findUnique({
        where: { id: dto.conversationId },
      });
      if (!existing || existing.customerId !== dto.customerId) {
        throw new NotFoundException('Conversation not found.');
      }
      return existing;
    }
    return this.prisma.conversation.create({
      data: {
        customerId: dto.customerId,
        title: dto.message.slice(0, 60),
      },
    });
  }

  private async loadHistory(conversationId: string) {
    const rows = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: HISTORY_LIMIT,
    });
    return rows
      .reverse()
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
  }

  private async buildSystemPrompt(language?: string): Promise<string> {
    const [settings, categories] = await Promise.all([
      this.prisma.setting.findUnique({ where: { id: 'singleton' } }),
      this.prisma.category.findMany({
        where: { isActive: true },
        select: { name: true },
        take: 40,
      }),
    ]);
    const business = settings?.businessName || 'our store';
    const catList = categories.map((c) => c.name).join(', ');
    return [
      `You are the shopping assistant for ${business}.`,
      // Vertical-agnostic: the store may sell beauty, perfume, clothing, etc.
      // Ground the assistant in whatever categories actually exist.
      catList
        ? `${business} sells: ${catList}. Help customers shop across any of these.`
        : 'Help customers find and choose the products we sell.',
      'ALWAYS call search_products before recommending anything, and only recommend items it returns — never invent products, prices, or availability.',
      "If we don't carry the exact item the customer wants, suggest the closest in-stock alternative we do have, and say it's an alternative.",
      'You can also point customers to a relevant store/brand via search_stores.',
      // Safety caveat scoped to skincare/cosmetics (still applies if we sell them).
      'You are NOT a medical professional: for skincare or cosmetic concerns — rashes, infections, allergies, or any persistent or worsening condition — advise seeing a dermatologist or doctor; never diagnose or prescribe.',
      'Be concise: use as few words as possible while still being helpful.',
      'Reply in the same language the customer writes in (English, Arabic, or Kurdish Sorani).' +
        (language ? ` Prefer ${language}.` : ''),
    ].join('\n');
  }

  /** Throw 429 if the customer has hit any configured message/token window cap. */
  private async enforcePerUserLimits(customerId: string, cfg: AssistantConfig) {
    const msgCaps: [number | null, keyof typeof WINDOW_MS][] = [
      [cfg.maxMsgsPerMinute, 'Minute'],
      [cfg.maxMsgsPerHour, 'Hour'],
      [cfg.maxMsgsPerDay, 'Day'],
      [cfg.maxMsgsPerWeek, 'Week'],
      [cfg.maxMsgsPerMonth, 'Month'],
    ];
    for (const [cap, win] of msgCaps) {
      if (cap == null) continue;
      const since = new Date(Date.now() - WINDOW_MS[win]);
      const count = await this.prisma.message.count({
        where: { role: 'user', createdAt: { gte: since }, conversation: { customerId } },
      });
      if (count >= cap) throw this.tooMany();
    }

    const tokenCaps: [number | null, keyof typeof WINDOW_MS][] = [
      [cfg.maxTokensPerDay, 'Day'],
      [cfg.maxTokensPerWeek, 'Week'],
      [cfg.maxTokensPerMonth, 'Month'],
    ];
    for (const [cap, win] of tokenCaps) {
      if (cap == null) continue;
      const since = new Date(Date.now() - WINDOW_MS[win]);
      const agg = await this.prisma.message.aggregate({
        _sum: { inputTokens: true, outputTokens: true },
        where: { role: 'assistant', createdAt: { gte: since }, conversation: { customerId } },
      });
      const used = (agg._sum.inputTokens ?? 0) + (agg._sum.outputTokens ?? 0);
      if (used >= cap) throw this.tooMany();
    }
  }

  /** Pre-check: lock + throw if global spend already meets a cap. */
  private async enforceBudget(cfg: AssistantConfig) {
    const breach = await this.findBudgetBreach(cfg);
    if (breach) {
      await this.config.lock(breach);
      throw new ForbiddenException('The assistant is locked (budget reached).');
    }
  }

  /** Post-check: lock (no throw) so the next request is blocked. */
  private async lockIfOverBudget(cfg: AssistantConfig) {
    const breach = await this.findBudgetBreach(cfg);
    if (breach) await this.config.lock(breach);
  }

  private async findBudgetBreach(cfg: AssistantConfig): Promise<string | null> {
    const caps: [number | null, string, number | null][] = [
      [cfg.budgetWeeklyCents, 'Weekly budget reached', WINDOW_MS.Week],
      [cfg.budgetMonthlyCents, 'Monthly budget reached', WINDOW_MS.Month],
      [cfg.budgetTotalCents, 'Total budget reached', null],
    ];
    for (const [capCents, reason, win] of caps) {
      if (capCents == null) continue;
      const agg = await this.prisma.message.aggregate({
        _sum: { costMicros: true },
        where: {
          role: 'assistant',
          ...(win ? { createdAt: { gte: new Date(Date.now() - win) } } : {}),
        },
      });
      const spent = agg._sum.costMicros ?? 0;
      if (spent >= capCents * CENTS_TO_MICROS) return reason;
    }
    return null;
  }

  private tooMany() {
    return new HttpException(
      'You have reached your usage limit. Please try again later.',
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
