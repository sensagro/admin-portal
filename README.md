# Sensagro — Admin portal

Internal web app for Sensagro staff: user directory and roles, sensor lifecycle (register, assign, suspend, etc.), and audit log. UI copy is Spanish.

**Stack:** React 19, Vite 8, Tailwind CSS 4, Firebase Authentication (email/password; admin/support roles enforced via backend).

## Prerequisites

- Node.js 20+
- A running **Sensagro backend** (local or deployed)
- A Firebase **web app** config in the same project the backend uses for Auth

## Setup

```bash
npm install
```

Create `.env` in this directory (Vite only exposes variables prefixed with `VITE_`):

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | No | Backend origin (default `http://localhost:3000`) |
| `VITE_FIREBASE_API_KEY` | Yes | Firebase Console → Project settings → Web app |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Same as backend `FIREBASE_PROJECT_ID` |
| `VITE_FIREBASE_AUTH_DOMAIN` | No | Defaults to `{projectId}.firebaseapp.com` |
| `VITE_FIREBASE_APP_ID` | No | Web app app ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | No | If your web config lists it |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | No | If your web config lists it |

Example:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=your-web-api-key
VITE_FIREBASE_PROJECT_ID=your-project-id
```

## Run locally

```bash
npm run dev
```

Sign-in only succeeds for users whose Firebase account is linked in the backend and whose role is `ADMIN` or `SUPPORT` (see backend admin module).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run preview` | Serve `dist/` locally |
| `npm run lint` | ESLint |

## Deployment

Configured for **Vercel**; `vercel.json` includes SPA routing so client-side navigation keeps working on refresh.
