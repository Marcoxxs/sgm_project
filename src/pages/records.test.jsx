// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import App from "../App";
import { createMemoryLabRepository } from "../services/repositories/memoryLabRepository";

const baseTime = Date.UTC(2026, 10, 20, 12, 0, 0);

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
  vi.restoreAllMocks();
});

function openRoute(path, repository) {
  window.history.replaceState(null, "", path);
  act(() => root.render(<App repository={repository} />));
}

function click(element) {
  expect(element).toBeTruthy();
  act(() => element.click());
}

function fillField(name, value) {
  const input = container.querySelector(`[name="${name}"]`);
  expect(input).toBeTruthy();
  act(() => {
    const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), "value").set;
    setter.call(input, value);
    input.dispatchEvent(new Event(input.tagName === "SELECT" ? "change" : "input", { bubbles: true }));
  });
}

function dialogButton(text) {
  return [...document.querySelectorAll('[role="dialog"] button')].find((entry) => entry.textContent === text);
}

function formButton(text) {
  return [...container.querySelectorAll("button")].find((entry) => entry.textContent === text);
}

function bodyRows() {
  return [...container.querySelectorAll('table[aria-label="Pessoas cadastradas"] tbody tr')];
}

function rowFor(name) {
  return bodyRows().find((row) => row.textContent.includes(name));
}

function listedNames() {
  return bodyRows().map((row) => row.querySelector("a")?.textContent).filter(Boolean);
}

function historyRows() {
  return [...container.querySelectorAll('table[aria-label="Histórico de utilização"] tbody tr')];
}

function buildRepository() {
  const clock = { value: baseTime };
  const repository = createMemoryLabRepository({ now: () => clock.value });
  const ana = repository.createPerson({
    type: "student", name: "Ana Beatriz", registration: "000123",
    course: "ciencias-biologicas", academicPeriod: "3", courseShift: "manha",
  });
  const bruno = repository.createPerson({
    type: "student", name: "Bruno Costa", registration: "000045",
    course: "direito", academicPeriod: "1", courseShift: "noite",
  });
  const carlos = repository.createPerson({ type: "visitor", name: "Carlos Pereira" });
  const zelia = repository.createPerson({ type: "visitor", name: "Zélia Ramos" });

  repository.startSession("delta_01", ana.id);
  clock.value = baseTime + 3_600_000;
  repository.endSession("delta_01");
  clock.value = baseTime + 7_200_000;
  repository.startSession("carnauba_03", ana.id);
  clock.value = baseTime + 9_000_000;
  repository.endSession("carnauba_03");
  clock.value = baseTime + 10_800_000;
  repository.startSession("delta_05", bruno.id);

  return { repository, clock, ana, bruno, carlos, zelia };
}

test("lista uma linha por pessoa, inclusive sem acessos, com os valores padrão", () => {
  const { repository } = buildRepository();
  openRoute("/registros", repository);

  expect(container.querySelector("main h1")?.textContent).toBe("Registros de Acesso");
  expect(bodyRows()).toHaveLength(4);
  expect(listedNames()).toEqual(["Ana Beatriz", "Bruno Costa", "Carlos Pereira", "Zélia Ramos"]);

  const zeliaRow = rowFor("Zélia Ramos");
  expect(zeliaRow.textContent).toContain("Sem acessos");
  expect(zeliaRow.textContent).toContain("0h");
  expect(zeliaRow.textContent.match(/—/g)).toHaveLength(2);

  expect(container.querySelector('[aria-label="Matrícula 000123"]')?.textContent).toBe("000123");
  expect(container.querySelector('[aria-label="Código VIS-0002"]')?.textContent).toBe("VIS-0002");
});

test("busca por nome sem acento ou caixa, matrícula e código VIS com resultados parciais", () => {
  const { repository } = buildRepository();
  openRoute("/registros", repository);

  fillField("search", "BEATRIZ");
  click(formButton("Filtrar"));
  expect(listedNames()).toEqual(["Ana Beatriz"]);

  fillField("search", "zelia");
  click(formButton("Filtrar"));
  expect(listedNames()).toEqual(["Zélia Ramos"]);

  fillField("search", "000045");
  click(formButton("Filtrar"));
  expect(listedNames()).toEqual(["Bruno Costa"]);

  fillField("search", "vis-0001");
  click(formButton("Filtrar"));
  expect(listedNames()).toEqual(["Carlos Pereira"]);
});

test("filtra por curso e limpa os filtros restaurando a ordenação alfabética", () => {
  const { repository } = buildRepository();
  openRoute("/registros", repository);

  fillField("course", "ciencias-biologicas");
  click(formButton("Filtrar"));
  expect(listedNames()).toEqual(["Ana Beatriz"]);

  click(formButton("Limpar filtros"));
  expect(listedNames()).toEqual(["Ana Beatriz", "Bruno Costa", "Carlos Pereira", "Zélia Ramos"]);
  expect(container.querySelector('[name="course"]').value).toBe("");
  expect(container.querySelector('[name="access"]').value).toBe("");
  expect(container.querySelector('[name="search"]').value).toBe("");
});

test("ordena por acessos recentes e antigos mantendo quem não acessou no final", () => {
  const { repository } = buildRepository();
  openRoute("/registros", repository);

  fillField("access", "recent");
  click(formButton("Filtrar"));
  expect(listedNames()).toEqual(["Bruno Costa", "Ana Beatriz", "Carlos Pereira", "Zélia Ramos"]);

  fillField("access", "oldest");
  click(formButton("Filtrar"));
  expect(listedNames()).toEqual(["Ana Beatriz", "Bruno Costa", "Carlos Pereira", "Zélia Ramos"]);
});

test("mostra laboratório, computador, último acesso e tempo total do acesso mais recente", () => {
  const { repository } = buildRepository();
  openRoute("/registros", repository);

  const anaRow = rowFor("Ana Beatriz");
  expect(anaRow.textContent).toContain("Carnaúba Lab");
  expect(anaRow.textContent).toContain("PC 03");
  expect(anaRow.textContent).toContain("1h 30min");
  expect(anaRow.textContent).toContain("20/11/2026");
  expect(anaRow.textContent).toContain("11:00");

  const brunoRow = rowFor("Bruno Costa");
  expect(brunoRow.textContent).toContain("Delta Lab");
  expect(brunoRow.textContent).toContain("PC 05");
  expect(brunoRow.textContent).toContain("0h");
});

test("abre os detalhes com identificação, dados acadêmicos e histórico individual", () => {
  const { repository, ana } = buildRepository();
  openRoute("/registros", repository);

  click(rowFor("Ana Beatriz").querySelector("a"));
  expect(window.location.pathname).toBe(`/registros/${ana.id}`);
  expect(container.querySelector("main h1")?.textContent).toBe("Ana Beatriz");
  expect(container.textContent).toContain("Aluno");
  expect(container.textContent).toContain("000123");
  expect(container.textContent).toContain("Ciências Biológicas");
  expect(container.textContent).toContain("3º período");
  expect(container.textContent).toContain("Manhã");
  expect(container.textContent).toContain("Histórico de utilização");

  const rows = historyRows();
  expect(rows).toHaveLength(2);
  expect(rows[0].textContent).toContain("Carnaúba Lab");
  expect(rows[0].textContent).toContain("PC 03");
  expect(rows[0].textContent).toContain("11:00");
  expect(rows[0].textContent).toContain("11:30");
  expect(rows[0].textContent).toContain("30min");
  expect(rows[1].textContent).toContain("Delta Lab");
  expect(rows[1].textContent).toContain("PC 01");
  expect(rows[1].textContent).toContain("1h");
  expect(container.textContent).toContain("1h 30min");
});

test("identifica sessão ativa sem inventar saída nem duração", () => {
  const { repository, bruno } = buildRepository();
  openRoute(`/registros/${bruno.id}`, repository);

  const rows = historyRows();
  expect(rows).toHaveLength(1);
  expect(rows[0].textContent).toContain("Em andamento");
  expect(rows[0].textContent).not.toContain("Saída");
  expect(container.textContent).toContain("0h");
});

test("edita os dados cadastrais preservando o histórico e a identificação da sessão", () => {
  const { repository, ana } = buildRepository();
  openRoute(`/registros/${ana.id}`, repository);

  click(formButton("Editar dados"));
  expect(container.querySelector('[name="name"]').value).toBe("Ana Beatriz");
  fillField("name", "Ana Beatriz Souza");
  fillField("registration", "000999");
  fillField("course", "ciencias-da-computacao");
  fillField("academicPeriod", "4");
  fillField("courseShift", "tarde");
  click(formButton("Concluir"));

  expect(container.querySelector('[name="name"]')).toBeNull();
  expect(container.textContent).toContain("Ana Beatriz Souza");
  expect(container.textContent).toContain("Ciências da Computação");
  expect(container.textContent).toContain("4º período");
  expect(container.textContent).toContain("Tarde");
  expect(repository.getPersonById(ana.id)).toMatchObject({
    id: ana.id,
    name: "Ana Beatriz Souza",
    registration: "000999",
    course: "ciencias-da-computacao",
    academicPeriod: 4,
    courseShift: "tarde",
  });
  expect(repository.getPersonHistory(ana.id)).toHaveLength(2);
  expect(repository.getPersonHistory(ana.id)[0].personIdentifier).toBe("000123");
  expect(historyRows()).toHaveLength(2);
});

test("bloqueia matrícula duplicada durante a edição sem perder os campos preenchidos", () => {
  const { repository, ana, bruno } = buildRepository();
  openRoute(`/registros/${bruno.id}`, repository);

  click(formButton("Editar dados"));
  fillField("registration", ana.registration);
  click(formButton("Concluir"));

  expect(container.textContent).toContain("Esta matrícula já está cadastrada.");
  expect(container.querySelector('[name="registration"]')).toBeTruthy();
  expect(container.querySelector('[name="name"]').value).toBe("Bruno Costa");
  expect(repository.getPersonById(bruno.id).registration).toBe("000045");
});

test("mantém o código VIS imutável e edita somente o nome do visitante", () => {
  const { repository, carlos } = buildRepository();
  openRoute(`/registros/${carlos.id}`, repository);

  click(formButton("Editar dados"));
  expect(container.querySelector('[name="registration"]')).toBeNull();
  expect(container.querySelector('[name="course"]')).toBeNull();
  expect(container.querySelector('[name="academicPeriod"]')).toBeNull();
  expect(container.querySelector('[name="courseShift"]')).toBeNull();
  expect(container.querySelector('[aria-label="Código VIS-0001"]')?.textContent).toBe("VIS-0001");

  fillField("name", "Carlos Pereira Lima");
  click(formButton("Concluir"));

  expect(repository.getPersonById(carlos.id)).toMatchObject({
    name: "Carlos Pereira Lima",
    visitorCode: "VIS-0001",
  });
  expect(container.textContent).toContain("Carlos Pereira Lima");
  expect(container.textContent).toContain("Esta pessoa ainda não possui acessos registrados.");
});

test("pede confirmação ao cancelar a edição com alterações não salvas", () => {
  const { repository, ana } = buildRepository();
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
  openRoute(`/registros/${ana.id}`, repository);

  click(formButton("Editar dados"));
  fillField("name", "Nome temporário");
  click(formButton("Cancelar"));
  expect(confirm).toHaveBeenCalledWith("Descartar as alterações não salvas?");
  expect(container.querySelector('[name="name"]')).toBeTruthy();
  expect(container.querySelector('[name="name"]').value).toBe("Nome temporário");

  confirm.mockReturnValue(true);
  click(formButton("Cancelar"));
  expect(container.querySelector('[name="name"]')).toBeNull();
  expect(container.querySelector("main h1")?.textContent).toBe("Ana Beatriz");
  expect(repository.getPersonById(ana.id).name).toBe("Ana Beatriz");
});

test("apresenta pessoa não encontrada e permite voltar aos Registros", () => {
  const { repository } = buildRepository();
  openRoute("/registros/pessoa-inexistente", repository);

  expect(container.querySelector("main h1")?.textContent).toBe("Pessoa não encontrada");
  click(formButton("Voltar aos Registros"));
  expect(window.location.pathname).toBe("/registros");
  expect(container.querySelector("main h1")?.textContent).toBe("Registros de Acesso");
});

test("pagina a tabela e diferencia ausência de cadastros de ausência de resultados", () => {
  const repository = createMemoryLabRepository();
  openRoute("/registros", repository);
  expect(container.textContent).toContain("Nenhuma pessoa cadastrada");

  act(() => {
    for (let index = 1; index <= 12; index++) {
      repository.createPerson({ type: "visitor", name: `Visitante ${String(index).padStart(2, "0")}` });
    }
  });
  expect(bodyRows()).toHaveLength(10);
  expect(container.textContent).toContain("1–10 de 12");

  click(container.querySelector('[aria-label="Go to next page"]'));
  expect(bodyRows()).toHaveLength(2);

  fillField("search", "ninguém-com-esse-nome");
  click(formButton("Filtrar"));
  expect(container.textContent).toContain("Nenhuma pessoa encontrada para os filtros selecionados.");

  click(formButton("Limpar filtros"));
  expect(bodyRows()).toHaveLength(10);
});

test("integra Home, Registros e edição preservando o histórico", () => {
  const clock = { value: baseTime };
  const repository = createMemoryLabRepository({ now: () => clock.value });
  const person = repository.createPerson({
    type: "student", name: "Integração Aluno", registration: "000777",
    course: "ciencias-da-computacao", academicPeriod: "3", courseShift: "tarde",
  });
  openRoute("/", repository);

  click(container.querySelector('[data-computer-id="delta_01"]'));
  click(dialogButton("Iniciar sessão"));
  const dialogInput = document.querySelector('[role="dialog"] input');
  act(() => {
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set.call(dialogInput, "000777");
    dialogInput.dispatchEvent(new Event("input", { bubbles: true }));
  });
  click(dialogButton("Consultar"));
  click(dialogButton("Confirmar início"));
  expect(container.querySelector('[data-computer-id="delta_01"]').getAttribute("aria-label")).toBe("PC 01 — Ocupado");
  expect(repository.getSnapshot().sessions).toHaveLength(1);

  click(container.querySelector('nav a[href="/registros"]'));
  expect(window.location.pathname).toBe("/registros");
  expect(rowFor("Integração Aluno").textContent).toContain("Delta Lab");
  expect(rowFor("Integração Aluno").textContent).toContain("PC 01");
  expect(rowFor("Integração Aluno").textContent).toContain("0h");

  click(rowFor("Integração Aluno").querySelector("a"));
  expect(window.location.pathname).toBe(`/registros/${person.id}`);
  expect(historyRows()).toHaveLength(1);
  expect(historyRows()[0].textContent).toContain("Em andamento");

  clock.value = baseTime + 120_000;
  click(container.querySelector('nav a[href="/"]'));
  click(container.querySelector('[data-computer-id="delta_01"]'));
  click(dialogButton("Encerrar sessão"));
  expect(repository.getSnapshot().sessions[0]).toMatchObject({ status: "closed", durationSeconds: 120 });

  click(container.querySelector('nav a[href="/registros"]'));
  expect(window.location.pathname).toBe("/registros");
  expect(rowFor("Integração Aluno").textContent).toContain("2min");
  expect(rowFor("Integração Aluno").textContent).toContain("20/11/2026");

  click(rowFor("Integração Aluno").querySelector("a"));
  expect(historyRows()[0].textContent).toContain("2min");

  click(formButton("Editar dados"));
  fillField("name", "Integração Atualizada");
  fillField("registration", "000888");
  click(formButton("Concluir"));
  expect(historyRows()).toHaveLength(1);
  expect(repository.getPersonHistory(person.id)[0].personIdentifier).toBe("000777");

  click(formButton("Voltar"));
  expect(window.location.pathname).toBe("/registros");
  fillField("search", "000888");
  click(formButton("Filtrar"));
  expect(listedNames()).toEqual(["Integração Atualizada"]);
});
