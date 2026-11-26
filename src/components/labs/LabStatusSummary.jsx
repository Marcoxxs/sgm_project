import { Box, Stack, Typography } from "@mui/material";
import { computerStatus } from "./computerStatus";

export default function LabStatusSummary({ computers }) {
  const counts = { available: 0, occupied: 0, maintenance: 0 };
  for (const { status } of computers) counts[status]++;

  return (
    <Stack
      component="ul"
      aria-label="Legenda e contagem por estado"
      aria-live="polite"
      direction="row"
      flexWrap="wrap"
      useFlexGap
      spacing={1}
      sx={{ listStyle: "none", m: 0, p: 0 }}
    >
      {Object.entries(computerStatus).map(([status, { plural, color }]) => (
        <Stack
          component="li"
          key={status}
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{ px: 1.25, py: 0.65, border: 1, borderColor: "divider", borderRadius: 1 }}
        >
          <Box aria-hidden="true" sx={{ width: 11, height: 11, borderRadius: "50%", bgcolor: color, border: 1, borderColor: "divider" }} />
          <Typography variant="body2">
            <strong>{counts[status]}</strong> {plural}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
