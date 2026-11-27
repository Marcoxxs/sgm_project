// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, test } from "vitest";
import App from "../App";
import { createStubAuthService } from "../auth/stubAuthService";
import { createMemoryLabRepository } from "../services/repositories/memoryLabRepository";

const operationalRoutes = [
  ["/", "Home"],
  ["/cadastros", "Cadastros"],
  ["/registros", "Registros de Acesso"],
  ["/dashboard", "Dashboard"],
  ["/anotacoes", "Anotações"],
  ["/ajuda", "Ajuda"],
];

let container;
let root;

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  window.matchMedia = (query) => ({
    matches: query.includes("min-width"),
    addEventListener() {},
    removeEventListener() {},
  });
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  window.history.replaceState(null, "", "/");
});

function openRoute(path, authService) {
  window.history.replaceState(null, "", path);
  act(() => root.render(
    <App repository={createMemoryLabRepository()} authService={authService} />,
  ));
}

function submitButton() {
  return container.querySelector('form button[type="submit"]');
}

function buttonByText(text) {
  return [...container.querySelectorAll("button")].find((button) => button.textContent === text);
}

function fill(name, value) {
  const input = container.querySelector(`[name="${name}"]`);
  expect(input).toBeTruthy();
  act(() => {
    const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), "value").set;
    setter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

async function signIn(email = "monitor@uespi.br", password = "senha-de-teste") {
  fill("email", email);
  fill("password", password);
  await act(async () => {
    submitButton().click();
  });
}

test("redireciona usuário não autenticado para o login, sem sidebar", () => {
  openRoute("/registros", createStubAuthService({ user: null }));

  expect(window.location.pathname).toBe("/login");
  expect(container.querySelector("h1")?.textContent).toBe("Acesso ao sistema");
  expect(container.querySelector("nav[aria-label='Navegação principal']")).toBeNull();
  expect(container.querySelector('[name="email"]')).toBeTruthy();
  expect(container.querySelector('[name="password"]')).toBeTruthy();
});

test("não exibe conteúdo protegido enquanto a autenticação inicializa", () => {
  openRoute("/", createStubAuthService({ user: null, pending: true }));

  expect(container.textContent).toContain("Verificando acesso ao SGMLab");
  expect(container.querySelector("main h1")).toBeNull();
  expect(container.querySelector("nav[aria-label='Navegação principal']")).toBeNull();
});

test("não exibe conteúdo protegido enquanto a autorização é consultada", async () => {
  let releaseMonitor;
  const monitor = new Promise((resolve) => {
    releaseMonitor = resolve;
  });
  openRoute("/", createStubAuthService({ monitor }));

  expect(container.textContent).toContain("Verificando acesso ao SGMLab");
  expect(container.querySelector("main h1")).toBeNull();

  await act(async () => {
    releaseMonitor({ name: "Monitora de Teste", active: true });
  });

  expect(container.querySelector("main h1")?.textContent).toBe("Home");
});

test("entra com credenciais válidas e direciona o monitor para a Home", async () => {
  openRoute("/login", createStubAuthService({ user: null }));

  await signIn();

  expect(window.location.pathname).toBe("/");
  expect(container.querySelector("main h1")?.textContent).toBe("Home");
  expect(container.querySelector("nav[aria-label='Navegação principal']")).toBeTruthy();
  expect(container.textContent).toContain("Monitora de Teste");
});

test("mostra mensagem clara para credenciais inválidas", async () => {
  const error = Object.assign(new Error("credenciais"), { code: "auth/invalid-credential" });
  openRoute("/login", createStubAuthService({ user: null, signInError: error }));

  await signIn("monitor@uespi.br", "senha-errada");

  expect(window.location.pathname).toBe("/login");
  expect(container.querySelector('[role="alert"]')?.textContent).toBe("E-mail ou senha incorretos.");
  expect(container.querySelector("main h1")).toBeNull();
});

test("mostra mensagem clara para falha de conexão e para campos vazios", async () => {
  const error = Object.assign(new Error("rede"), { code: "auth/network-request-failed" });
  openRoute("/login", createStubAuthService({ user: null, signInError: error }));

  await act(async () => {
    submitButton().click();
  });
  expect(container.querySelector('[role="alert"]')?.textContent).toBe("Informe o e-mail institucional.");

  await signIn();

  expect(container.querySelector('[role="alert"]')?.textContent)
    .toBe("Não foi possível conectar ao serviço de autenticação. Verifique sua conexão.");
});

test("alterna a visibilidade da senha", () => {
  openRoute("/login", createStubAuthService({ user: null }));
  const password = container.querySelector('[name="password"]');
  expect(password.getAttribute("type")).toBe("password");

  act(() => container.querySelector('[aria-label="Mostrar senha"]').click());
  expect(password.getAttribute("type")).toBe("text");

  act(() => container.querySelector('[aria-label="Ocultar senha"]').click());
  expect(password.getAttribute("type")).toBe("password");
});

test("bloqueia conta autenticada sem documento de monitor", () => {
  openRoute("/", createStubAuthService({ monitor: null }));

  expect(container.textContent).toContain("Acesso não autorizado");
  expect(container.textContent).toContain("não está autorizada como monitor ativo");
  expect(container.querySelector("main h1")).toBeNull();
  expect(container.querySelector("nav[aria-label='Navegação principal']")).toBeNull();
});

test("bloqueia monitor desativado mesmo em acesso direto à rota", () => {
  openRoute("/registros", createStubAuthService({ monitor: { name: "Monitor Inativo", active: false } }));

  expect(window.location.pathname).toBe("/registros");
  expect(container.textContent).toContain("Acesso não autorizado");
  expect(container.textContent).not.toContain("Registros de Acesso");
});

test("informa falha na consulta de autorização", () => {
  const error = Object.assign(new Error("regras"), { code: "permission-denied" });
  openRoute("/", createStubAuthService({ monitorError: error }));

  expect(container.textContent).toContain("Não foi possível verificar o acesso");
  expect(container.textContent).toContain("negada pelas regras de segurança do Firestore");
  expect(buttonByText("Tentar novamente")).toBeTruthy();
  expect(buttonByText("Sair")).toBeTruthy();
});

test("informa configuração do Firebase ausente e desabilita o login", () => {
  const authService = createStubAuthService({
    configured: false,
    missing: ["VITE_FIREBASE_API_KEY", "VITE_FIREBASE_PROJECT_ID"],
  });
  openRoute("/login", authService);

  expect(container.textContent).toContain("Configuração do Firebase incompleta");
  expect(container.textContent).toContain("VITE_FIREBASE_API_KEY");
  expect(submitButton().disabled).toBe(true);
});

test("sem configuração do Firebase, rota operacional direciona para o login", () => {
  openRoute("/", createStubAuthService({ user: null, configured: false, missing: ["VITE_FIREBASE_API_KEY"] }));

  expect(window.location.pathname).toBe("/login");
  expect(container.querySelector("h1")?.textContent).toBe("Acesso ao sistema");
});

test.each(operationalRoutes)("monitor autorizado acessa %s", (path, heading) => {
  openRoute(path, createStubAuthService());

  expect(window.location.pathname).toBe(path);
  expect(container.querySelector("main h1")?.textContent).toBe(heading);
  expect(container.textContent).toContain("Monitora de Teste");
});

test("logout encerra a sessão e retorna para o login", async () => {
  openRoute("/", createStubAuthService());
  expect(container.querySelector("main h1")?.textContent).toBe("Home");

  await act(async () => {
    buttonByText("Sair").click();
  });

  expect(window.location.pathname).toBe("/login");
  expect(container.querySelector("h1")?.textContent).toBe("Acesso ao sistema");
  expect(container.querySelector("nav[aria-label='Navegação principal']")).toBeNull();
});
