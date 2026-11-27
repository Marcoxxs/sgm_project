import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { AuthProvider } from "./auth/AuthContext";
import AppRoutes from "./routes";
import { firebaseAuthService } from "./services/firebase/authService";
import { memoryLabRepository } from "./services/repositories/memoryLabRepository";
import theme from "./theme";

export default function App({
  repository = memoryLabRepository,
  authService = firebaseAuthService,
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider authService={authService}>
        <AppRoutes repository={repository} />
      </AuthProvider>
    </ThemeProvider>
  );
}
