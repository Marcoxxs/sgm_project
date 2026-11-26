import { useState, useSyncExternalStore } from "react";
import { Alert, Box, Card, Snackbar, Stack, Tab, Tabs, Typography } from "@mui/material";
import PageHeader from "../components/PageHeader";
import ComputerDialog from "../components/labs/ComputerDialog";
import LabMap from "../components/labs/LabMap";
import LabStatusSummary from "../components/labs/LabStatusSummary";
import { labs } from "../domain/sessions/labs";
import { memoryLabRepository } from "../services/repositories/memoryLabRepository";

export default function HomePage({ repository = memoryLabRepository }) {
  const [labId, setLabId] = useState(labs[0].id);
  const [selectedId, setSelectedId] = useState(null);
  const [message, setMessage] = useState("");
  const { computers, sessions, peopleAvailable } = useSyncExternalStore(repository.subscribe, repository.getSnapshot);
  const labComputers = computers.filter((computer) => computer.labId === labId);
  const activeSessions = new Map(sessions
    .filter((session) => session.status === "active")
    .map((session) => [session.id, session]));
  const selected = computers.find((computer) => computer.id === selectedId);

  return (
    <Stack spacing={{ xs: 2, md: 3 }}>
      <PageHeader title="Home" description="Selecione um laboratório e abra uma estação para operar." />
      <Card>
        <Tabs
          value={labId}
          onChange={(_, value) => setLabId(value)}
          aria-label="Laboratórios"
          sx={{ borderBottom: 1, borderColor: "divider", px: { xs: 1, sm: 2 } }}
        >
          {labs.map((lab) => (
            <Tab key={lab.id} id={`tab-${lab.id}`} aria-controls={`panel-${lab.id}`} value={lab.id} label={lab.name} />
          ))}
        </Tabs>

        {labs.map((lab) => (
          <Box
            key={lab.id}
            role="tabpanel"
            id={`panel-${lab.id}`}
            aria-labelledby={`tab-${lab.id}`}
            hidden={lab.id !== labId}
          >
            {lab.id === labId && (
              <Stack spacing={2} sx={{ p: { xs: 1.5, sm: 2.5 } }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={1.5}
                >
                  <Box>
                    <Typography component="h2" variant="h2">{lab.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {lab.rows} fileiras · {lab.columns} estações por fileira
                    </Typography>
                  </Box>
                  <LabStatusSummary computers={labComputers} />
                </Stack>
                <LabMap
                  lab={lab}
                  computers={labComputers}
                  activeSessions={activeSessions}
                  onSelect={setSelectedId}
                />
                <Typography variant="body2" color="text.secondary">
                  Dados temporários em memória. As alterações se perdem ao recarregar.
                </Typography>
              </Stack>
            )}
          </Box>
        ))}
      </Card>
      {selected && (
        <ComputerDialog
          key={selected.id}
          computer={selected}
          lab={labs.find((lab) => lab.id === selected.labId)}
          session={activeSessions.get(selected.activeSessionId)}
          repository={repository}
          peopleAvailable={peopleAvailable}
          onClose={() => setSelectedId(null)}
          onSuccess={setMessage}
        />
      )}
      <Snackbar
        key={message}
        open={Boolean(message)}
        autoHideDuration={4000}
        onClose={(_, reason) => { if (reason !== "clickaway") setMessage(""); }}
      >
        <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>
      </Snackbar>
    </Stack>
  );
}
