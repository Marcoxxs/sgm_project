import { createTheme } from "@mui/material/styles";

const primary = "#2055C5";
const ink = "#142744";
const line = "#DFE7F1";

export default createTheme({
  palette: {
    primary: { main: primary, light: "#EEF4FF", dark: "#153E98" },
    background: { default: "#F5F7FB", paper: "#FFFFFF" },
    text: { primary: ink, secondary: "#51647D" },
    divider: line,
    success: { main: "#24724D" },
    warning: { main: "#92610A" },
    error: { main: "#B83442" },
    institutional: {
      navy: "#122746",
      sidebar: "#101F38",
      sidebarText: "#B7C7DE",
      sidebarLine: "#2A3B56",
      sidebarActive: "#234578",
      accent: "#91B7FF",
      soft: "#EEF4FF",
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Inter, "Segoe UI", system-ui, sans-serif',
    h1: { fontSize: "2rem", fontWeight: 750, letterSpacing: "-0.035em", lineHeight: 1.15 },
    h2: { fontSize: "1.375rem", fontWeight: 720, letterSpacing: "-0.025em", lineHeight: 1.25 },
    h3: { fontSize: "1.125rem", fontWeight: 700, lineHeight: 1.25 },
    body1: { lineHeight: 1.55 },
    body2: { lineHeight: 1.5 },
    button: { fontWeight: 650, textTransform: "none" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "a:focus-visible, button:focus-visible, [tabindex]:focus-visible": {
          outline: "2px solid currentColor",
          outlineOffset: 3,
        },
      },
    },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: { root: { borderColor: line } },
    },
  },
});
