import { describe, expect, test, vi } from "vitest";
import { academicCatalog } from "../../domain/people/academicCatalog";
import { sessionDurationSeconds } from "../../domain/sessions/labs";
import { createMemoryLabRepository } from "./memoryLabRepository";

const catalog = {
  courses: [{ id: "curso-teste", label: "Curso de teste" }],
  shifts: [{ id: "turno-teste", label: "Turno de teste" }],
  periods: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
};
const studentDraft = {
  type: "student", name: "Pessoa de teste", registration: "00123",
  course: "curso-teste", academicPeriod: "1", courseShift: "turno-teste",
};

function withPeople(now) {
  const repository = createMemoryLabRepository({ catalog, now });
  const student = repository.createPerson(studentDraft);
  const visitor = repository.createPerson({ type: "visitor", name: "Visitante de teste" });
  return { repository, student, visitor };
}

describe("repositório de laboratório em memória", () => {
  test("inicializa 15 PCs no Delta e 24 em Carnaúba com identificadores únicos", () => {
    const { computers } = createMemoryLabRepository().getSnapshot();
    for (const [labId, count] of [["delta", 15], ["carnauba", 24]]) {
      const lab = computers.filter((computer) => computer.labId === labId);
      expect(lab.map(({ number }) => number)).toEqual(Array.from({ length: count }, (_, index) => index + 1));
      expect(lab.every(({ status, id }) => status === "available" && id.startsWith(`${labId}_`))).toBe(true);
    }
    expect(new Set(computers.map(({ id }) => id)).size).toBe(39);
  });

  test("distingue identificador inválido e pessoa não encontrada, inclusive sem cadastros", () => {
    expect(createMemoryLabRepository().findPersonByIdentifier("00123")).toBeNull();
    const { repository, student, visitor } = withPeople();
    expect(repository.findPersonByIdentifier(" 00123 ")).toBe(student);
    expect(repository.findPersonByIdentifier("vis-0001")).toBe(visitor);
    expect(repository.findPersonByIdentifier("123")).toBeNull();
    expect(() => repository.findPersonByIdentifier("VIS")).toThrow(/formato VIS-0001/);
    expect(() => repository.startSession("delta_01", "inexistente")).toThrow(/Pessoa não encontrada/);
    expect(repository.getSnapshot().sessions).toEqual([]);
  });

  test("permite entrada e saída de manutenção, registra eventos e bloqueia sessão no período", () => {
    const { repository, student } = withPeople(() => 1000);
    const listener = vi.fn();
    const unsubscribe = repository.subscribe(listener);
    repository.enterMaintenance("delta_01");
    expect(repository.getSnapshot().computers[0].status).toBe("maintenance");
    expect(() => repository.startSession("delta_01", student.id)).toThrow(/Retire o computador da manutenção/);
    expect(() => repository.endSession("delta_01")).toThrow(/Nenhuma sessão/);
    expect(() => repository.enterMaintenance("delta_01")).toThrow(/já está em manutenção/);
    repository.exitMaintenance("delta_01");
    expect(repository.getSnapshot().computers[0].status).toBe("available");
    expect(repository.getSnapshot().maintenanceEvents).toEqual([
      { computerId: "delta_01", action: "entered", timestamp: 1000 },
      { computerId: "delta_01", action: "exited", timestamp: 1000 },
    ]);
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    repository.enterMaintenance("delta_01");
    expect(listener).toHaveBeenCalledTimes(2);
  });

  test("impede sessões duplicadas por PC e por pessoa, inclusive entre laboratórios", () => {
    const { repository, student, visitor } = withPeople();
    repository.startSession("delta_01", student.id);
    expect(() => repository.startSession("delta_01", visitor.id)).toThrow(/está ocupado/);
    expect(() => repository.startSession("carnauba_01", student.id)).toThrow(/já possui uma sessão ativa/);
    expect(() => repository.enterMaintenance("delta_01")).toThrow(/Encerre a sessão/);
    expect(repository.getSnapshot().sessions).toHaveLength(1);
    expect(repository.getSnapshot().maintenanceEvents).toEqual([]);
  });

  test("encerra a sessão, libera o PC e a pessoa e mantém o histórico e a duração", () => {
    let currentTime = 1000;
    const { repository, student } = withPeople(() => currentTime);
    const active = repository.startSession("delta_01", student.id);
    expect(active).toMatchObject({
      personId: student.id, labId: "delta", computerId: "delta_01", pcNumber: 1,
      status: "active", startedAt: 1000, endedAt: null,
    });
    expect(repository.getSnapshot().computers[0]).toMatchObject({ status: "occupied", activeSessionId: active.id });
    currentTime = 6750;
    const closed = repository.endSession("delta_01");
    expect(closed).toMatchObject({ id: active.id, status: "closed", endedAt: 6750, durationSeconds: 5 });
    expect(repository.getSnapshot().computers[0]).toMatchObject({ status: "available", activeSessionId: null });
    expect(() => repository.endSession("delta_01")).toThrow(/Nenhuma sessão/);
    const next = repository.startSession("carnauba_01", student.id);
    expect(repository.getSnapshot().sessions).toEqual([closed, next]);
    expect(sessionDurationSeconds(1000, 999)).toBe(0);
  });
});

describe("cadastro em memória", () => {
  test("valida campos obrigatórios e opções oficiais na gravação", () => {
    const repository = createMemoryLabRepository({ catalog });
    expect(() => repository.createPerson({ type: "student" })).toThrow(expect.objectContaining({
      fields: expect.objectContaining({
        name: expect.any(String), registration: expect.any(String), course: expect.any(String),
        academicPeriod: expect.any(String), courseShift: expect.any(String),
      }),
    }));
    expect(() => repository.createPerson({ ...studentDraft, academicPeriod: "2.5", course: "inválido" }))
      .toThrow(expect.objectContaining({ fields: expect.objectContaining({
        academicPeriod: expect.any(String), course: expect.any(String),
      }) }));
    expect(repository.listPeople()).toEqual([]);
    expect(() => createMemoryLabRepository().createPerson(studentDraft)).toThrow(/Confira os campos/);
  });

  test("preserva os zeros, bloqueia matrículas duplicadas e mantém o histórico em uma edição", () => {
    const repository = createMemoryLabRepository({ catalog });
    const student = repository.createPerson(studentDraft);
    expect(student).toMatchObject({ type: "student", registration: "00123", academicPeriod: 1 });
    expect(repository.isRegistrationTaken("00123")).toBe(true);
    expect(() => repository.createPerson({ ...studentDraft, name: "Outro nome" })).toThrow(expect.objectContaining({
      fields: { registration: "Esta matrícula já está cadastrada." },
    }));
    expect(() => repository.createPerson({ ...studentDraft, registration: "12a" })).toThrow(expect.objectContaining({
      fields: { registration: "Use apenas números na matrícula." },
    }));
    const another = repository.createPerson({ ...studentDraft, registration: "123" });
    const session = repository.startSession("delta_01", student.id);
    const updated = repository.updatePerson(student.id, { registration: "00124", name: "Nome atualizado" });
    expect(updated.id).toBe(student.id);
    expect(() => repository.updatePerson(another.id, { registration: "00124" })).toThrow(/Confira os campos/);
    expect(repository.findPersonByIdentifier("00123")).toBeNull();
    expect(repository.findPersonByIdentifier("00124")).toBe(updated);
    expect(repository.getSnapshot().sessions[0]).toBe(session);
    expect(session.personIdentifier).toBe("00123");
  });

  test("gera VIS sequencial após cadastro válido, com nome repetido e código imutável", () => {
    const repository = createMemoryLabRepository();
    expect(repository.getNextVisitorCode()).toBe("VIS-0001");
    expect(() => repository.createPerson({ type: "visitor", name: " " })).toThrow(/Confira os campos/);
    const first = repository.createPerson({ type: "visitor", name: "Nome de teste", visitorCode: "VIS-4321" });
    const second = repository.createPerson({ type: "visitor", name: first.name });
    const third = repository.createPerson({ type: "visitor", name: first.name });
    expect([first.visitorCode, second.visitorCode, third.visitorCode]).toEqual(["VIS-0001", "VIS-0002", "VIS-0003"]);
    expect(first.id).not.toBe(second.id);
    expect(() => { first.visitorCode = "VIS-8888"; }).toThrow(TypeError);
    expect(repository.updatePerson(first.id, { visitorCode: "VIS-8888" }).visitorCode).toBe("VIS-0001");
    expect(repository.findPersonByIdentifier("VIS-8888")).toBeNull();
    expect(repository.listPeople()).toHaveLength(3);
    expect(repository.getNextVisitorCode()).toBe("VIS-0004");
  });
});

describe("catálogo acadêmico oficial", () => {
  test("contém os 13 cursos, três turnos e dez períodos com identificadores estáveis", () => {
    expect(academicCatalog.courses).toHaveLength(13);
    expect(academicCatalog.courses.map(({ label }) => label)).toEqual([
      "Ciências Biológicas",
      "Ciências da Computação",
      "Ciências Sociais",
      "Direito",
      "Enfermagem",
      "Engenharia Agronômica",
      "Filosofia",
      "História",
      "Letras – Inglês",
      "Letras – Português",
      "Odontologia",
      "Pedagogia",
      "Tecnólogo em Sistemas de Computação (TSC)",
    ]);
    expect(academicCatalog.shifts.map(({ label }) => label)).toEqual(["Manhã", "Tarde", "Noite"]);
    expect(academicCatalog.shifts.map(({ id }) => id)).not.toContain("integral");
    expect(academicCatalog.periods).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    const ids = academicCatalog.courses.map(({ id }) => id);
    expect(new Set(ids).size).toBe(13);
    expect(ids.every((id) => /^[a-z-]+$/.test(id))).toBe(true);
    expect(ids).toContain("ciencias-da-computacao");
    expect(ids).toContain("tecnologo-sistemas-computacao");
    expect(ids.filter((id) => id.includes("computacao"))).toEqual([
      "ciencias-da-computacao",
      "tecnologo-sistemas-computacao",
    ]);
  });

  test("mantém Ciências da Computação e TSC como cursos distintos no cadastro", () => {
    const repository = createMemoryLabRepository();
    const bacharelado = repository.createPerson({
      ...studentDraft,
      course: "ciencias-da-computacao",
      academicPeriod: "2",
      courseShift: "manha",
      registration: "00001",
    });
    const tecnologo = repository.createPerson({
      ...studentDraft,
      course: "tecnologo-sistemas-computacao",
      academicPeriod: "2",
      courseShift: "manha",
      registration: "00002",
    });
    expect(bacharelado.course).toBe("ciencias-da-computacao");
    expect(tecnologo.course).toBe("tecnologo-sistemas-computacao");
    expect(repository.listPeople()).toHaveLength(2);
  });
});

describe("histórico e indicadores por pessoa", () => {
  test("resume último acesso, total de acessos e soma das durações encerradas", () => {
    let currentTime = 0;
    const repository = createMemoryLabRepository({ catalog, now: () => currentTime });
    const student = repository.createPerson(studentDraft);
    const visitor = repository.createPerson({ type: "visitor", name: "Visitante sem acesso" });

    currentTime = 1_000;
    repository.startSession("delta_01", student.id);
    currentTime = 3_601_000;
    repository.endSession("delta_01");
    currentTime = 7_200_000;
    repository.startSession("carnauba_03", student.id);
    currentTime = 9_000_000;
    repository.endSession("carnauba_03");
    currentTime = 10_000_000;
    const active = repository.startSession("delta_02", student.id);

    const usage = repository.getPersonUsage(student.id);
    expect(usage.accessCount).toBe(3);
    expect(usage.totalSeconds).toBe(5400);
    expect(usage.lastSession).toMatchObject({ id: active.id, labId: "delta", pcNumber: 2, status: "active" });
    expect(usage.history.map(({ id }) => id)).toEqual([active.id, "session-2", "session-1"]);
    expect(repository.getPersonHistory(student.id)).toEqual(usage.history);
    expect(repository.getPersonUsage("person-inexistente")).toBeNull();
    expect(repository.getPersonById("person-inexistente")).toBeNull();

    const summaries = repository.listPersonSummaries();
    expect(summaries.find(({ person }) => person.id === visitor.id)).toMatchObject({
      accessCount: 0, totalSeconds: 0, lastSession: null,
    });
    expect(summaries.find(({ person }) => person.id === student.id)).toMatchObject({
      accessCount: 3, totalSeconds: 5400,
    });
  });

  test("preserva o snapshot acadêmico da sessão ao editar a pessoa", () => {
    const repository = createMemoryLabRepository({ catalog, now: () => 1_000 });
    const student = repository.createPerson(studentDraft);
    const session = repository.startSession("delta_01", student.id);
    expect(session.personAcademicSnapshot).toEqual({
      type: "student", course: "curso-teste", academicPeriod: 1, courseShift: "turno-teste",
    });

    repository.updatePerson(student.id, {
      name: "Nome atualizado", academicPeriod: "5", courseShift: "turno-teste",
    });
    const stored = repository.getSnapshot().sessions[0];
    expect(stored).toBe(session);
    expect(stored.personName).toBe("Pessoa de teste");
    expect(stored.personIdentifier).toBe("00123");
    expect(stored.personAcademicSnapshot).toMatchObject({ course: "curso-teste", academicPeriod: 1 });
    expect(repository.getPersonById(student.id).academicPeriod).toBe(5);
  });
});
