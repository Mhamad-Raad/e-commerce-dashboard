import { api } from '../../lib/api';

export interface AssistantConfig {
  id: string;
  enabled: boolean;
  provider: string;
  model: string;
  maxMsgsPerMinute: number | null;
  maxMsgsPerHour: number | null;
  maxMsgsPerDay: number | null;
  maxMsgsPerWeek: number | null;
  maxMsgsPerMonth: number | null;
  maxTokensPerDay: number | null;
  maxTokensPerWeek: number | null;
  maxTokensPerMonth: number | null;
  budgetWeeklyCents: number | null;
  budgetMonthlyCents: number | null;
  budgetTotalCents: number | null;
  warnThresholdPct: number;
  locked: boolean;
  lockedReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AssistantConfigWritePayload = Partial<
  Omit<AssistantConfig, 'id' | 'lockedReason' | 'createdAt' | 'updatedAt'>
>;

/** Claude models offered in the dashboard dropdown (provider: anthropic). */
export const ASSISTANT_MODELS = [
  { value: 'claude-haiku-4-5', label: 'Claude Haiku 4.5 — cheapest, fast' },
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 — balanced' },
  { value: 'claude-opus-4-8', label: 'Claude Opus 4.8 — most capable' },
] as const;

export interface AssistantConversation {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { messages: number };
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface AssistantConversationDetail extends AssistantConversation {
  messages: AssistantMessage[];
}

export const assistantApi = {
  getConfig: async (): Promise<AssistantConfig> => {
    const res = await api.get<AssistantConfig>('/assistant/config');
    return res.data;
  },
  updateConfig: async (
    payload: AssistantConfigWritePayload,
  ): Promise<AssistantConfig> => {
    const res = await api.patch<AssistantConfig>('/assistant/config', payload);
    return res.data;
  },
  listConversations: async (customerId: string): Promise<AssistantConversation[]> => {
    const res = await api.get<AssistantConversation[]>(
      `/assistant/customers/${customerId}/conversations`,
    );
    return res.data;
  },
  getConversation: async (id: string): Promise<AssistantConversationDetail> => {
    const res = await api.get<AssistantConversationDetail>(`/assistant/conversations/${id}`);
    return res.data;
  },
};
