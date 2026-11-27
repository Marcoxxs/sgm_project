// Catálogo acadêmico oficial do Campus Parnaíba.
// Os identificadores internos são permanentes e independentes dos nomes de exibição.
export const academicCatalog = Object.freeze({
  courses: Object.freeze([
    Object.freeze({ id: "ciencias-biologicas", label: "Ciências Biológicas" }),
    Object.freeze({ id: "ciencias-da-computacao", label: "Ciências da Computação" }),
    Object.freeze({ id: "ciencias-sociais", label: "Ciências Sociais" }),
    Object.freeze({ id: "direito", label: "Direito" }),
    Object.freeze({ id: "enfermagem", label: "Enfermagem" }),
    Object.freeze({ id: "engenharia-agronomica", label: "Engenharia Agronômica" }),
    Object.freeze({ id: "filosofia", label: "Filosofia" }),
    Object.freeze({ id: "historia", label: "História" }),
    Object.freeze({ id: "letras-ingles", label: "Letras – Inglês" }),
    Object.freeze({ id: "letras-portugues", label: "Letras – Português" }),
    Object.freeze({ id: "odontologia", label: "Odontologia" }),
    Object.freeze({ id: "pedagogia", label: "Pedagogia" }),
    Object.freeze({ id: "tecnologo-sistemas-computacao", label: "Tecnólogo em Sistemas de Computação (TSC)" }),
  ]),
  shifts: Object.freeze([
    Object.freeze({ id: "manha", label: "Manhã" }),
    Object.freeze({ id: "tarde", label: "Tarde" }),
    Object.freeze({ id: "noite", label: "Noite" }),
  ]),
  periods: Object.freeze([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
});

export function findCourse(courseId) {
  return academicCatalog.courses.find(({ id }) => id === courseId) ?? null;
}

export function courseLabel(courseId) {
  return findCourse(courseId)?.label ?? "";
}

export function shiftLabel(shiftId) {
  return academicCatalog.shifts.find(({ id }) => id === shiftId)?.label ?? "";
}

export function periodLabel(academicPeriod) {
  const period = Number(academicPeriod);
  return academicCatalog.periods.includes(period) ? `${period}º período` : "";
}
