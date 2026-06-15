import Anthropic from '@anthropic-ai/sdk';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AssistantChatParams,
  AssistantChatResult,
  AssistantProvider,
} from './assistant-provider.interface';

// Safety cap on the model -> tool -> model loop so a misbehaving turn can't spin.
const MAX_TOOL_ITERATIONS = 6;

@Injectable()
export class ClaudeProvider implements AssistantProvider {
  private readonly logger = new Logger(ClaudeProvider.name);
  private readonly client: Anthropic | null;

  constructor(config: ConfigService) {
    const apiKey = config.get<string>('ANTHROPIC_API_KEY');
    this.client = apiKey ? new Anthropic({ apiKey }) : null;
    if (!this.client) {
      this.logger.warn('ANTHROPIC_API_KEY not set — assistant chat is dormant.');
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async chat(params: AssistantChatParams): Promise<AssistantChatResult> {
    if (!this.client) {
      throw new ServiceUnavailableException('AI assistant is not configured.');
    }
    const { model, system, history, userMessage, tools, executeTool, maxOutputTokens } = params;

    const messages: Anthropic.MessageParam[] = [
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: 'user', content: userMessage },
    ];
    const toolDefs: Anthropic.Tool[] = tools.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.inputSchema as Anthropic.Tool.InputSchema,
    }));

    let inputTokens = 0;
    let outputTokens = 0;

    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      const resp = await this.client.messages.create({
        model,
        max_tokens: maxOutputTokens,
        system,
        messages,
        tools: toolDefs.length ? toolDefs : undefined,
      });
      inputTokens += resp.usage.input_tokens;
      outputTokens += resp.usage.output_tokens;

      if (resp.stop_reason === 'tool_use') {
        messages.push({ role: 'assistant', content: resp.content });
        const results: Anthropic.ToolResultBlockParam[] = [];
        for (const block of resp.content) {
          if (block.type === 'tool_use') {
            let result: string;
            try {
              result = await executeTool(block.name, block.input as Record<string, unknown>);
            } catch (err) {
              result = `Error: ${err instanceof Error ? err.message : String(err)}`;
            }
            results.push({ type: 'tool_result', tool_use_id: block.id, content: result });
          }
        }
        messages.push({ role: 'user', content: results });
        continue;
      }

      const text = resp.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('')
        .trim();
      return { text, inputTokens, outputTokens };
    }

    this.logger.warn(`Tool loop hit ${MAX_TOOL_ITERATIONS} iterations without finishing`);
    return { text: '', inputTokens, outputTokens };
  }
}
