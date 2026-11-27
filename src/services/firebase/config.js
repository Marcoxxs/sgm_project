const ENVIRONMENT_KEYS = [
  ["apiKey", "VITE_FIREBASE_API_KEY"],
  ["authDomain", "VITE_FIREBASE_AUTH_DOMAIN"],
  ["projectId", "VITE_FIREBASE_PROJECT_ID"],
  ["storageBucket", "VITE_FIREBASE_STORAGE_BUCKET"],
  ["messagingSenderId", "VITE_FIREBASE_MESSAGING_SENDER_ID"],
  ["appId", "VITE_FIREBASE_APP_ID"],
];

export class FirebaseConfigurationError extends Error {
  constructor(missing) {
    super(`Configuração do Firebase incompleta. Defina ${missing.join(", ")} no arquivo .env.local.`);
    this.name = "FirebaseConfigurationError";
    this.missing = missing;
  }
}

// As variáveis VITE_* são incorporadas ao bundle: servem para identificar o projeto
// público do Firebase, nunca para proteger dados. A proteção real está nas Security Rules.
export function readFirebaseConfiguration(environment = import.meta.env) {
  const config = {};
  const missing = [];

  for (const [field, variable] of ENVIRONMENT_KEYS) {
    const value = environment?.[variable];
    if (typeof value !== "string" || value.trim() === "") missing.push(variable);
    else config[field] = value.trim();
  }

  return {
    configured: missing.length === 0,
    missing,
    config: missing.length === 0 ? Object.freeze(config) : null,
    authEmulatorHost: environment?.VITE_FIREBASE_AUTH_EMULATOR_HOST?.trim() || "",
    firestoreEmulatorHost: environment?.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST?.trim() || "",
  };
}

export const firebaseConfiguration = readFirebaseConfiguration();
