import { useState, useSyncExternalStore } from "react";
import {
  Box, Button, Card, InputAdornment, Link, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow, TextField, Typography,
} from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import { Link as RouterLink } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import PersonIdentifierChip from "../components/records/PersonIdentifierChip";
import { academicCatalog } from "../domain/people/academicCatalog";
import {
  formatDateTime, formatDuration, matchesCourse, matchesSearch, sortPersonSummaries,
} from "../domain/people/personUsage";
import { formatComputer, labName } from "../domain/sessions/labs";

const emptyFilters = { search: "", course: "", access: "" };

const accessOptions = [
  { value: "", label: "Ordem alfabética" },
  { value: "recent", label: "Mais recentes" },
  { value: "oldest", label: "Mais antigos" },
];

const columns = ["Nome", "Matrícula/Código", "Laboratório", "Computador", "Último acesso", "Tempo total"];

export default function RecordsPage({ repository }) {
  useSyncExternalStore(repository.subscribe, repository.getSnapshot);
  const [draft, setDraft] = useState(emptyFilters);
  const [filters, setFilters] = useState(emptyFilters);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const summaries = repository.listPersonSummaries();
  const totalPeople = summaries.length;
  const visible = sortPersonSummaries(
    summaries.filter((summary) => matchesCourse(summary, filters.course) && matchesSearch(summary, filters.search)),
    filters.access,
  );
  const pageRows = visible.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const filtersActive = filters.search.trim() !== "" || filters.course !== "";

  function updateDraft(name, value) {
    setDraft((previous) => ({ ...previous, [name]: value }));
  }

  function applyFilters(event) {
    event.preventDefault();
    setFilters(draft);
    setPage(0);
  }

  function clearFilters() {
    setDraft(emptyFilters);
    setFilters(emptyFilters);
    setPage(0);
  }

  const emptyMessage = totalPeople === 0
    ? "Nenhuma pessoa cadastrada."
    : "Nenhuma pessoa encontrada para os filtros selecionados.";

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Registros de Acesso"
        description="Consulte as pessoas cadastradas e o histórico de utilização dos laboratórios."
      />
      <Card>
        <Stack component="form" noValidate onSubmit={applyFilters} spacing={2} sx={{ p: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr)" },
              gap: 2,
            }}
          >
            <TextField
              name="search"
              label="Buscar por nome, matrícula ou código VIS"
              value={draft.search}
              onChange={(event) => updateDraft("search", event.target.value)}
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              select
              name="course"
              label="Curso"
              value={draft.course}
              onChange={(event) => updateDraft("course", event.target.value)}
              size="small"
              slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
            >
              <option value="">Todos os cursos</option>
              {academicCatalog.courses.map((course) => (
                <option key={course.id} value={course.id}>{course.label}</option>
              ))}
            </TextField>
            <TextField
              select
              name="access"
              label="Acessos"
              value={draft.access}
              onChange={(event) => updateDraft("access", event.target.value)}
              size="small"
              slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
            >
              {accessOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </TextField>
          </Box>
          <Stack direction={{ xs: "column-reverse", sm: "row" }} spacing={1.25} justifyContent="flex-end">
            <Button variant="outlined" onClick={clearFilters}>Limpar filtros</Button>
            <Button variant="contained" type="submit">Filtrar</Button>
          </Stack>
        </Stack>
      </Card>

      <Card>
        <TableContainer>
          <Table aria-label="Pessoas cadastradas" sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column} sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>{column}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {pageRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} sx={{ py: 6 }}>
                    <Stack spacing={1} alignItems="center" textAlign="center">
                      <Typography sx={{ fontWeight: 700 }}>{emptyMessage}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {totalPeople === 0
                          ? "Cadastre alunos e visitantes para começar a registrar acessos."
                          : filtersActive
                            ? "Ajuste a busca ou o curso e tente novamente."
                            : "Ajuste os filtros e tente novamente."}
                      </Typography>
                      {totalPeople === 0 && (
                        <Button component={RouterLink} to="/cadastros" variant="outlined">Ir para Cadastros</Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : pageRows.map(({ person, lastSession, totalSeconds }) => (
                <TableRow key={person.id} hover>
                  <TableCell>
                    <Link
                      component={RouterLink}
                      to={`/registros/${person.id}`}
                      underline="hover"
                      sx={{ color: "primary.dark", fontWeight: 700 }}
                    >
                      {person.name}
                    </Link>
                  </TableCell>
                  <TableCell><PersonIdentifierChip person={person} /></TableCell>
                  <TableCell>{lastSession ? labName(lastSession.labId) : "—"}</TableCell>
                  <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>
                    {lastSession ? formatComputer(lastSession.pcNumber) : "—"}
                  </TableCell>
                  <TableCell sx={{ color: lastSession ? "text.primary" : "text.secondary" }}>
                    {lastSession ? formatDateTime(lastSession.startedAt) : "Sem acessos"}
                  </TableCell>
                  <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>{formatDuration(totalSeconds)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {visible.length > 0 && (
          <TablePagination
            component="div"
            count={visible.length}
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
        )}
      </Card>
    </Stack>
  );
}
