# Internationalization (trilingual)

The whole product is **trilingual**: **English (main) + Arabic + Kurdish Sorani**. Kurdish Sorani uses the ISO code **`ckb`** (Central Kurdish — RTL, Arabic script); `ku`/`kr` are *not* correct for Sorani.

There are two distinct layers:

1. **UI chrome** — fixed app/dashboard strings, translated per language.
2. **Content** — admin‑authored data (product names/descriptions, category/store names, blog, home‑section titles + banner text), stored in all three languages.

## Content architecture

**Storage = triple columns.** Each content field keeps the bare/`En` column as the **canonical English value**, plus optional `Ar` and `Ckb` siblings — e.g. `Product.name` / `nameAr` / `nameCkb`, `BlogPost.titleEn` / `titleAr` / `titleCkb`. (Chosen over a JSON blob — which breaks SQL search/sort — and over a translations table — too join‑heavy.)

**Serving = resolve by `?lang` on public APIs.** Storefront endpoints take `?lang=en|ar|ckb` and return **one resolved value per field**, so the mobile models stay single‑string. Admin/dashboard endpoints return **all three** for editing. Helper: `backend/src/common/i18n.ts` → `pick(lang, en, ar, ckb)`.

**Fallback rule:** requested language → **English**, when the requested value is **null _or_ empty/whitespace**. English is required on create; AR/CKB are **independently optional**. (Fallback is one‑way to English; it does not then try the other non‑English language.)

Trilingual fields exist on: `Product` (name, description), `Category` (name, description), `Store` (name, description), `BlogPost` (title, excerpt, body), `HomeSection` (title), `HomeSectionItem` (label, subtitle, badge, ctaLabel).

## Dashboard editing — `TranslatableInput`

`frontend/src/components/TranslatableInput.tsx` is the single multilingual input used by **every** content form (Category/Store/Product name+description, Blog title/excerpt/body, and the home‑section editor). UX mirrors Akkooo's:

- The **English (main) field is always visible**.
- A **"Add translations"** toggle reveals the **Arabic** and **Kurdish** fields stacked below (RTL).
- Value shape `{ en, ar, ckb }`; only English is `required`. On edit forms it **auto‑expands** when a translation already exists.

The dashboard's own UI language (`LanguageSwitcher`) offers **English / کوردی / العربية**; `ckb` is registered in i18next (RTL), with `ckb.json` translating the common UI + the home‑builder/blog screens (other keys fall back to English).

## Mobile app

- Strings via Flutter **gen‑l10n** ARBs: `app_en.arb`, `app_ar.arb`, `app_ckb.arb`. `context.l10n.*`.
- Flutter ships no Kurdish localizations, so a **fallback delegate** serves the **Arabic** Material/Cupertino/Widgets strings for `ckb` (both RTL) — see `mobile/lib/app/locale/ckb_localizations.dart`.
- A **persisted language switcher** on the Profile tab (`LocaleController`); switching language refetches storefront content via `?lang` and flips Arabic/Kurdish to RTL. `Money` formats `ckb` with Arabic‑Indic digits.

## AI assistant

Already replies in the customer's language (English/Arabic/Kurdish Sorani) and accepts a `language` hint. Its persona is **vertical‑agnostic**, grounded in the store's live active categories. See [assistant](assistant.md).
