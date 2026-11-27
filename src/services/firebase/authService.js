import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseServices } from "./app";
import { firebaseConfiguration } from "./config";

// A coleção monitors é a única fonte de autorização: pertencer ao Firebase Authentication
// não garante acesso ao SGMLab. A criação/ativação é feita por administração confiável.
async function fetchMonitor(uid) {
  const { db } = getFirebaseServices();
  const snapshot = await getDoc(doc(db, "monitors", uid));
  return snapshot.exists() ? { uid, ...snapshot.data() } : null;
}

export const firebaseAuthService = Object.freeze({
  getConfiguration: () => ({
    configured: firebaseConfiguration.configured,
    missing: firebaseConfiguration.missing,
  }),

  observe(listener) {
    return onAuthStateChanged(getFirebaseServices().auth, listener);
  },

  async signIn(email, password) {
    const { auth } = getFirebaseServices();
    await signInWithEmailAndPassword(auth, email.trim(), password);
  },

  async signOut() {
    const { auth } = getFirebaseServices();
    await signOut(auth);
  },

  fetchMonitor,
});
