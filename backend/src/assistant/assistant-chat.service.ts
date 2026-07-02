import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AssistantConfig, Customer } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AssistantService } from './assistant.service';
import { AssistantToolsService } from './assistant-tools.service';
import { CENTS_TO_MICROS, costMicros } from './pricing';
import { ASSISTANT_PROVIDER, AssistantProvider } from './provider/assistant-provider.interface';
import { ChatDto } from './dto/chat.dto';
import { AppChatDto } from './dto/app-chat.dto';

const HISTORY_LIMIT = 20; // prior turns sent as context
const MAX_OUTPUT_TOKENS = 1024;

// Free assistant turns a logged-out guest gets before the login wall. Enforced
// server-side (the client also counts, but can't be trusted) as a lifetime total
// per device id.
const GUEST_MESSAGE_LIMIT = 3;

// The per-device cap above is defeatable by rotating the client-supplied device
// id, so this is a hard ceiling on ALL guest turns in a rolling 24h — it bounds
// total anonymous spend and, being guest-only, can't lock out paying customers
// the way the shared budget cap would.
const GUEST_GLOBAL_DAILY_LIMIT = 500;

// Guest (customerId == null) conversations are anonymous trial threads with no
// owner to view them; purge anything older than this so abuse can't grow the
// table without bound.
const GUEST_CONVERSATION_TTL_DAYS = 14;

const WINDOW_MS = {
  Minute: 60_000,
  Hour: 3_600_000,
  Day: 86_400_000,
  Week: 7 * 86_400_000,
  Month: 30 * 86_400_000,
} as const;

// Who a chat turn belongs to: a signed-in customer, or an unauthenticated guest
// identified only by an app-generated device id.
type ChatPrincipal =
  | { kind: 'customer'; customerId: string }
  | { kind: 'guest'; deviceId: string };

// The provider-agnostic shape of one turn, shared by ChatDto and AppChatDto.
type ChatTurn = { conversationId?: string; message: string; language?: string };

// NOTE: limit/budget gates are read-then-act, so a burst of truly concurrent
// requests can each pass before any persists (overshoot bounded by concurrency).
// Acceptable at this scale; revisit with row-locking/serialization if traffic grows.
@Injectable()
export class AssistantChatService {
  private readonly logger = new Logger(AssistantChatService.name);

  constructor(
    private prisma: PrismaService,
    private config: AssistantService,
    private tools: AssistantToolsService,
    @Inject(ASSISTANT_PROVIDER) private provider: AssistantProvider,
  ) {}

  /**
   * Admin path: the caller supplies the customerId in the request body. The
   * customer-app and guest paths go through chatForCustomer / chatForGuest.
   */
  async chat(dto: ChatDto) {
    return this.runChat({ kind: 'customer', customerId: dto.customerId }, dto);
  }

  // Shared engine for all three callers (admin, signed-in customer, guest). The
  // principal decides who owns the conversation and which limits apply; the rest
  // of the turn (provider call, product collection, persistence) is identical.
  private async runChat(principal: ChatPrincipal, dto: ChatTurn) {
    const cfg = await this.config.getConfig();
    if (!cfg.enabled) throw new ForbiddenException('The assistant is currently disabled.');
    if (cfg.locked) throw new ForbiddenException('The assistant is locked (budget reached).');
    if (!this.provider.isConfigured()) {
      throw new ServiceUnavailableException('AI assistant is not configured.');
    }

    // Signed-in customer: load + gate per-customer. Guest: no customer record and
    // no per-customer toggle — the lifetime message cap is enforced upstream in
    // chatForGuest, and the global budget gate below still applies.
    let customer: Customer | null = null;
    if (principal.kind === 'customer') {
      customer = await this.prisma.customer.findUnique({
        where: { id: principal.customerId },
      });
      if (!customer) throw new NotFoundException('Customer not found.');
      if (!customer.assistantEnabled) {
        throw new ForbiddenException('The assistant is disabled for this customer.');
      }
      await this.enforcePerUserLimits(principal.customerId, cfg);
    }
    await this.enforceBudget(cfg); // pre-check; throws + locks if already over

    // Resolve (or create) the conversation, scoped to this principal.
    const conversation = await this.resolveConversation(principal, dto);

    const history = await this.loadHistory(conversation.id);
    const system = await this.buildSystemPrompt(dto.language, customer);

    // Collect the products surfaced via search_products this turn so the app can
    // render them as tappable cards under the reply. Deduped, per-request (no
    // shared state), capped on return.
    const shownProducts: Record<string, unknown>[] = [];
    const seenProductIds = new Set<string>();

    const result = await this.provider.chat({
      model: cfg.model,
      system,
      history,
      userMessage: dto.message,
      tools: this.tools.definitions,
      executeTool: async (name, input) => {
        const out = await this.tools.execute(name, input);
        if (name === 'search_products') {
          try {
            const arr = JSON.parse(out) as unknown;
            if (Array.isArray(arr)) {
              for (const p of arr) {
                const id = (p as { id?: unknown })?.id;
                if (typeof id === 'string' && !seenProductIds.has(id)) {
                  seenProductIds.add(id);
                  shownProducts.push(p as Record<string, unknown>);
                }
              }
            }
          } catch {
            /* tool output wasn't JSON — ignore for card collection */
          }
        }
        return out;
      },
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

    return {
      conversationId: conversation.id,
      message: result.text,
      // Trim to the fields the storefront card needs (drop description/attributes/
      // category/inStock that the model used internally).
      products: shownProducts.slice(0, 6).map((p) => ({
        id: p.id,
        name: p.name,
        priceCents: p.priceCents,
        salePriceCents: p.salePriceCents,
        currency: p.currency,
        imageUrl: p.imageUrl,
        storeName: p.storeName,
        ratingAvg: p.ratingAvg,
        ratingCount: p.ratingCount,
      })),
    };
  }

  // ---- Customer app (scoped to the authenticated customer) ----

  // Same engine as chat(), but the customer comes from the JWT, never the body.
  chatForCustomer(customerId: string, dto: AppChatDto) {
    return this.runChat({ kind: 'customer', customerId }, dto);
  }

  // ---- Guest trial (unauthenticated, capped) ----

  /**
   * Lets a logged-OUT visitor try the assistant for a few turns before signing
   * up. Keyed by an app-generated device id (NOT trusted on its own — the public
   * endpoint is also IP-rate-limited, and rotating the id only buys another small
   * batch). The cap is a lifetime total across all of this device's guest
   * threads; the reply reports how many turns remain so the app can show the
   * login wall at zero.
   */
  async chatForGuest(deviceId: string, dto: AppChatDto) {
    await this.enforceGuestGlobalLimit();
    await this.enforceGuestLimit(deviceId);
    const reply = await this.runChat({ kind: 'guest', deviceId }, dto);
    const used = await this.countGuestMessages(deviceId);
    return { ...reply, guestMessagesRemaining: Math.max(0, GUEST_MESSAGE_LIMIT - used) };
  }

  /**
   * Hard ceiling on all guest turns in the last 24h, across every device id.
   * Throws 429 (not the shared budget lock) so anonymous abuse degrades only the
   * guest trial, never the assistant for signed-in customers.
   */
  private async enforceGuestGlobalLimit() {
    const since = new Date(Date.now() - WINDOW_MS.Day);
    const used = await this.prisma.message.count({
      where: {
        role: 'user',
        createdAt: { gte: since },
        conversation: { guestDeviceId: { not: null } },
      },
    });
    if (used >= GUEST_GLOBAL_DAILY_LIMIT) throw this.tooMany();
  }

  // Purge anonymous guest trial threads past their TTL (messages cascade).
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async purgeOldGuestConversations() {
    const cutoff = new Date(Date.now() - GUEST_CONVERSATION_TTL_DAYS * WINDOW_MS.Day);
    const { count } = await this.prisma.conversation.deleteMany({
      where: { customerId: null, guestDeviceId: { not: null }, updatedAt: { lt: cutoff } },
    });
    if (count > 0) this.logger.log(`Purged ${count} expired guest conversation(s).`);
  }

  private countGuestMessages(deviceId: string) {
    return this.prisma.message.count({
      where: { role: 'user', conversation: { guestDeviceId: deviceId } },
    });
  }

  /** Throw a recognizable 403 once the device has used its free guest turns. */
  private async enforceGuestLimit(deviceId: string) {
    const used = await this.countGuestMessages(deviceId);
    if (used >= GUEST_MESSAGE_LIMIT) {
      // Object body so the app can distinguish "log in to continue" from other
      // 403s (assistant disabled/locked) via the `code` field.
      throw new ForbiddenException({
        code: 'GUEST_LIMIT_REACHED',
        message: 'Free guest messages used up. Please log in to keep chatting.',
      });
    }
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

  private async resolveConversation(principal: ChatPrincipal, dto: ChatTurn) {
    if (dto.conversationId) {
      const existing = await this.prisma.conversation.findUnique({
        where: { id: dto.conversationId },
      });
      if (!existing) throw new NotFoundException('Conversation not found.');
      // The thread must belong to this exact principal — a customer can't resume
      // a guest's thread (or another customer's), and vice versa.
      const owns =
        principal.kind === 'customer'
          ? existing.customerId === principal.customerId
          : existing.guestDeviceId === principal.deviceId;
      if (!owns) throw new NotFoundException('Conversation not found.');
      return existing;
    }
    return this.prisma.conversation.create({
      data: {
        customerId: principal.kind === 'customer' ? principal.customerId : null,
        guestDeviceId: principal.kind === 'guest' ? principal.deviceId : null,
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

  private async buildSystemPrompt(
    language?: string,
    customer?: Customer | null,
  ): Promise<string> {
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
    const lines = [
      `You are the shopping assistant for ${business}.`,
      // Vertical-agnostic: the store may sell beauty, perfume, clothing, etc.
      // Ground the assistant in whatever categories actually exist.
      catList
        ? `${business} sells: ${catList}. Help customers shop across any of these.`
        : 'Help customers find and choose the products we sell.',
      'ALWAYS call search_products before recommending anything, and only recommend items it returns — never invent products, prices, or availability.',
      "If we don't carry the exact item the customer wants, suggest the closest in-stock alternative we do have, and say it's an alternative.",
      'You can also point customers to a relevant store/brand via search_stores.',
      // Products from search_products are rendered to the customer as tappable cards.
      'Products you find with search_products are shown to the customer as tappable cards with the image, price, and add-to-cart and wishlist buttons. So do NOT list prices or full specs in your text — briefly introduce them (e.g. "a couple that could help:") with a one-line reason each fits, and let the cards carry the details.',
      // Search aggressively — almost every product/skincare turn should show options.
      'Whenever the customer mentions a product type, a skin concern, or asks how to use something, you MUST call search_products in that SAME reply and show what we carry — searching is cheap and customers want to see real options. Never discuss or advise about a product type without first searching and showing matching in-stock items (only skip if a search truly returns nothing relevant). Never offer to search "if they want" — just search and show.',
      // Consultation: show products AND ask, together — not ask-now-recommend-later.
      "For a skincare/cosmetics request, your first reply must do BOTH in the same message: (a) call search_products and show 1-3 relevant in-stock options, AND (b) ask one or two quick questions to refine — show the options first, then ask. Draw your questions from whatever is most relevant: how their skin feels (tight/oily/sensitive), age range, climate (dry/humid/hot), daily makeup, sleep, smoking, stress, diet (do they eat fairly healthy and drink enough water), and whether their nutrition or vitamins feel balanced. For acne or breakouts especially, also consider the hygiene of daily-use items — whether they regularly clean their phone screen, pillowcase, and makeup brushes/sponges. Feel free to ask your own relevant follow-up questions too. Ask only one or two at a time; never defer the products to a later turn or ask questions without also showing options. Refine your picks as you learn more.",
      // How-to questions: show the product first, then the how-to.
      "If the customer asks HOW to use a kind of product (e.g. 'how do I use a vitamin C serum?'), START by calling search_products and showing the matching item we carry (or the closest in-stock alternative), THEN explain how to use it. Do not ask whether they want to buy, and do not give generic how-to without first showing the product.",
      // The "why" — framed as a product benefit, never a diagnosis.
      'For each product you show, give one short reason it fits what the customer told you, framed as a product benefit (e.g. "lightweight, good for oily skin in humid weather") — not as a diagnosis of their skin.',
      // Routine building — composed from OUR products, with close alternatives.
      "You can build full routines (skincare, haircare, or whatever the customer wants) out of products WE carry: call search_products for each step and show those products as cards, one per role (e.g. AM — cleanser → treatment/serum → moisturizer → sunscreen; plus a PM version). Prefer our in-stock items; if we don't carry a step, offer the closest equivalent we DO have that works the same way and say it's an alternative — only fall back to a generic (non-product) suggestion if we truly carry nothing close. Order steps thinnest/most water-based to thickest/most oil-based, note morning vs night, and warn about conflicting actives (e.g. two strong exfoliants, or retinol plus a strong acid) by spacing them apart.",
      // Safety caveat scoped to skincare/cosmetics (still applies if we sell them).
      'You are NOT a medical professional: for skincare or cosmetic concerns — rashes, infections, allergies, or any persistent or worsening condition — advise seeing a dermatologist or doctor; never diagnose or prescribe.',
      "You may note in general terms how nutrition and vitamins relate to skin and hair (e.g. hydration, vitamin C, biotin, zinc) to inform which products you suggest — but treat the customer's diet/vitamin answers as background context only. Do NOT prescribe supplements or dosages or diagnose deficiencies; suggest a doctor or nutritionist for that.",
      'Be concise: use as few words as possible while still being helpful.',
      'Reply in the same language the customer writes in (English, Arabic, or Kurdish Sorani).' +
        (language ? ` Prefer ${language}.` : ''),
    ];

    // Gender-aware tailoring. Gender is required at sign-up, but legacy customers
    // (created before the field existed) may be null — only add these when known.
    if (customer?.gender) {
      lines.push(
        `The customer is ${customer.gender === 'FEMALE' ? 'female' : 'male'}. Take this into account when it is relevant to product suitability or typical skin/hair considerations, but keep it subtle — do not mention it unprompted or over-emphasize it.`,
      );
    }
    if (customer?.gender === 'FEMALE') {
      // Cycle-aware skincare: conversational consultation context ONLY — never a
      // stored field (sensitive health data), and the no-diagnosis boundary holds.
      lines.push(
        'Hormones and the menstrual cycle can affect skin, so cyclical/hormonal breakouts are common. If she raises acne or breakouts (or a concern that may be hormonal), you may gently and respectfully ask whether her breakouts tend to be cyclical — e.g. around her period — to better tailor product suggestions. Treat any such answer as private, in-the-moment context only: never store it, repeat it, or bring it up again unprompted. Keep the medical boundary: for persistent hormonal acne or anything needing treatment, suggest a doctor/dermatologist; never diagnose or advise hormonal or medication treatment.',
      );
    }

    return lines.join('\n');
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
