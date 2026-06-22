# Blog / Stories

"Stories" are editorial blog posts the store publishes — surfaced on the app home via a **BLOG** section and read in‑app. Trilingual like all content.

## Data model

**`BlogPost`** — trilingual `title` / `excerpt` / `body` (En + Ar + Ckb), `coverImage`, `isPublished`, `publishedAt` (stamped on first publish, cleared on unpublish).

## API (`backend/src/blog/`)

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/api/blog?lang=…` | **public** | Published posts, resolved to one language (summary: title, excerpt, cover) |
| GET | `/api/blog/:id?lang=…` | **public** | One published post, resolved (incl. body) |
| GET | `/api/blog/admin` | admin | All posts (incl. drafts), all languages |
| GET | `/api/blog/admin/:id` | admin | One post, all languages (for editing) |
| POST/PATCH/DELETE | `/api/blog[/:id]` | admin | CRUD |

## Dashboard (`frontend/src/routes/blog/`)

- **`BlogList`** — table (cover / title / published‑or‑draft / created) + delete.
- **`BlogForm`** — trilingual title/excerpt/body via [`TranslatableInput`](internationalization.md), cover image upload (R2), and a publish toggle.

Nav: **Stories** under the storefront group → `/blog`.

## Mobile (`mobile/lib/features/blog/`)

A BLOG home section shows story cards; tapping opens **`BlogArticleScreen`** (`/blog/:id`), which fetches the resolved post for the current language. Loading shows an article‑shaped skeleton.

> The article body currently renders as **plain text**; rich HTML/markdown rendering (`flutter_html` / `flutter_markdown`) is a TODO.
