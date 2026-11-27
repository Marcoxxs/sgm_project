export const normalizeIdentifier = (value) => String(value ?? "").trim().toUpperCase();
export const isRegistration = (value) => /^\d+$/.test(value);
export const isVisitorCode = (value) => /^VIS-\d{4}$/.test(value);

export const personIdentifier = (person) => person.registration ?? person.visitorCode;

export function normalizePerson(input) {
  const name = String(input.name ?? "").trim().replace(/\s+/g, " ");
  return {
    type: input.type,
    name,
    nameNormalized: name.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("pt-BR"),
    ...(input.type === "student" && {
      registration: normalizeIdentifier(input.registration),
      course: String(input.course ?? ""),
      academicPeriod: String(input.academicPeriod ?? "").trim(),
      courseShift: String(input.courseShift ?? ""),
    }),
  };
}

export function validatePerson(person, catalog) {
  const errors = {};
  if (!person.name) errors.name = "Informe o nome completo.";
  if (person.type !== "student") return errors;

  if (!person.registration) errors.registration = "Informe a matrícula.";
  else if (!isRegistration(person.registration)) errors.registration = "Use apenas números na matrícula.";

  if (!person.course) errors.course = "Selecione o curso.";
  else if (!catalog.courses.includes(person.course)) errors.course = "Selecione um curso da lista oficial.";

  if (!person.academicPeriod) errors.academicPeriod = "Informe o período acadêmico.";
  else if (!/^\d+$/.test(person.academicPeriod) || !Number.isSafeInteger(Number(person.academicPeriod)) || Number(person.academicPeriod) < 1) {
    errors.academicPeriod = "Informe um número inteiro maior que zero.";
  }

  if (!person.courseShift) errors.courseShift = "Selecione o turno acadêmico.";
  else if (!catalog.shifts.includes(person.courseShift)) errors.courseShift = "Selecione um turno da lista oficial.";
  return errors;
}

export class PersonValidationError extends Error {
  constructor(fields) {
    super("Confira os campos indicados.");
    this.fields = fields;
  }
}
