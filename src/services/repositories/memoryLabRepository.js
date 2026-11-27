import { academicCatalog } from "../../domain/people/academicCatalog";
import {
  isRegistration, isVisitorCode, normalizeIdentifier, normalizePerson,
  personIdentifier, PersonValidationError, validatePerson,
} from "../../domain/people/people";
import { personSessions, summarizePerson } from "../../domain/people/personUsage";
import {
  createComputers, LabOperationError, sessionDurationSeconds, validateSessionStart,
} from "../../domain/sessions/labs";

export function createMemoryLabRepository({ catalog = academicCatalog, now = Date.now } = {}) {
  const academicOptions = Object.freeze({
    courses: Object.freeze([...catalog.courses]),
    shifts: Object.freeze([...catalog.shifts]),
    periods: Object.freeze([...(catalog.periods ?? [])]),
  });
  const listeners = new Set();
  let nextSessionId = 0;
  let lastPersonId = 0;
  let lastVisitorNumber = 0;
  let snapshot = Object.freeze({
    computers: Object.freeze(createComputers().map(Object.freeze)),
    sessions: Object.freeze([]),
    maintenanceEvents: Object.freeze([]),
    people: Object.freeze([]),
  });

  function publish(changes) {
    snapshot = Object.freeze({ ...snapshot, ...changes });
    listeners.forEach((listener) => listener());
  }

  function updateComputer(computer, changes) {
    publish({
      ...changes,
      computers: Object.freeze(snapshot.computers.map((entry) =>
        entry.id === computer.id ? Object.freeze(computer) : entry,
      )),
    });
  }

  function getNextVisitorCode() {
    return lastVisitorNumber < 9999
      ? `VIS-${String(lastVisitorNumber + 1).padStart(4, "0")}`
      : null;
  }

  function isRegistrationTaken(value, exceptId) {
    const registration = normalizeIdentifier(value);
    return snapshot.people.some((person) => person.registration === registration && person.id !== exceptId);
  }

  function savePerson(input, existing) {
    const type = existing?.type ?? input.type;
    if (type !== "student" && type !== "visitor") {
      throw new LabOperationError("Selecione Aluno ou Visitante.");
    }
    const draft = normalizePerson({ ...input, type });
    const errors = validatePerson(draft, academicOptions);
    if (type === "student" && !errors.registration && isRegistrationTaken(draft.registration, existing?.id)) {
      errors.registration = "Esta matrícula já está cadastrada.";
    }
    if (Object.keys(errors).length) throw new PersonValidationError(errors);

    const visitorCode = type === "visitor" ? existing?.visitorCode ?? getNextVisitorCode() : null;
    if (type === "visitor" && !visitorCode) throw new LabOperationError("A sequência de códigos VIS-XXXX foi esgotada.");
    const updatedAt = now();
    const record = Object.freeze({
      id: existing?.id ?? `person-${++lastPersonId}`,
      ...draft,
      ...(type === "student" ? { academicPeriod: Number(draft.academicPeriod) } : { visitorCode }),
      createdAt: existing?.createdAt ?? updatedAt,
      updatedAt,
      active: existing?.active ?? true,
    });
    if (!existing && type === "visitor") lastVisitorNumber++;
    const people = existing
      ? snapshot.people.map((person) => person.id === existing.id ? record : person)
      : [...snapshot.people, record];
    publish({ people: Object.freeze(people) });
    return record;
  }

  function getComputer(computerId) {
    const computer = snapshot.computers.find(({ id }) => id === computerId);
    if (!computer) throw new LabOperationError("Computador não encontrado.");
    return computer;
  }

  function findPerson(personId) {
    return snapshot.people.find(({ id }) => id === personId) ?? null;
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
    updateComputer({ ...computer, status: entering ? "maintenance" : "available" }, {
      maintenanceEvents: Object.freeze([...snapshot.maintenanceEvents, event]),
    });
  }

  return {
    getSnapshot: () => snapshot,

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    academicOptions,
    getNextVisitorCode,
    isRegistrationTaken,
    listPeople: () => snapshot.people,
    createPerson: (input) => savePerson(input),

    updatePerson(personId, input) {
      const existing = findPerson(personId);
      if (!existing) throw new LabOperationError("Pessoa não encontrada no cadastro.");
      return savePerson({ ...existing, ...input }, existing);
    },

    getPersonById: (personId) => findPerson(personId),
    getPersonHistory: (personId) => personSessions(personId, snapshot.sessions),
    getPersonUsage(personId) {
      const person = findPerson(personId);
      return person ? summarizePerson(person, snapshot.sessions) : null;
    },
    listPersonSummaries: () => snapshot.people.map((person) => summarizePerson(person, snapshot.sessions)),

    findPersonByIdentifier(value) {
      const identifier = normalizeIdentifier(value);
      if (!isRegistration(identifier) && !isVisitorCode(identifier)) {
        throw new LabOperationError("Informe uma matrícula numérica ou um código de visitante no formato VIS-0001.");
      }
      return snapshot.people.find((person) => person.active && personIdentifier(person) === identifier) ?? null;
    },

    startSession(computerId, personId) {
      const computer = getComputer(computerId);
      validateSessionStart(computer);
      const person = snapshot.people.find((entry) => entry.id === personId && entry.active);
      if (!person) throw new LabOperationError("Pessoa não encontrada no cadastro.");
      if (snapshot.sessions.some((session) => session.personId === personId && session.status === "active")) {
        throw new LabOperationError("Esta pessoa já possui uma sessão ativa.");
      }
      const session = Object.freeze({
        id: `session-${++nextSessionId}`,
        personId,
        personName: person.name,
        personIdentifier: personIdentifier(person),
        personAcademicSnapshot: Object.freeze({
          type: person.type,
          course: person.course ?? null,
          academicPeriod: person.academicPeriod ?? null,
          courseShift: person.courseShift ?? null,
        }),
        labId: computer.labId,
        computerId,
        pcNumber: computer.number,
        status: "active",
        startedAt: now(),
        endedAt: null,
      });
      updateComputer({ ...computer, status: "occupied", activeSessionId: session.id }, {
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
      updateComputer({ ...computer, status: "available", activeSessionId: null }, {
        sessions: Object.freeze(snapshot.sessions.map((entry) => entry.id === session.id ? session : entry)),
      });
      return session;
    },

    enterMaintenance: (computerId) => setMaintenance(computerId, true),
    exitMaintenance: (computerId) => setMaintenance(computerId, false),
  };
}

export const memoryLabRepository = createMemoryLabRepository();
