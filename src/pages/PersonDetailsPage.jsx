import { useEffect, useState, useSyncExternalStore } from "react";
import {
  Alert, Box, Button, Card, Chip, Divider, Snackbar, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography,
} from "@mui/material";
import ArrowBack from "@mui/icons-material/ArrowBack";
import EditOutlined from "@mui/icons-material/EditOutlined";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import PersonIdentifierChip from "../components/records/PersonIdentifierChip";
import { academicCatalog, courseLabel, periodLabel, shiftLabel } from "../domain/people/academicCatalog";
import { PersonValidationError } from "../domain/people/people";
import {
  closedDurationSeconds, formatDate, formatDuration, formatTime,
} from "../domain/people/personUsage";
import { LabOperationError, formatComputer, labName } from "../domain/sessions/labs";

const historyColumns = ["Data", "Laboratório", "Computador", "Entrada", "Saída", "Duração"];
const discardMessage = "Descartar as alterações não salvas?";

function draftFrom(person) {
  return person.type === "student"
    ? {
      name: person.name,
      registration: person.registration,
      course: person.course,
      academicPeriod: String(person.academicPeriod),
      courseShift: person.courseShift,
    }
    : { name: person.name };
}

function Field({ label, value }) {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography sx={{ fontWeight: 650 }}>{value}</Typography>
    </Box>
  );
}

export default function PersonDetailsPage({ repository }) {
  const { personId } = useParams();
  const navigate = useNavigate();
  useSyncExternalStore(repository.subscribe, repository.getSnapshot);
  const person = repository.getPersonById(personId);
  const usage = person ? repository.getPersonUsage(personId) : null;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [errors, setErrors] = useState({});
  const [failure, setFailure] = useState("");
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const initialDraft = person ? draftFrom(person) : null;
  const dirty = Boolean(editing && draft && initialDraft
    && JSON.stringify(draft) !== JSON.stringify(initialDraft));

  useEffect(() => {
    setEditing(false);
    setDraft(null);
    setErrors({});
    setFailure("");
    setPage(0);
  }, [personId]);

  useEffect(() => {
    if (!dirty) return undefined;
    const confirmNavigation = (event) => {
      if (typeof event.target.closest !== "function" || !event.target.closest("a[href]")) return;
      if (!window.confirm(discardMessage)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    const confirmReload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    document.addEventListener("click", confirmNavigation, true);
    window.addEventListener("beforeunload", confirmReload);
    return () => {
      document.removeEventListener("click", confirmNavigation, true);
      window.removeEventListener("beforeunload", confirmReload);
    };
  }, [dirty]);

  function goBack() {
    if (dirty && !window.confirm(discardMessage)) return;
    navigate("/registros");
  }

  if (!person) {
    return (
      <Stack spacing={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/registros")} sx={{ alignSelf: "flex-start" }}>
          Voltar
        </Button>
        <PageHeader title="Pessoa não encontrada" description="O identificador informado não corresponde a uma pessoa cadastrada." />
        <Card>
          <Stack spacing={1.5} alignItems="flex-start" sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography color="text.secondary">
              A pessoa pode não existir mais ou o endereço pode estar incorreto.
            </Typography>
            <Button variant="contained" onClick={() => navigate("/registros")}>Voltar aos Registros</Button>
          </Stack>
        </Card>
      </Stack>
    );
  }

  const student = person.type === "student";
  const history = usage?.history ?? [];
  const pageHistory = history.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  function startEditing() {
    setDraft(draftFrom(person));
    setErrors({});
    setFailure("");
    setEditing(true);
  }

  function cancelEditing() {
    if (dirty && !window.confirm(discardMessage)) return;
    setEditing(false);
    setDraft(null);
    setErrors({});
    setFailure("");
  }

  function save() {
    setErrors({});
    setFailure("");
    try {
      repository.updatePerson(person.id, draft);
      setEditing(false);
      setDraft(null);
      setMessage("Dados cadastrais atualizados.");
    } catch (error) {
      if (error instanceof PersonValidationError) setErrors(error.fields);
      else setFailure(error instanceof LabOperationError ? error.message : "Não foi possível salvar os dados. Tente novamente.");
    }
  }

  function editField(name) {
    return {
      name,
      value: draft[name],
      onChange: (event) => {
        setDraft((previous) => ({ ...previous, [name]: event.target.value }));
        setErrors((previous) => ({ ...previous, [name]: undefined }));
        setFailure("");
      },
      error: Boolean(errors[name]),
      helperText: errors[name],
    };
  }

  const duplicateRegistration = Boolean(editing && student && draft && !errors.registration
    && repository.isRegistrationTaken(draft.registration, person.id));

  return (
    <Stack spacing={3}>
      <Button startIcon={<ArrowBack />} onClick={goBack} sx={{ alignSelf: "flex-start" }}>
        Voltar
      </Button>
      <PageHeader
        title={person.name}
        description="Dados cadastrais, totais de utilização e histórico de acessos."
      />

      <Card>
        <Stack spacing={2.5} sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Stack spacing={1.25}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Chip
                  size="small"
                  label={student ? "Aluno" : "Visitante"}
                  sx={student
                    ? { bgcolor: "institutional.soft", color: "primary.dark", fontWeight: 650 }
                    : { bgcolor: "#ECEFF4", color: "text.secondary", fontWeight: 650 }}
                />
                <PersonIdentifierChip person={person} />
              </Stack>
              {!editing && <Typography component="h2" variant="h2">{person.name}</Typography>}
            </Stack>
            {!editing && (
              <Button variant="contained" startIcon={<EditOutlined />} onClick={startEditing}>
                Editar dados
              </Button>
            )}
          </Stack>

          {editing && (
            <TextField
              required
              fullWidth
              label="Nome completo"
              autoComplete="name"
              {...editField("name")}
            />
          )}

          {student && <Divider />}
          {student && (editing ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" },
                columnGap: 2,
                rowGap: 2.5,
              }}
            >
              <TextField
                required
                label="Matrícula"
                {...editField("registration")}
                error={Boolean(errors.registration || duplicateRegistration)}
                helperText={errors.registration || (duplicateRegistration
                  ? "Esta matrícula já está cadastrada."
                  : "Apenas números. Os zeros à esquerda são preservados.")}
                slotProps={{ htmlInput: { inputMode: "numeric" } }}
              />
              <TextField
                required select label="Curso"
                {...editField("course")}
                slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
              >
                <option value="" disabled>Selecione o curso</option>
                {academicCatalog.courses.map((course) => (
                  <option key={course.id} value={course.id}>{course.label}</option>
                ))}
              </TextField>
              <TextField
                required select label="Período acadêmico"
                {...editField("academicPeriod")}
                slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
              >
                <option value="" disabled>Selecione o período</option>
                {academicCatalog.periods.map((period) => (
                  <option key={period} value={String(period)}>{periodLabel(period)}</option>
                ))}
              </TextField>
              <TextField
                required select label="Turno acadêmico"
                {...editField("courseShift")}
                slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
              >
                <option value="" disabled>Selecione o turno</option>
                {academicCatalog.shifts.map((shift) => (
                  <option key={shift.id} value={shift.id}>{shift.label}</option>
                ))}
              </TextField>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(3, minmax(0, 1fr))" },
                gap: 2,
              }}
            >
              <Field label="Curso" value={courseLabel(person.course) || "—"} />
              <Field label="Período" value={periodLabel(person.academicPeriod) || "—"} />
              <Field label="Turno" value={shiftLabel(person.courseShift) || "—"} />
            </Box>
          ))}

          <Divider />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1.5, sm: 5 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Total de acessos</Typography>
              <Typography variant="h2">{usage.accessCount}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Tempo total acumulado</Typography>
              <Typography variant="h2">{formatDuration(usage.totalSeconds)}</Typography>
            </Box>
          </Stack>

          {failure && <Alert severity="error">{failure}</Alert>}
          {editing && (
            <Stack direction="row" spacing={1.25} justifyContent="flex-end">
              <Button variant="outlined" onClick={cancelEditing}>Cancelar</Button>
              <Button variant="contained" onClick={save}>Concluir</Button>
            </Stack>
          )}
        </Stack>
      </Card>

      <Card>
        <Stack spacing={2} sx={{ p: { xs: 2, sm: 3 } }}>
          <Box>
            <Typography component="h2" variant="h2">Histórico de utilização</Typography>
            <Typography variant="body2" color="text.secondary">Sessões mais recentes primeiro.</Typography>
          </Box>
          {history.length === 0 ? (
            <Alert severity="info">Esta pessoa ainda não possui acessos registrados.</Alert>
          ) : (
            <>
              <TableContainer>
                <Table aria-label="Histórico de utilização" sx={{ minWidth: 760 }}>
                  <TableHead>
                    <TableRow>
                      {historyColumns.map((column) => (
                        <TableCell key={column} sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>{column}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pageHistory.map((session) => (
                      <TableRow key={session.id} hover>
                        <TableCell>{formatDate(session.startedAt)}</TableCell>
                        <TableCell>{labName(session.labId)}</TableCell>
                        <TableCell>{formatComputer(session.pcNumber)}</TableCell>
                        <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>{formatTime(session.startedAt)}</TableCell>
                        <TableCell>
                          {session.status === "active"
                            ? <Chip size="small" label="Em andamento" sx={{ bgcolor: "institutional.soft", color: "primary.dark", fontWeight: 650 }} />
                            : <Box component="span" sx={{ fontVariantNumeric: "tabular-nums" }}>{formatTime(session.endedAt)}</Box>}
                        </TableCell>
                        <TableCell>
                          {session.status === "active" ? "Em andamento" : formatDuration(closedDurationSeconds(session))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={history.length}
                page={page}
                onPageChange={(_, nextPage) => setPage(nextPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(Number(event.target.value));
                  setPage(0);
                }}
                rowsPerPageOptions={[10, 25, 50]}
                labelRowsPerPage="Linhas por página"
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
              />
            </>
          )}
        </Stack>
      </Card>

      <Snackbar open={Boolean(message)} autoHideDuration={4000} onClose={(_, reason) => { if (reason !== "clickaway") setMessage(""); }}>
        <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>
      </Snackbar>
    </Stack>
  );
}
