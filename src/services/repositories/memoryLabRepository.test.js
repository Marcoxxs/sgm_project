import { describe, expect, test, vi } from "vitest";
import { sessionDurationSeconds } from "../../domain/sessions/labs";
import { createMemoryLabRepository } from "./memoryLabRepository";

const people = [
  { id: "student", name: "Pessoa de teste", registration: "00123" },
  { id: "visitor", name: "Visitante de teste", visitorCode: "VIS-A123" },
];

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

  test("distingue integração indisponível, identificador inválido e pessoa não encontrada", () => {
    const unavailable = createMemoryLabRepository();
    expect(() => unavailable.findPersonByIdentifier("00123")).toThrow(/ainda não está integrada/);
    const repository = createMemoryLabRepository({ people });
    expect(repository.findPersonByIdentifier(" 00123 ")?.id).toBe("student");
    expect(repository.findPersonByIdentifier("vis-a123")?.id).toBe("visitor");
    expect(repository.findPersonByIdentifier("123")).toBeNull();
    expect(() => repository.findPersonByIdentifier("VIS")).toThrow(/formato VIS-XXXX/);
    expect(() => repository.startSession("delta_01", "inexistente")).toThrow(/Pessoa não encontrada/);
    expect(repository.getSnapshot().sessions).toEqual([]);
  });

  test("permite entrada e saída de manutenção, registra eventos e bloqueia sessão no período", () => {
    const repository = createMemoryLabRepository({ people, now: () => 1000 });
    const listener = vi.fn();
    const unsubscribe = repository.subscribe(listener);
    repository.enterMaintenance("delta_01");
    expect(repository.getSnapshot().computers[0].status).toBe("maintenance");
    expect(() => repository.startSession("delta_01", "student")).toThrow(/Retire o computador da manutenção/);
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
    const repository = createMemoryLabRepository({ people });
    repository.startSession("delta_01", "student");
    expect(() => repository.startSession("delta_01", "visitor")).toThrow(/está ocupado/);
    expect(() => repository.startSession("carnauba_01", "student")).toThrow(/já possui uma sessão ativa/);
    expect(() => repository.enterMaintenance("delta_01")).toThrow(/Encerre a sessão/);
    expect(repository.getSnapshot().sessions).toHaveLength(1);
    expect(repository.getSnapshot().maintenanceEvents).toEqual([]);
  });

  test("encerra a sessão, libera o PC e a pessoa e mantém o histórico e a duração", () => {
    let currentTime = 1000;
    const repository = createMemoryLabRepository({ people, now: () => currentTime });
    const active = repository.startSession("delta_01", "student");
    expect(active).toMatchObject({
      personId: "student", labId: "delta", computerId: "delta_01", pcNumber: 1,
      status: "active", startedAt: 1000, endedAt: null,
    });
    expect(repository.getSnapshot().computers[0]).toMatchObject({ status: "occupied", activeSessionId: active.id });
    currentTime = 6750;
    const closed = repository.endSession("delta_01");
    expect(closed).toMatchObject({ id: active.id, status: "closed", endedAt: 6750, durationSeconds: 5 });
    expect(repository.getSnapshot().computers[0]).toMatchObject({ status: "available", activeSessionId: null });
    expect(() => repository.endSession("delta_01")).toThrow(/Nenhuma sessão/);
    const next = repository.startSession("carnauba_01", "student");
    expect(repository.getSnapshot().sessions).toEqual([closed, next]);
    expect(sessionDurationSeconds(1000, 999)).toBe(0);
  });
});
