import { Box, Stack, Typography } from "@mui/material";
import ComputerStation from "./ComputerStation";

export default function LabMap({ lab, computers, activeSessions, onSelect }) {
  const computersByNumber = new Map(computers.map((computer) => [computer.number, computer]));

  return (
    <Box
      role="region"
      aria-label={`Mapa do ${lab.name}, ${lab.rows} fileiras de ${lab.columns}`}
      tabIndex={0}
      sx={{ overflowX: "auto", p: { xs: 1, sm: 2 }, bgcolor: "background.default", border: 1, borderColor: "divider", borderRadius: 1 }}
    >
      <Stack spacing={1.25} sx={{ minWidth: lab.columns * 76 + 42 }}>
        {Array.from({ length: lab.rows }, (_, row) => (
          <Box
            key={row}
            role="group"
            aria-label={`Fileira ${row + 1}`}
            sx={{
              display: "grid", alignItems: "center", gap: 1,
              gridTemplateColumns: `32px repeat(${lab.columns}, minmax(0, 1fr))`,
            }}
          >
            <Typography variant="body2" color="text.secondary" aria-hidden="true">
              F{row + 1}
            </Typography>
            {Array.from({ length: lab.columns }, (_, column) => {
              const number = row * lab.columns + column + 1;
              const computer = computersByNumber.get(number);
              if (!computer) return <Box key={number} aria-hidden="true" />;
              return (
                <ComputerStation
                  key={number}
                  computer={computer}
                  session={activeSessions.get(computer.activeSessionId)}
                  onSelect={onSelect}
                />
              );
            })}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
