import { useEffect, useState, useSyncExternalStore } from "react";
import { Alert, Box, Card, Snackbar, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import ComputerDialog from "../components/labs/ComputerDialog";
import LabMap from "../components/labs/LabMap";
import LabStatusSummary from "../components/labs/LabStatusSummary";
import { formatComputer, labs } from "../domain/sessions/labs";
import { readRegistrationContext } from "../domain/sessions/registrationContext";

function readReturn(state, repository) {
  const origin = readRegistrationContext(state?.labReturn);
  if (!origin) return {};
  const labId = origin.labId;
  if (!state.labReturn.personId) return { labId };
  const person = repository.findPersonByIdentifier(origin.registration);
  if (person?.id !== state.labReturn.personId) return { labId };
  const computer = repository.getSnapshot().computers.find(({ id }) => id === origin.computerId);
  if (computer?.status !== "available") {
    const label = computer ? formatComputer(computer.number) : "computador de origem";
    return { labId, warning: `Aluno cadastrado. O ${label} não está mais disponível para iniciar uma sessão.` };
  }
  return { labId, pending: { id: computer.id, person }, message: "Aluno cadastrado." };
}

export default function HomePage({ repository }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [resume] = useState(() => readReturn(location.state, repository));
  const [labId, setLabId] = useState(resume.labId ?? labs[0].id);
  const [selection, setSelection] = useState(resume.pending ?? null);
  const [warning, setWarning] = useState(resume.warning ?? "");
  const [message, setMessage] = useState(resume.message ?? "");
  const { computers, sessions } = useSyncExternalStore(repository.subscribe, repository.getSnapshot);
  const labComputers = computers.filter((computer) => computer.labId === labId);
  const activeSessions = new Map(sessions
    .filter((session) => session.status === "active")
    .map((session) => [session.id, session]));
  const selected = computers.find((computer) => computer.id === selection?.id);

  useEffect(() => {
    if (location.state?.labReturn) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  return (
    <Stack spacing={{ xs: 2, md: 3 }}>
      <PageHeader title="Home" description="Selecione um laboratório e abra uma estação para operar." />
      {warning && <Alert severity="warning" onClose={() => setWarning("")}>{warning}</Alert>}
      <Card>
        <Tabs
          value={labId}
          onChange={(_, value) => setLabId(value)}
          aria-label="Laboratórios"
          sx={{
            borderBottom: 1, borderColor: "divider", px: { xs: 1, sm: 2 }, pt: 0.75,
            "& .MuiTabs-indicator": { height: 3, borderRadius: "3px 3px 0 0" },
            "& .MuiTab-root": { borderRadius: "8px 8px 0 0" },
            "& .MuiTab-root.Mui-selected": { bgcolor: "institutional.soft" },
          }}
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
                  onSelect={(id) => setSelection({ id })}
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
          initialPerson={selection.person}
          onClose={() => setSelection(null)}
          onRegister={(registration) => {
            setSelection(null);
            navigate("/cadastros", {
              state: { registrationContext: { labId: selected.labId, computerId: selected.id, registration } },
            });
          }}
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
