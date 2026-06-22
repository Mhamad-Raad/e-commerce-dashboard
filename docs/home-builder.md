# Home builder (server‑driven home)

The app's home page is **not hardcoded** — it's an ordered list of **sections** composed by an admin in the dashboard and rendered by the app. Inspired by the Akkooo dashboard pattern (drag‑drop layout), tailored to **semantic section types** with a **live preview**.

## Section types

| Type | App design | Tap target |
|---|---|---|
| **BANNER** | full‑width promo carousel (badge + serif headline + CTA over a scrim) | product · category · store · blog · url |
| **CATEGORIES** | horizontal row of circular category tiles | filtered product list |
| **PRODUCTS** | slider **or** grid of product cards (`config.layout`) | product detail |
| **BRANDS** | row of circular store logos | store page |
| **BLOG** (Stories) | carousel of story cards | full article reader |

## Data model (`backend/prisma/schema.prisma`)

- **`HomeSection`** — `type` (`HomeSectionType`), `position`, `isActive`, trilingual `title*`, free‑form `config` JSON (e.g. `{ "layout": "grid" }`).
- **`HomeSectionItem`** — ordered child: optional `imageUrl` + trilingual `label/subtitle/badge/ctaLabel`, and a polymorphic **target** (`targetType` + one of `productId`/`categoryId`/`storeId`/`blogPostId`/`url`). Targets are real FKs with cascade.

## API (`backend/src/home/`)

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/api/home/layout?lang=en\|ar\|ckb` | **public** | Ordered **active** sections, items **resolved to one language** — what the app renders |
| GET | `/api/home/sections` | admin | All sections (incl. inactive) with **all three languages** for editing |
| POST | `/api/home/sections` | admin | Create section |
| PATCH | `/api/home/sections/:id` | admin | Update (full item replace) |
| PATCH | `/api/home/sections/reorder` | admin | `{ sections: [{ id, position }] }` |
| DELETE | `/api/home/sections/:id` | admin | Delete |

The service has two shapes: `shapeForApp` (resolved by `?lang`) and `shapeForAdmin` (all languages). Referenced product/category/store/blog ids are validated before write (clean `400`, not a DB `500`).

## Dashboard builder (`frontend/src/routes/home-layout/`)

- **`HomeBuilder`** — sortable section list (`@dnd-kit`, persists order via `reorder`), add (type menu → create empty → open editor) / edit / delete, with a **side‑by‑side live preview** (`HomePreview` fetches `/home/layout?lang` and renders it app‑style — berry, circles, product/blog cards — in a small max‑width column; follows the dashboard language; updates on save).
- **`SectionEditorDialog`** — section title via [`TranslatableInput`](internationalization.md), active toggle, PRODUCTS slider/grid, and an **items editor with drag reorder**. Banner items get image + headline/subtitle/badge/CTA (trilingual) + a tap target; brands/categories/products/blog items pick an entity via **`EntityPicker`** (search modal); product items get a trilingual badge.

## Mobile renderer (`mobile/lib/features/catalog/`)

`HomeScreen` fetches `/home/layout?lang=<current locale>` (refetches on language switch), then a **`HomeSectionView` dispatcher** maps each `type` to a widget (`BannerSection`, `CategoriesSection`, `ProductsSection`, `BrandsSection`, `BlogSection`). Unknown/empty sections render nothing (forward‑compatible). Loading shows **shimmer skeletons** mirroring the layout; errors show a retry; the bottom nav is frosted glass. Tapping routes via a single `navigateToHomeTarget` helper (blog → reader today; other destinations are stubbed "coming soon" until those screens land).

## Note

The legacy fixed `HeroBanner` / `Featured*` model and `/api/homepage` are **superseded** by this system and kept only until the old admin pages are removed.
