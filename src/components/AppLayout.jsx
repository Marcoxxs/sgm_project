import { useState } from "react";
import { Box, Drawer, IconButton, Stack, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Menu from "@mui/icons-material/Menu";
import { Link, Outlet, useLocation } from "react-router-dom";
import { navigation } from "../routes/navigation";
import Sidebar from "./Sidebar";

const sidebarWidth = 248;

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("md"));
  const { pathname } = useLocation();
  const title = navigation.find(({ path }) => path === "/"
    ? pathname === "/"
    : pathname === path || pathname.startsWith(`${path}/`))?.label;
  const closeMenu = () => setMenuOpen(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh" }}>
      <Box
        component="a"
        href="#conteudo"
        sx={{ position: "fixed", zIndex: "tooltip", top: 12, left: 12, p: 1, transform: "translateY(-200%)", "&:focus": { transform: "none", bgcolor: "background.paper" } }}
      >
        Ir para o conteúdo
      </Box>
      <Drawer
        variant={desktop ? "permanent" : "temporary"}
        open={menuOpen}
        onClose={closeMenu}
        sx={{
          width: { md: sidebarWidth },
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: sidebarWidth, maxWidth: "calc(100% - 36px)", boxSizing: "border-box",
            bgcolor: "institutional.sidebar", color: "common.white", border: 0,
          },
        }}
      >
        <Sidebar onClose={closeMenu} />
      </Drawer>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box component="header" sx={{ bgcolor: "background.paper", borderBottom: 1, borderColor: "divider" }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={{ xs: 1, md: 1.5 }}
            sx={{ maxWidth: 1280, mx: "auto", minHeight: { xs: 60, md: 66 }, px: { xs: 2, sm: 3, lg: 5 } }}
          >
            <IconButton
              aria-label="Abrir menu"
              aria-expanded={menuOpen}
              aria-controls={menuOpen ? "navegacao-principal" : undefined}
              onClick={() => setMenuOpen(true)}
              sx={{ display: { md: "none" }, color: "text.primary" }}
            >
              <Menu />
            </IconButton>
            <Typography component={Link} to="/" variant="body2" sx={{ color: "text.secondary", textDecoration: "none", fontWeight: 650 }}>
              SGMLab
            </Typography>
            {title && (
              <>
                <Typography aria-hidden="true" variant="body2" color="text.secondary">/</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{title}</Typography>
              </>
            )}
          </Stack>
        </Box>
        <Box
          component="main"
          id="conteudo"
          tabIndex={-1}
          aria-labelledby="page-title"
          sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, sm: 3, lg: 5 }, py: { xs: 3, md: 4 } }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
