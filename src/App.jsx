import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import AppRoutes from "./routes";
import { memoryLabRepository } from "./services/repositories/memoryLabRepository";
import theme from "./theme";

export default function App({ repository = memoryLabRepository }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRoutes repository={repository} />
    </ThemeProvider>
  );
}
