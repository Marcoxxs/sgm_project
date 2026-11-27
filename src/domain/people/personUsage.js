import { sessionDurationSeconds } from "../sessions/labs";
import { normalizeText } from "./people";

const TIME_ZONE = "America/Fortaleza";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const nameCollator = new Intl.Collator("pt-BR", { sensitivity: "base" });

export function formatDate(timestamp) {
  return timestamp == null ? "" : dateFormatter.format(new Date(timestamp));
}

export function formatTime(timestamp) {
  return timestamp == null ? "" : timeFormatter.format(new Date(timestamp));
}

export function formatDateTime(timestamp) {
  return timestamp == null ? "" : `${formatDate(timestamp)} ${formatTime(timestamp)}`;
}

export function formatDuration(totalSeconds) {
  const seconds = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0;
  if (seconds <= 0) return "0h";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}min`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}min`;
  return "menos de 1 min";
}

export function closedDurationSeconds(session) {
  if (!session || session.status !== "closed") return 0;
  if (Number.isFinite(session.durationSeconds)) return Math.max(0, Math.floor(session.durationSeconds));
  const endedAt = Number.isFinite(session.endedAt) ? session.endedAt : session.startedAt;
  return sessionDurationSeconds(session.startedAt, endedAt);
}

export function totalDurationSeconds(sessions) {
  return sessions.reduce((total, session) => total + closedDurationSeconds(session), 0);
}

export function personSessions(personId, sessions) {
  const unique = new Map();
  for (const session of sessions) {
    if (session.personId === personId && !unique.has(session.id)) unique.set(session.id, session);
  }
  return [...unique.values()].sort((first, second) =>
    second.startedAt - first.startedAt || String(second.id).localeCompare(String(first.id)),
  );
}

export function summarizePerson(person, sessions) {
  const history = personSessions(person.id, sessions);
  return {
    person,
    history,
    lastSession: history[0] ?? null,
    accessCount: history.length,
    totalSeconds: totalDurationSeconds(history),
  };
}

function comparePeopleByName(first, second) {
  return nameCollator.compare(first.person.nameNormalized, second.person.nameNormalized)
    || String(first.person.id).localeCompare(String(second.person.id));
}

export function sortPersonSummaries(summaries, accessOrder) {
  const sorted = [...summaries];
  if (accessOrder === "recent" || accessOrder === "oldest") {
    sorted.sort((first, second) => {
      const firstStart = first.lastSession?.startedAt;
      const secondStart = second.lastSession?.startedAt;
      if (firstStart == null && secondStart == null) return comparePeopleByName(first, second);
      if (firstStart == null) return 1;
      if (secondStart == null) return -1;
      const difference = accessOrder === "recent" ? secondStart - firstStart : firstStart - secondStart;
      return difference || comparePeopleByName(first, second);
    });
    return sorted;
  }
  sorted.sort(comparePeopleByName);
  return sorted;
}

export function matchesSearch(summary, query) {
  const normalizedQuery = normalizeText(query).trim();
  if (!normalizedQuery) return true;
  const { person } = summary;
  return person.nameNormalized.includes(normalizedQuery)
    || String(person.registration ?? "").toLocaleLowerCase("pt-BR").includes(normalizedQuery)
    || String(person.visitorCode ?? "").toLocaleLowerCase("pt-BR").includes(normalizedQuery);
}

export function matchesCourse(summary, courseId) {
  return !courseId || summary.person.course === courseId;
}
