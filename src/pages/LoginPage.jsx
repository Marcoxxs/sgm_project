import { useState } from "react";
import {
  Alert, Box, Button, Card, CircularProgress, IconButton, InputAdornment, Stack, TextField, Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { authErrorMessage } from "../auth/authErrors";

function safeDestination(value) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export default function LoginPage() {
  const { status, user, configured, missingConfiguration, login } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const destination = safeDestination(location.state?.from);

  if (status === "authorized" || status === "unauthorized" || (status === "error" && user)) {
    return <Navigate to={destination} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim()) {
      setError("Informe o e-mail institucional.");
      return;
    }
    if (!password) {
      setError("Informe a senha.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (failure) {
      setError(authErrorMessage(failure));
    } finally {
      setSubmitting(false);
    }
  }

  const disabled = !configured || submitting;

  return (
    <Box
      sx={{
        minHeight: "100dvh", display: "grid", placeItems: "center",
        bgcolor: "background.default", px: 2, py: { xs: 4, sm: 6 },
      }}
    >
      <Stack spacing={3} sx={{ width: "100%", maxWidth: 440 }}>
        <Box sx={{ px: { xs: 0.5, sm: 0 } }}>
          <Typography sx={{ fontSize: "1.5rem", fontWeight: 750, letterSpacing: "-0.04em", color: "institutional.navy" }}>
            SGMLab <Box component="span" sx={{ color: "primary.main" }}>— UESPI</Box>
          </Typography>
          <Typography variant="body2" color="text.secondary">Campus Parnaíba</Typography>
        </Box>

        <Card sx={{ boxShadow: "0 18px 48px rgba(18, 39, 70, 0.08)" }}>
          <Stack component="form" noValidate onSubmit={handleSubmit} spacing={2.5} sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack spacing={0.75}>
              <Typography component="h1" variant="h2" id="page-title">Acesso ao sistema</Typography>
              <Typography color="text.secondary">
                Entre com a conta de monitor autorizada pela coordenação para utilizar o SGMLab.
              </Typography>
            </Stack>

            {!configured && (
              <Alert severity="warning">
                {`Configuração do Firebase incompleta. Defina ${missingConfiguration.join(", ")} no arquivo .env.local para habilitar o login.`}
              </Alert>
            )}
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              required
              fullWidth
              label="E-mail"
              name="email"
              type="email"
              autoComplete="username"
              value={email}
              disabled={disabled}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
            />

            <TextField
              required
              fullWidth
              label="Senha"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              disabled={disabled}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        onClick={() => setShowPassword((visible) => !visible)}
                        disabled={!configured}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={disabled}
              aria-busy={submitting}
              startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : undefined}
            >
              {submitting ? "Entrando..." : "Entrar"}
            </Button>
          </Stack>
        </Card>

        <Typography variant="body2" color="text.secondary" align="center">
          O acesso é restrito aos monitores autorizados pela coordenação.
        </Typography>
      </Stack>
    </Box>
  );
}
