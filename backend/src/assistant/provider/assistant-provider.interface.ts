/**
 * Provider-agnostic surface for the chat engine. The chat service owns the
 * conversation, tools, and metering; a provider just runs one assistant turn
 * (including any tool round-trips) and reports token usage. Swapping to Gemini /
 * OpenRouter later means adding another implementation of this interface.
 */

export interface AssistantTool {
  name: string;
  description: string;
  /** JSON Schema for the tool input. */
  inputSchema: Record<string, unknown>;
}

export interface AssistantTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantChatParams {
  model: string;
  system: string;
  /** Prior turns (oldest first), excluding the new user message. */
  history: AssistantTurn[];
  userMessage: string;
  tools: AssistantTool[];
  /** Executes a tool call and returns a string result for the model. */
  executeTool: (name: string, input: Record<string, unknown>) => Promise<string>;
  /** Hard cap on output tokens per model response. */
  maxOutputTokens: number;
}

export interface AssistantChatResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
}

export interface AssistantProvider {
  /** False when credentials are missing — the feature stays dormant. */
  isConfigured(): boolean;
  chat(params: AssistantChatParams): Promise<AssistantChatResult>;
}

export const ASSISTANT_PROVIDER = Symbol('ASSISTANT_PROVIDER');
