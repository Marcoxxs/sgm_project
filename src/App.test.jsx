// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import App from "./App";
import { ThemeProvider } from "@mui/material/styles";
import HomePage from "./pages/HomePage";
import theme from "./theme";
import { createMemoryLabRepository } from "./services/repositories/memoryLabRepository";

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

test("navega de Registros para Home e apresenta o mapa do Delta", () => {
  openRoute("/registros");
  const home = container.querySelector('nav a[href="/"]');
  act(() => home.click());

  expect(window.location.pathname).toBe("/");
  expect(container.querySelector("main h1")?.textContent).toBe("Home");
  expect(container.querySelector('nav a[aria-current="page"]')?.textContent).toBe("Home");
  expect(container.querySelectorAll("[data-computer-id]")).toHaveLength(15);
});

test("redireciona o endereço antigo de laboratório para a Home", () => {
  openRoute("/laboratorio");
  expect(window.location.pathname).toBe("/");
  expect(container.querySelector("main h1")?.textContent).toBe("Home");
});

function click(element) {
  expect(element).toBeTruthy();
  act(() => element.click());
}

function button(label) {
  return [...document.querySelectorAll('[role="dialog"] button')].find((entry) => entry.textContent === label);
}

function openFixture(repository) {
  act(() => root.render(<ThemeProvider theme={theme}><HomePage repository={repository} /></ThemeProvider>));
}

test("alterna os laboratórios e mantém a numeração e as dimensões das fileiras", () => {
  openRoute("/");
  for (const [id, rows, columns] of [["delta", 3, 5], ["carnauba", 4, 6]]) {
    if (id === "carnauba") click(container.querySelector("#tab-carnauba"));
    expect(container.querySelector(`#tab-${id}`).getAttribute("aria-selected")).toBe("true");
    const groups = [...container.querySelectorAll(`#panel-${id} [role="group"]`)];
    expect(groups).toHaveLength(rows);
    groups.forEach((group, row) => {
      const stations = [...group.querySelectorAll("[data-computer-id]")];
      expect(stations).toHaveLength(columns);
      expect(stations.map((entry) => entry.dataset.computerId)).toEqual(
        Array.from({ length: columns }, (_, column) => `${id}_${String(row * columns + column + 1).padStart(2, "0")}`),
      );
    });
  }
});

test("abre e fecha o modal, exibe os avisos e atualiza imagem e indicadores de manutenção", () => {
  openFixture(createMemoryLabRepository());
  const station = container.querySelector('[data-computer-id="delta_01"]');
  click(station);
  expect(document.querySelector('[role="dialog"]').textContent).toContain("Delta Lab");
  expect(document.querySelector('[role="dialog"]').textContent).toContain("PC 01");
  click(button("Encerrar sessão"));
  expect(document.querySelector('[role="dialog"] [role="alert"]').textContent).toMatch(/Nenhuma sessão/);

  click(button("Manutenção"));
  expect(station.getAttribute("aria-label")).toBe("PC 01 — Manutenção");
  expect(station.querySelector("img").getAttribute("src")).toBe("/mesa_fix.png");
  expect(container.querySelector('[aria-label="Legenda e contagem por estado"]').textContent).toContain("1 Em manutenção");
  click(button("Iniciar sessão"));
  expect(document.querySelector('[role="dialog"] [role="alert"]').textContent).toMatch(/Retire o computador da manutenção/);
  click(button("Retirar da manutenção"));
  expect(station.getAttribute("aria-label")).toBe("PC 01 — Disponível");

  click(button("Iniciar sessão"));
  expect(document.querySelector('[role="dialog"]').textContent).toMatch(/consulta de pessoas ainda não está integrada/);
  expect(button("Consultar").disabled).toBe(true);
  expect(button("Confirmar início").disabled).toBe(true);
  click(document.querySelector('[role="dialog"] [aria-label="Fechar"]'));
  expect(document.querySelector('[role="dialog"]')).toBeNull();
});

test("consulta uma pessoa e só ocupa o PC após confirmação explícita", () => {
  const repository = createMemoryLabRepository({ people: [{ id: "test", name: "Pessoa de teste", registration: "00123" }] });
  openFixture(repository);
  const station = container.querySelector('[data-computer-id="delta_01"]');
  click(station);
  click(button("Iniciar sessão"));
  const input = document.querySelector('[role="dialog"] input');
  const setValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  function enterIdentifier(value) {
    act(() => {
      setValue.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    click(button("Consultar"));
  }
  enterIdentifier("00000");
  expect(document.querySelector('[role="dialog"] [role="alert"]').textContent).toMatch(/Pessoa não encontrada/);
  expect(button("Confirmar início").disabled).toBe(true);

  enterIdentifier("00123");
  expect(document.querySelector('[role="dialog"]').textContent).toContain("Pessoa de teste");
  expect(repository.getSnapshot().sessions).toHaveLength(0);
  click(button("Confirmar início"));
  expect(station.getAttribute("aria-label")).toBe("PC 01 — Ocupado");
  expect(station.querySelector("img").getAttribute("src")).toBe("/mesa_active.png");
  expect(repository.getSnapshot().sessions[0].status).toBe("active");

  click(button("Iniciar sessão"));
  expect(document.querySelector('[role="dialog"] [role="alert"]').textContent).toMatch(/computador está ocupado/);
  click(button("Manutenção"));
  expect(document.querySelector('[role="dialog"] [role="alert"]').textContent).toMatch(/Encerre a sessão/);
  click(button("Encerrar sessão"));
  expect(station.getAttribute("aria-label")).toBe("PC 01 — Disponível");
  expect(repository.getSnapshot().sessions[0].status).toBe("closed");
});
