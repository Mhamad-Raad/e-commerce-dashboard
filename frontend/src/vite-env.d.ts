/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Absolute API base for production split-origin deploys, e.g. https://<backend>.run.app/api. Unset in dev (Vite proxies /api). */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
