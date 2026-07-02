import { createTheme } from "@mui/material";

const tema = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#8f2929",
    },
    secondary: {
      main: "#3f56a3",
    },
    background: {
      default: "#cccccc",
    },
  },
  components: {
    MuiContainer: { styleOverrides: { root: { marginLeft: 250 } } },
    MuiDrawer: {
      styleOverrides: {},
    },
  },
});

export default tema;
