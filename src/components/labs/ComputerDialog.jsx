import { useEffect, useState } from "react";
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Stack, TextField, Typography,
} from "@mui/material";
import Close from "@mui/icons-material/Close";
import PlayArrowOutlined from "@mui/icons-material/PlayArrowOutlined";
import BuildOutlined from "@mui/icons-material/BuildOutlined";
import StopOutlined from "@mui/icons-material/StopOutlined";
import {
  formatComputer, LabOperationError, sessionDurationSeconds, validateSessionStart,
} from "../../domain/sessions/labs";
import { computerStatus } from "./computerStatus";

function ActiveSession({ session }) {
  const [currentTime, setCurrentTime] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const seconds = sessionDurationSeconds(session.startedAt, currentTime);
  const elapsed = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
    .map((part) => String(part).padStart(2, "0")).join(":");

  return (
    <Box sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 1, bgcolor: "background.default" }}>
      <Typography sx={{ fontWeight: 700 }}>{session.personName}</Typography>
      <Typography variant="body2" color="text.secondary">{session.personIdentifier} · {elapsed}</Typography>
    </Box>
  );
}

export default function ComputerDialog({
  computer, lab, session, repository, peopleAvailable, onClose, onSuccess,
}) {
  const [lookup, setLookup] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [person, setPerson] = useState(null);
  const [notice, setNotice] = useState(null);
  const status = computerStatus[computer.status];
  const maintenance = computer.status === "maintenance";

  function perform(operation) {
    setNotice(null);
    try {
      operation();
    } catch (error) {
      setNotice(error instanceof LabOperationError
        ? { severity: "warning", text: error.message }
        : { severity: "error", text: "Não foi possível concluir a operação. Tente novamente." });
    }
  }

  function returnToActions() {
    setLookup(false);
    setIdentifier("");
    setPerson(null);
    setNotice(null);
  }

  function search(event) {
    event.preventDefault();
    setPerson(null);
    perform(() => {
      const match = repository.findPersonByIdentifier(identifier);
      if (!match) throw new LabOperationError("Pessoa não encontrada. Confira o identificador informado.");
      setPerson(match);
    });
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs" aria-labelledby="computer-dialog-title">
      <DialogTitle component="div" sx={{ pr: 7, position: "relative" }}>
        <Typography variant="body2" color="text.secondary">{lab.name}</Typography>
        <Typography id="computer-dialog-title" component="h2" variant="h2">
          {lookup ? `Iniciar sessão · ${formatComputer(computer.number)}` : formatComputer(computer.number)}
        </Typography>
        <IconButton aria-label="Fechar" onClick={onClose} sx={{ position: "absolute", top: 12, right: 12 }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Box aria-hidden="true" sx={{ width: 11, height: 11, borderRadius: "50%", bgcolor: status.color, border: 1, borderColor: "divider" }} />
            <Typography variant="body2">Estado atual <strong>{status.label}</strong></Typography>
          </Stack>
          {notice && <Alert severity={notice.severity}>{notice.text}</Alert>}
          {lookup ? (
            <Stack spacing={2}>
              {!peopleAvailable && (
                <Alert severity="info">
                  A consulta de pessoas ainda não está integrada ao cadastro. O início de sessões ficará disponível após essa integração.
                </Alert>
              )}
              <Stack component="form" spacing={1.5} onSubmit={search}>
                <TextField
                  autoFocus
                  required
                  fullWidth
                  size="small"
                  label="Matrícula ou código de visitante"
                  value={identifier}
                  onChange={(event) => {
                    setIdentifier(event.target.value);
                    setPerson(null);
                    setNotice(null);
                  }}
                />
                <Button type="submit" variant="outlined" disabled={!peopleAvailable || !identifier.trim()} sx={{ alignSelf: "flex-start" }}>
                  Consultar
                </Button>
              </Stack>
              {person && (
                <Box sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 1, bgcolor: "background.default" }}>
                  <Typography sx={{ fontWeight: 700 }}>{person.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{person.identifier}</Typography>
                </Box>
              )}
            </Stack>
          ) : (
            <>
              {session && <ActiveSession key={session.id} session={session} />}
              <Stack spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<PlayArrowOutlined />}
                  onClick={() => perform(() => {
                    validateSessionStart(computer);
                    setLookup(true);
                  })}
                >
                  Iniciar sessão
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<BuildOutlined />}
                  onClick={() => perform(() => {
                    if (maintenance) repository.exitMaintenance(computer.id);
                    else repository.enterMaintenance(computer.id);
                    onSuccess(maintenance ? "Computador retirado da manutenção." : "Computador colocado em manutenção.");
                  })}
                >
                  {maintenance ? "Retirar da manutenção" : "Manutenção"}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<StopOutlined />}
                  onClick={() => perform(() => {
                    repository.endSession(computer.id);
                    onSuccess("Sessão encerrada.");
                  })}
                >
                  Encerrar sessão
                </Button>
              </Stack>
            </>
          )}
        </Stack>
      </DialogContent>
      {lookup && (
        <DialogActions>
          <Button onClick={returnToActions}>Voltar</Button>
          <Button
            variant="contained"
            disabled={!person}
            onClick={() => perform(() => {
              repository.startSession(computer.id, person.id);
              returnToActions();
              onSuccess("Sessão iniciada.");
            })}
          >
            Confirmar início
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
