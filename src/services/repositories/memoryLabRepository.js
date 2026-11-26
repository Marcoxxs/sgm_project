import {
  createComputers, LabOperationError, sessionDurationSeconds, validateSessionStart,
} from "../../domain/sessions/labs";

const normalizeIdentifier = (value) => value.trim().toUpperCase();

export function createMemoryLabRepository({ people, now = Date.now } = {}) {
  const peopleById = new Map();
  const peopleByIdentifier = new Map();

  for (const person of people ?? []) {
    if (person.active === false) continue;
    const identifier = normalizeIdentifier(person.registration ?? person.visitorCode);
    const record = Object.freeze({ id: person.id, name: person.name, identifier });
    peopleById.set(record.id, record);
    peopleByIdentifier.set(identifier, record);
  }

  const listeners = new Set();
  let nextSessionId = 0;
  let snapshot = Object.freeze({
    computers: Object.freeze(createComputers().map(Object.freeze)),
    sessions: Object.freeze([]),
    maintenanceEvents: Object.freeze([]),
    peopleAvailable: people !== undefined,
  });

  function publish(computer, changes = {}) {
    snapshot = Object.freeze({
      ...snapshot,
      ...changes,
      computers: Object.freeze(snapshot.computers.map((entry) =>
        entry.id === computer.id ? Object.freeze(computer) : entry,
      )),
    });
    listeners.forEach((listener) => listener());
  }

  function getComputer(computerId) {
    const computer = snapshot.computers.find(({ id }) => id === computerId);
    if (!computer) throw new LabOperationError("Computador não encontrado.");
    return computer;
  }

  function setMaintenance(computerId, entering) {
    const computer = getComputer(computerId);
    if (computer.status === "occupied") {
      throw new LabOperationError("Encerre a sessão antes de colocar o computador em manutenção.");
    }
    if (computer.status !== (entering ? "available" : "maintenance")) {
      throw new LabOperationError(entering
        ? "O computador já está em manutenção."
        : "O computador não está em manutenção.");
    }
    const event = Object.freeze({
      computerId,
      action: entering ? "entered" : "exited",
      timestamp: now(),
    });
    publish({ ...computer, status: entering ? "maintenance" : "available" }, {
      maintenanceEvents: Object.freeze([...snapshot.maintenanceEvents, event]),
    });
  }

  return {
    getSnapshot: () => snapshot,

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    findPersonByIdentifier(value) {
      if (!snapshot.peopleAvailable) {
        throw new LabOperationError("A consulta de pessoas ainda não está integrada ao cadastro.");
      }
      const identifier = normalizeIdentifier(value);
      if (!/^(?:\d+|VIS-[A-Z0-9]{4})$/.test(identifier)) {
        throw new LabOperationError("Informe uma matrícula numérica ou um código no formato VIS-XXXX.");
      }
      return peopleByIdentifier.get(identifier) ?? null;
    },

    startSession(computerId, personId) {
      const computer = getComputer(computerId);
      validateSessionStart(computer);
      const person = peopleById.get(personId);
      if (!person) throw new LabOperationError("Pessoa não encontrada no cadastro.");
      if (snapshot.sessions.some((session) => session.personId === personId && session.status === "active")) {
        throw new LabOperationError("Esta pessoa já possui uma sessão ativa.");
      }
      const session = Object.freeze({
        id: `session-${++nextSessionId}`,
        personId,
        personName: person.name,
        personIdentifier: person.identifier,
        labId: computer.labId,
        computerId,
        pcNumber: computer.number,
        status: "active",
        startedAt: now(),
        endedAt: null,
      });
      publish({ ...computer, status: "occupied", activeSessionId: session.id }, {
        sessions: Object.freeze([...snapshot.sessions, session]),
      });
      return session;
    },

    endSession(computerId) {
      const computer = getComputer(computerId);
      const active = snapshot.sessions.find((session) =>
        session.id === computer.activeSessionId && session.status === "active",
      );
      if (!active) throw new LabOperationError("Nenhuma sessão foi iniciada neste computador.");
      const endedAt = Math.max(now(), active.startedAt);
      const session = Object.freeze({
        ...active,
        status: "closed",
        endedAt,
        durationSeconds: sessionDurationSeconds(active.startedAt, endedAt),
      });
      publish({ ...computer, status: "available", activeSessionId: null }, {
        sessions: Object.freeze(snapshot.sessions.map((entry) => entry.id === session.id ? session : entry)),
      });
      return session;
    },

    enterMaintenance: (computerId) => setMaintenance(computerId, true),
    exitMaintenance: (computerId) => setMaintenance(computerId, false),
  };
}

export const memoryLabRepository = createMemoryLabRepository();
