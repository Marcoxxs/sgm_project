// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import App from "./App";

let container;
let root;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
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

test("abre Registros diretamente e navega para a Home pelo menu existente", () => {
  window.history.replaceState(null, "", "/registros");
  act(() => root.render(<App />));

  expect(container.querySelector("h1")?.textContent).toBe("Registros de Acesso");
  const home = [...container.querySelectorAll('[role="button"]')]
    .find((button) => button.textContent === "Inicio");
  expect(home).toBeDefined();
  act(() => home.click());

  expect(window.location.pathname).toBe("/");
  expect(container.querySelector('[role="tab"][aria-selected="true"]')?.textContent)
    .toBe("Delta Lab");
  const stations = container.querySelectorAll('#panel-delta img[src="/mesa_default.png"]');
  expect(stations).toHaveLength(15);
});
