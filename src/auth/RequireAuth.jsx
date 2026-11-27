import { Box, Button, Card, CircularProgress, Stack, Typography } from "@mui/material";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function AuthLoading({ message = "Verificando acesso ao SGMLab..." }) {
  return (
    <Box sx={{ minHeight: "100dvh", display: "grid", placeItems: "center", bgcolor: "background.default", px: 2 }}>
      <Stack alignItems="center" spacing={2} role="status" aria-live="polite">
        <CircularProgress size={32} />
        <Typography color="text.secondary">{message}</Typography>
      </Stack>
    </Box>
  );
}

function AccessMessage({ title, description, children }) {
  return (
    <Box sx={{ minHeight: "100dvh", display: "grid", placeItems: "center", bgcolor: "background.default", px: 2, py: 4 }}>
      <Card sx={{ width: "100%", maxWidth: 520 }}>
        <Stack spacing={2} sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={0.5}>
            <Typography sx={{ fontSize: "1.125rem", fontWeight: 750, letterSpacing: "-0.04em", color: "institutional.navy" }}>
              SGMLab <Box component="span" sx={{ color: "primary.main" }}>— UESPI</Box>
            </Typography>
            <Typography variant="body2" color="text.secondary">Campus Parnaíba</Typography>
          </Stack>
          <Typography component="h1" variant="h2">{title}</Typography>
          <Typography color="text.secondary">{description}</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ pt: 1 }}>
            {children}
          </Stack>
        </Stack>
      </Card>
    </Box>
  );
}

function useSignOut() {
  const { logout } = useAuth();
  return () => {
    void logout().catch(() => {});
  };
}

export default function RequireAuth({ children }) {
  const { status, error, retry } = useAuth();
  const location = useLocation();
  const signOut = useSignOut();

  if (status === "initializing" || status === "authorizing") return <AuthLoading />;
  if (status === "unconfigured" || status === "signedOut") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (status === "unauthorized") {
    return (
      <AccessMessage
        title="Acesso não autorizado"
        description="Sua conta foi autenticada, mas não está autorizada como monitor ativo do SGMLab. Solicite a liberação à coordenação e tente novamente."
      >
        <Button variant="outlined" onClick={signOut}>Sair</Button>
      </AccessMessage>
    );
  }

  if (status === "error") {
    return (
      <AccessMessage title="Não foi possível verificar o acesso" description={error}>
        <Button variant="contained" onClick={retry}>Tentar novamente</Button>
        <Button variant="outlined" onClick={signOut}>Sair</Button>
      </AccessMessage>
    );
  }

  return children;
}
