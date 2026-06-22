# AI shopping assistant

An in‑app shopping assistant for customers, backed by Claude. Built **dormant** — it stays off until an `ANTHROPIC_API_KEY` is set (no key in prod, by design). Backend: `backend/src/assistant/`.

## How it works

- **Provider seam** (`provider/assistant-provider.interface.ts`): `ClaudeProvider` (Anthropic SDK) implements `chat()`; `isConfigured()` is false without a key, so the feature is dormant. Swappable for other providers later.
- **Tools** (`assistant-tools.service.ts`): the model must `search_products` before recommending (and can `search_stores`), so it can only recommend **real, in‑stock** catalog items — never invented products/prices.
- **Control layer** (`AssistantConfig` singleton): master kill switch, model choice, per‑user message/token caps per time window, and global USD budget caps that **auto‑lock** the feature when hit. Per‑customer kill switch on the customer record. The dashboard configures these (`/assistant`).
- **Metering**: each assistant turn records token usage + micro‑USD cost on the `Message` row for budget enforcement and the admin chat‑history viewer.

## Languages

The system prompt instructs the model to **reply in the customer's language** (English, Arabic, or Kurdish Sorani) and prefers the `language` hint passed by the client. `AssistantConfig` holds no customer‑facing text, so there is nothing to translate there.

## Persona

**Vertical‑agnostic** — the prompt is grounded in the store's **live active categories** (`"<store> sells: Skincare, Makeup, Perfume, …"`), so it helps across whatever the store actually sells (beauty, perfume, clothing, …). The medical‑safety caveat (see a doctor for rashes/allergies; never diagnose) is scoped to skincare/cosmetics.

## Pending

- The **mobile assistant chat UI** isn't built yet; when it is, it should pass the current locale as `language`.
