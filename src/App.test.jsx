// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import App from "./App";
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

function openRoute(path, repository = createMemoryLabRepository()) {
  window.history.replaceState(null, "", path);
  act(() => root.render(<App repository={repository} />));
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
  openRoute("/", repository);
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
  expect(document.querySelector('[role="dialog"] input')).toBeTruthy();
  expect(button("Consultar").disabled).toBe(true);
  expect(button("Confirmar início").disabled).toBe(true);
  click(document.querySelector('[role="dialog"] [aria-label="Fechar"]'));
  expect(document.querySelector('[role="dialog"]')).toBeNull();
});

test("consulta uma pessoa e só ocupa o PC após confirmação explícita", () => {
  const repository = createMemoryLabRepository();
  repository.createPerson({ type: "visitor", name: "Pessoa de teste" });
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
  enterIdentifier("VIS-0002");
  expect(document.querySelector('[role="dialog"] [role="alert"]').textContent).toMatch(/Código de visitante não encontrado/);
  expect(button("Confirmar início").disabled).toBe(true);

  enterIdentifier("VIS-0001");
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

const catalog = { courses: ["Curso de teste"], shifts: ["Turno de teste"] };

function edit(input, value) {
  const prototype = Object.getPrototypeOf(input);
  Object.getOwnPropertyDescriptor(prototype, "value").set.call(input, value);
  input.dispatchEvent(new Event(input.tagName === "SELECT" ? "change" : "input", { bubbles: true }));
}

function fill(name, value) {
  const input = container.querySelector(`[name="${name}"]`);
  expect(input).toBeTruthy();
  act(() => edit(input, value));
}

function formButton(text) {
  return [...container.querySelectorAll("form button")].find((entry) => entry.textContent === text);
}

function beginContextual(registration) {
  click(container.querySelector("#tab-carnauba"));
  click(container.querySelector('[data-computer-id="carnauba_24"]'));
  click(button("Iniciar sessão"));
  act(() => edit(document.querySelector('[role="dialog"] input'), registration));
  click(button("Consultar"));
  expect(document.querySelector('[role="dialog"] h2').textContent).toBe("Aluno não encontrado");
  click(button("Cadastrar aluno"));
}

function fillAcademicFields(name) {
  fill("name", name);
  fill("course", catalog.courses[0]);
  fill("academicPeriod", "2");
  fill("courseShift", catalog.shifts[0]);
}

test("mostra a pendência de catálogo sem preencher opções institucionais fictícias", () => {
  openRoute("/cadastros");
  expect(container.textContent).toMatch(/opções oficiais de curso e turno/);
  expect(formButton("Cadastrar aluno").disabled).toBe(true);
  expect(container.querySelectorAll('select option')).toHaveLength(2);
});

test("alterna os tipos, valida obrigatórios, mostra VIS somente leitura e limpa ao cancelar", () => {
  const repository = createMemoryLabRepository({ catalog });
  openRoute("/cadastros", repository);
  click(formButton("Cadastrar aluno"));
  for (const message of ["Informe o nome completo", "Informe a matrícula", "Selecione o curso", "Informe o período acadêmico", "Selecione o turno acadêmico"]) {
    expect(container.textContent).toContain(message);
  }
  click(formButton("Visitante"));
  expect(container.querySelector('[name="registration"]')).toBeNull();
  const code = container.querySelector('input[readonly]');
  expect(code.value).toBe("VIS-0001");
  click(formButton("Cadastrar visitante"));
  expect(container.textContent).toContain("Informe o nome completo");
  fill("name", "Visitante de teste");
  click(formButton("Cancelar"));
  expect(window.location.pathname).toBe("/cadastros");
  expect(container.querySelector('[name="name"]').value).toBe("");
  expect(repository.listPeople()).toEqual([]);
  fill("name", "Visitante de teste");
  click(formButton("Cadastrar visitante"));
  expect(repository.listPeople()[0].visitorCode).toBe("VIS-0001");
  expect(container.textContent).toContain("Visitante cadastrado com o código VIS-0001.");
  expect(container.querySelector('input[readonly]').value).toBe("VIS-0002");
  click(formButton("Aluno"));
  expect(container.querySelector('[name="registration"]')).toBeTruthy();
});

test("Cadastros sinaliza matrícula inválida e duplicada durante o preenchimento", () => {
  const repository = createMemoryLabRepository({ catalog });
  openRoute("/cadastros", repository);
  fillAcademicFields("Aluno de teste");
  fill("registration", "01a");
  expect(container.textContent).toContain("Use apenas números na matrícula.");
  click(formButton("Cadastrar aluno"));
  expect(container.querySelector('[name="name"]').value).toBe("Aluno de teste");
  fill("registration", "00123");
  click(formButton("Cadastrar aluno"));
  expect(repository.listPeople()[0].registration).toBe("00123");
  fill("registration", "00123");
  expect(container.textContent).toContain("Esta matrícula já está cadastrada.");
});

test("cadastra no contexto de Carnaúba, retorna ao PC 24 e aguarda confirmação", () => {
  const repository = createMemoryLabRepository({ catalog });
  openFixture(repository);
  beginContextual("00042");
  expect(window.location.pathname).toBe("/cadastros");
  expect(formButton("Aluno").getAttribute("aria-pressed")).toBe("true");
  expect(container.querySelector('[name="registration"]').value).toBe("00042");
  expect(container.textContent).toContain("Carnaúba Lab, PC 24");
  fillAcademicFields("Aluno de teste");
  click(formButton("Cadastrar aluno"));
  expect(window.location.pathname).toBe("/");
  expect(container.querySelector("#tab-carnauba").getAttribute("aria-selected")).toBe("true");
  expect(document.querySelector('[role="dialog"] h2').textContent).toBe("Iniciar sessão · PC 24");
  expect(document.querySelector('[role="dialog"]').textContent).toContain("Aluno de teste");
  expect(repository.getSnapshot().sessions).toHaveLength(0);
  click(button("Confirmar início"));
  expect(repository.getSnapshot().sessions[0]).toMatchObject({ computerId: "carnauba_24", personIdentifier: "00042", status: "active" });
  expect(container.querySelector('[aria-label="Legenda e contagem por estado"]').textContent).toContain("1 Ocupados");
  click(button("Encerrar sessão"));
  expect(repository.getSnapshot().sessions[0]).toMatchObject({ status: "closed", durationSeconds: expect.any(Number) });
  expect(container.querySelector('[aria-label="Legenda e contagem por estado"]').textContent).toContain("0 Ocupados");
});

test("cancelamento contextual volta ao laboratório de origem sem abrir sessão ou cadastro", () => {
  const repository = createMemoryLabRepository({ catalog });
  openFixture(repository);
  beginContextual("00042");
  click(formButton("Cancelar"));
  expect(window.location.pathname).toBe("/");
  expect(container.querySelector("#tab-carnauba").getAttribute("aria-selected")).toBe("true");
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  expect(repository.listPeople()).toEqual([]);
});

test("informa indisponibilidade do computador se entrar em manutenção durante o cadastro", () => {
  const repository = createMemoryLabRepository({ catalog });
  openFixture(repository);
  beginContextual("00042");
  act(() => repository.enterMaintenance("carnauba_24"));
  fillAcademicFields("Aluno de teste");
  click(formButton("Cadastrar aluno"));
  expect(container.querySelector("#tab-carnauba").getAttribute("aria-selected")).toBe("true");
  expect(container.textContent).toContain("O PC 24 não está mais disponível");
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  expect(repository.getSnapshot().sessions).toEqual([]);
  expect(repository.findPersonByIdentifier("00042")?.name).toBe("Aluno de teste");
});
