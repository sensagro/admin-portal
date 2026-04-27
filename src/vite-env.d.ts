/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  /** Public Web API key (Console → Web app). Not the service-account private key. */
  readonly VITE_FIREBASE_API_KEY: string
  /** Same as backend FIREBASE_PROJECT_ID */
  readonly VITE_FIREBASE_PROJECT_ID: string
  /** Optional; defaults to `{projectId}.firebaseapp.com` */
  readonly VITE_FIREBASE_AUTH_DOMAIN: string | undefined
  readonly VITE_FIREBASE_APP_ID: string | undefined
  readonly VITE_FIREBASE_STORAGE_BUCKET: string | undefined
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string | undefined
  /** Sentry DSN. When unset Sentry is disabled (safe to omit in local dev). */
  readonly VITE_SENTRY_DSN: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/** Injected at build time by vite.config.ts define. Falls back to "dev" locally. */
declare const __GIT_SHA__: string
