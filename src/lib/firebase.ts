import { getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app'
import { getAuth } from 'firebase/auth'

/**
 * Client SDK config ≠ backend service account (FIREBASE_PROJECT_ID + client email + private key).
 * The Web SDK needs the public apiKey from Firebase Console → Project settings → Your apps (Web).
 * Everything else can be derived or omitted for Auth-only.
 */
function readFirebaseConfig(): FirebaseOptions {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID

  if (!apiKey || !projectId) {
    throw new Error(
      'Faltan VITE_FIREBASE_API_KEY y VITE_FIREBASE_PROJECT_ID en .env (mismo projectId que en el backend)',
    )
  }

  const authDomain =
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`

  const config: FirebaseOptions = {
    apiKey,
    authDomain,
    projectId,
  }

  const appId = import.meta.env.VITE_FIREBASE_APP_ID
  if (appId) config.appId = appId

  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
  if (storageBucket) config.storageBucket = storageBucket

  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
  if (messagingSenderId) config.messagingSenderId = messagingSenderId

  return config
}

const app = getApps().length > 0 ? getApp() : initializeApp(readFirebaseConfig())

export const firebaseAuth = getAuth(app)
