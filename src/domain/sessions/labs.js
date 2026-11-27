export const labs = Object.freeze([
  Object.freeze({ id: "delta", name: "Delta Lab", rows: 3, columns: 5 }),
  Object.freeze({ id: "carnauba", name: "Carnaúba Lab", rows: 4, columns: 6 }),
]);

export function labName(labId) {
  return labs.find(({ id }) => id === labId)?.name ?? "";
}

export function formatComputer(number) {
  return `PC ${String(number).padStart(2, "0")}`;
}

export function createComputers() {
  return labs.flatMap(({ id, rows, columns }) =>
    Array.from({ length: rows * columns }, (_, index) => ({
      id: `${id}_${String(index + 1).padStart(2, "0")}`,
      labId: id,
      number: index + 1,
      status: "available",
      activeSessionId: null,
    })),
  );
}

export function sessionDurationSeconds(startedAt, endedAt) {
  return Math.floor(Math.max(0, endedAt - startedAt) / 1000);
}

export function validateSessionStart(computer) {
  if (computer.status === "occupied") {
    throw new LabOperationError("Este computador está ocupado.");
  }
  if (computer.status === "maintenance") {
    throw new LabOperationError("Retire o computador da manutenção antes de iniciar uma sessão.");
  }
}

export class LabOperationError extends Error {}
