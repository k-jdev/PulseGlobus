/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string;
  readonly VITE_MAPBOX_ACCESS_TOKEN?: string;
  readonly VITE_POLYMARKET_BUILDER_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
