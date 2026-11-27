import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { firebaseAuthService } from "../services/firebase/authService";

export const AuthContext = createContext(null);

const emptySession = { user: null, monitor: null, error: "" };

function interpretMonitor(uid, document) {
  if (!document || typeof document !== "object") {
    return { uid, exists: false, active: false, name: "", email: "" };
  }
  return {
    uid,
    exists: true,
    active: document.active === true,
    name: typeof document.name === "string" ? document.name.trim() : "",
    email: typeof document.email === "string" ? document.email : "",
  };
}

function authorizationErrorMessage(error) {
  if (error?.code === "permission-denied") {
    return "A leitura do documento de autorização foi negada pelas regras de segurança do Firestore.";
  }
  if (error?.code === "unavailable") {
    return "Não foi possível consultar a autorização do monitor. Verifique a conexão e tente novamente.";
  }
  return "Não foi possível verificar sua autorização de monitor. Tente novamente.";
}

// Aceita resultado síncrono (usado em testes e pré-carregamento) ou Promise (SDK real).
function settleMaybeAsync(value, onValue, onError) {
  if (value && typeof value.then === "function") {
    value.then(onValue).catch(onError);
    return;
  }
  onValue(value);
}

export function AuthProvider({ authService = firebaseAuthService, children }) {
  const configuration = authService.getConfiguration();
  const [status, setStatus] = useState(configuration.configured ? "initializing" : "unconfigured");
  const [session, setSession] = useState(emptySession);
  const requestRef = useRef(0);

  const loadAuthorization = useCallback((user) => {
    const request = requestRef.current + 1;
    requestRef.current = request;
    setStatus("authorizing");
    setSession({ user, monitor: null, error: "" });

    const apply = (document) => {
      if (request !== requestRef.current) return;
      const monitor = interpretMonitor(user.uid, document);
      setSession({ user, monitor: monitor.exists ? monitor : null, error: "" });
      setStatus(monitor.exists && monitor.active ? "authorized" : "unauthorized");
    };

    const fail = (error) => {
      if (request !== requestRef.current) return;
      setSession({ user, monitor: null, error: authorizationErrorMessage(error) });
      setStatus("error");
    };

    try {
      settleMaybeAsync(authService.fetchMonitor(user.uid), apply, fail);
    } catch (error) {
      fail(error);
    }
  }, [authService]);

  useEffect(() => {
    if (!configuration.configured) return undefined;
    let active = true;
    let unsubscribe = () => {};
    try {
      unsubscribe = authService.observe((user) => {
        if (!active) return;
        if (!user) {
          requestRef.current += 1;
          setSession(emptySession);
          setStatus("signedOut");
          return;
        }
        loadAuthorization(user);
      });
    } catch {
      setSession({ user: null, monitor: null, error: "Não foi possível iniciar a autenticação do Firebase." });
      setStatus("error");
    }
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [authService, configuration.configured, loadAuthorization]);

  const login = useCallback((email, password) => authService.signIn(email, password), [authService]);
  const logout = useCallback(() => authService.signOut(), [authService]);
  const retry = useCallback(() => {
    if (session.user) loadAuthorization(session.user);
  }, [loadAuthorization, session.user]);

  const value = useMemo(() => ({
    status,
    user: session.user,
    monitor: session.monitor,
    error: session.error,
    configured: configuration.configured,
    missingConfiguration: configuration.missing,
    login,
    logout,
    retry,
  }), [status, session, configuration.configured, configuration.missing, login, logout, retry]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return value;
}
