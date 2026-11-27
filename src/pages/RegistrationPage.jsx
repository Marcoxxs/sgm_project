import { useState, useSyncExternalStore } from "react";
import {
  Alert, Box, Button, Card, Divider, Snackbar, Stack, TextField,
  ToggleButton, ToggleButtonGroup, Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { isRegistration, PersonValidationError } from "../domain/people/people";
import { formatComputer, LabOperationError, labs } from "../domain/sessions/labs";
import { readRegistrationContext } from "../domain/sessions/registrationContext";

function emptyForm(registration = "") {
  return { name: "", registration, course: "", academicPeriod: "", courseShift: "" };
}

export default function RegistrationPage({ repository }) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const context = readRegistrationContext(state?.registrationContext);
  const [type, setType] = useState("student");
  const [fields, setFields] = useState(() => emptyForm(context?.registration));
  const [errors, setErrors] = useState({});
  const [failure, setFailure] = useState("");
  const [message, setMessage] = useState("");

  useSyncExternalStore(repository.subscribe, repository.getSnapshot);
  const student = type === "student";
  const { courses, shifts } = repository.academicOptions;
  const academicOptionsReady = courses.length > 0 && shifts.length > 0;
  const code = repository.getNextVisitorCode();
  const registration = fields.registration.trim();
  const registrationError = errors.registration || (registration && (
    !isRegistration(registration) ? "Use apenas números na matrícula."
      : repository.isRegistrationTaken(registration) ? "Esta matrícula já está cadastrada." : ""
  ));

  function reset() {
    setFields(emptyForm());
    setErrors({});
    setFailure("");
    setMessage("");
  }

  function field(name) {
    return {
      name,
      value: fields[name],
      onChange: (event) => {
        setFields((previous) => ({ ...previous, [name]: event.target.value }));
        setErrors((previous) => ({ ...previous, [name]: undefined }));
        setFailure("");
      },
      error: Boolean(errors[name]),
      helperText: errors[name],
    };
  }

  function returnToLab(personId) {
    navigate("/", { replace: true, state: { labReturn: { ...context, personId } } });
  }

  function submit(event) {
    event.preventDefault();
    setErrors({});
    setFailure("");
    setMessage("");
    try {
      const person = repository.createPerson({ ...fields, type });
      if (context) {
        returnToLab(person.id);
      } else {
        reset();
        setMessage(student ? "Aluno cadastrado." : `Visitante cadastrado com o código ${person.visitorCode}.`);
      }
    } catch (error) {
      if (error instanceof PersonValidationError) setErrors(error.fields);
      else setFailure(error instanceof LabOperationError ? error.message : "Não foi possível concluir o cadastro. Tente novamente.");
    }
  }

  return (
    <Stack spacing={3}>
      <PageHeader title="Cadastros" description="Cadastre alunos e visitantes para identificar quem utiliza os laboratórios." />
      <Card>
        <Stack component="form" noValidate onSubmit={submit} spacing={2.5} sx={{ p: { xs: 2, sm: 3 } }}>
          {context && (
            <Alert severity="info">
              Cadastro iniciado no {labs.find(({ id }) => id === context.labId).name}, {formatComputer(Number(context.computerId.split("_")[1]))}.
            </Alert>
          )}
          <Stack alignItems="flex-start" spacing={1}>
            <Typography component="h2" variant="h3" id="registration-type">Tipo de cadastro</Typography>
            <ToggleButtonGroup
              exclusive
              value={type}
              size="small"
              color="primary"
              aria-labelledby="registration-type"
              onChange={(_, value) => {
                if (!value || context) return;
                reset();
                setType(value);
              }}
            >
              <ToggleButton value="student">Aluno</ToggleButton>
              <ToggleButton value="visitor" disabled={Boolean(context)}>Visitante</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
          <Divider />
          {student && !academicOptionsReady && (
            <Alert severity="warning">
              O cadastro de alunos será habilitado quando as opções oficiais de curso e turno acadêmico forem informadas.
            </Alert>
          )}
          {failure && <Alert severity="error">{failure}</Alert>}
          {!student && !code && <Alert severity="error">A sequência de códigos VIS-XXXX foi esgotada.</Alert>}
          <Box
            sx={{
              display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" },
              columnGap: 2, rowGap: 2.5,
            }}
          >
            <TextField
              required
              label="Nome completo"
              autoComplete="name"
              {...field("name")}
              sx={{ gridColumn: "1 / -1" }}
            />
            {student ? (
              <>
                <TextField
                  required
                  label="Matrícula"
                  {...field("registration")}
                  slotProps={{ htmlInput: { inputMode: "numeric" }, input: { readOnly: Boolean(context) } }}
                  error={Boolean(registrationError)}
                  helperText={registrationError || "Apenas números. Os zeros à esquerda são preservados."}
                />
                <TextField
                  required select label="Curso" disabled={!courses.length}
                  {...field("course")}
                  slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
                >
                  <option value="" disabled>Selecione o curso</option>
                  {courses.map((course) => <option key={course} value={course}>{course}</option>)}
                </TextField>
                <TextField
                  required
                  label="Período acadêmico"
                  {...field("academicPeriod")}
                  slotProps={{ htmlInput: { inputMode: "numeric" } }}
                />
                <TextField
                  required select label="Turno acadêmico" disabled={!shifts.length}
                  {...field("courseShift")}
                  slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
                >
                  <option value="" disabled>Selecione o turno</option>
                  {shifts.map((shift) => <option key={shift} value={shift}>{shift}</option>)}
                </TextField>
              </>
            ) : (
              <TextField
                label="Código de visitante"
                value={code ?? ""}
                slotProps={{ input: { readOnly: true } }}
                helperText="O código é gerado automaticamente e atribuído ao salvar."
              />
            )}
          </Box>
          <Divider />
          <Stack direction={{ xs: "column-reverse", sm: "row" }} justifyContent="flex-end" spacing={1.25}>
            <Button variant="outlined" onClick={() => context ? returnToLab() : reset()}>Cancelar</Button>
            <Button variant="contained" type="submit" disabled={student ? !academicOptionsReady : !code}>
              {student ? "Cadastrar aluno" : "Cadastrar visitante"}
            </Button>
          </Stack>
        </Stack>
      </Card>
      <Snackbar open={Boolean(message)} autoHideDuration={4500} onClose={(_, reason) => { if (reason !== "clickaway") setMessage(""); }}>
        <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>
      </Snackbar>
    </Stack>
  );
}
