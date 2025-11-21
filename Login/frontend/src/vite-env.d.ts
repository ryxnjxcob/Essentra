/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly ZHIPU_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Allow global mermaid access
declare var mermaid: any;

declare var process: {
  env: {
    ZHIPU_API_KEY: string;
  };
};
