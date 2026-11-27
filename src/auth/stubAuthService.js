// Serviço de autenticação controlado para testes automatizados. Nunca é usado em produção.
export function createStubAuthService(options = {}) {
  const {
    user = { uid: "uid-monitor-teste", email: "monitor@uespi.br" },
    sessionUser = { uid: "uid-monitor-teste", email: "monitor@uespi.br" },
    monitor = { name: "Monitora de Teste", active: true },
    configured = true,
    missing = [],
    signInError = null,
    monitorError = null,
    pending = false,
  } = options;

  let currentUser = user;
  const listeners = new Set();
  const notify = () => listeners.forEach((listener) => listener(currentUser));

  return {
    getConfiguration: () => ({ configured, missing: configured ? [] : missing }),

    observe(listener) {
      listeners.add(listener);
      if (!pending) listener(currentUser);
      return () => listeners.delete(listener);
    },

    async signIn() {
      if (signInError) throw signInError;
      currentUser = sessionUser;
      notify();
    },

    async signOut() {
      currentUser = null;
      notify();
    },

    fetchMonitor() {
      if (monitorError) throw monitorError;
      return monitor;
    },
  };
}
