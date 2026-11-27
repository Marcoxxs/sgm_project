import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { FirebaseConfigurationError, firebaseConfiguration } from "./config";

let services = null;

export function getFirebaseServices() {
  const { configured, missing, config, authEmulatorHost, firestoreEmulatorHost } = firebaseConfiguration;
  if (!configured) throw new FirebaseConfigurationError(missing);
  if (services) return services;

  const app = getApps().length ? getApp() : initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);

  if (authEmulatorHost) connectAuthEmulator(auth, normalizeHost(authEmulatorHost), { disableWarnings: true });
  if (firestoreEmulatorHost) {
    const { host, port } = splitHost(firestoreEmulatorHost);
    connectFirestoreEmulator(db, host, port);
  }

  services = Object.freeze({ app, auth, db });
  return services;
}

function normalizeHost(value) {
  return /^https?:\/\//i.test(value) ? value.replace(/\/$/, "") : `http://${value}`;
}

function splitHost(value) {
  const [host, port] = value.replace(/^https?:\/\//i, "").split(":");
  return { host: host || "127.0.0.1", port: Number(port) || 8080 };
}
