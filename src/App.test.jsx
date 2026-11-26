// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import App from "./App";

const routes = [
  ["/", "Home"],
  ["/cadastros", "Cadastros"],
  ["/registros", "Registros"],
  ["/dashboard", "Dashboard"],
  ["/anotacoes", "Anotações"],
  ["/ajuda", "Ajuda"],
];

let container;
let root;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("matchMedia", (query) => ({
    matches: query.includes("min-width"),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  window.history.replaceState(null, "", "/");
  vi.unstubAllGlobals();
});

function openRoute(path) {
  window.history.replaceState(null, "", path);
  act(() => root.render(<App />));
}

test.each(routes)("abre %s e destaca %s no menu", (path, title) => {
  openRoute(path);

  expect(container.querySelector("main h1")?.textContent).toBe(title);
  const nav = container.querySelector("nav[aria-label='Navegação principal']");
  expect([...nav.querySelectorAll("a")].map((link) => link.textContent)).toEqual(routes.map(([, label]) => label));
  const active = nav.querySelectorAll('a[aria-current="page"]');
  expect(active).toHaveLength(1);
  expect(active[0].textContent).toBe(title);
});

test("navega de Registros para Home e apresenta a capacidade física dos laboratórios", () => {
  openRoute("/registros");
  const home = container.querySelector('nav a[href="/"]');
  act(() => home.click());

  expect(window.location.pathname).toBe("/");
  expect(container.querySelector("main h1")?.textContent).toBe("Home");
  expect(container.querySelector('nav a[aria-current="page"]')?.textContent).toBe("Home");
  const labs = [...container.querySelectorAll("article")].map((lab) => lab.textContent);
  expect(labs).toEqual([
    expect.stringMatching(/Delta Lab.*15 computadores.*3 × 5 posições/),
    expect.stringMatching(/Carnaúba Lab.*24 computadores.*4 × 6 posições/),
  ]);
});

test("redireciona o endereço antigo de laboratório para a Home", () => {
  openRoute("/laboratorio");
  expect(window.location.pathname).toBe("/");
  expect(container.querySelector("main h1")?.textContent).toBe("Home");
});
