import { Chip } from "@mui/material";

export default function PersonIdentifierChip({ person, size = "small" }) {
  const student = person.type === "student";
  return (
    <Chip
      size={size}
      label={student ? person.registration : person.visitorCode}
      aria-label={student ? `Matrícula ${person.registration}` : `Código ${person.visitorCode}`}
      sx={student
        ? { bgcolor: "primary.light", color: "primary.dark", fontWeight: 650 }
        : { bgcolor: "#ECEFF4", color: "text.secondary", fontWeight: 650 }}
    />
  );
}
