import { describe, expect, test, vi } from "vitest";
import { sessionDurationSeconds } from "../../domain/sessions/labs";
import { createMemoryLabRepository } from "./memoryLabRepository";

const catalog = { courses: ["Curso de teste"], shifts: ["Turno de teste"] };
const studentDraft = {
  type: "student", name: "Pessoa de teste", registration: "00123",
  course: catalog.courses[0], academicPeriod: "1", courseShift: catalog.shifts[0],
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
