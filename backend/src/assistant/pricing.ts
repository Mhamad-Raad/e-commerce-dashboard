// Per-model token pricing in USD per 1M tokens. Used to compute spend for the
// global budget caps. Keep in sync with the models offered in the dashboard.
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'claude-haiku-4-5': { input: 1, output: 5 },
  'claude-sonnet-4-6': { input: 3, output: 15 },
  'claude-opus-4-8': { input: 5, output: 25 },
};

// Fallback for an unknown/changed model id — price at the most expensive tier so
// budgets never under-count.
const FALLBACK = { input: 5, output: 25 };

/**
 * Cost of a turn in micro-USD (1e-6 USD; 1 cent = 10_000). Because price is
 * $/1M tokens, micro-USD = tokens * price exactly — an integer, no rounding loss.
 */
export function costMicros(model: string, inputTokens: number, outputTokens: number): number {
  const p = MODEL_PRICING[model] ?? FALLBACK;
  return Math.round(inputTokens * p.input + outputTokens * p.output);
}

export const CENTS_TO_MICROS = 10_000;
