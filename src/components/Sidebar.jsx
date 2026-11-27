import { Avatar, Box, Button, IconButton, List, ListItem, ListItemButton, Stack, Typography } from "@mui/material";
import Close from "@mui/icons-material/Close";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";
import PersonOutline from "@mui/icons-material/PersonOutline";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { navigation } from "../routes/navigation";

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function Sidebar({ onClose }) {
  const { monitor, user, logout } = useAuth();
  const monitorName = monitor?.name || "Monitor";
  const email = monitor?.email || user?.email || "";

  function signOut() {
    onClose?.();
    void logout().catch(() => {});
  }

  return (
    <Stack sx={{ minHeight: "100%", px: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1, py: 3 }}>
        <Box>
          <Typography component="span" sx={{ fontSize: "1.375rem", fontWeight: 750, letterSpacing: "-0.04em" }}>
            SGMLab <Box component="span" sx={{ color: "institutional.accent" }}>— UESPI</Box>
          </Typography>
          <Typography variant="body2" sx={{ color: "institutional.sidebarText" }}>Campus Parnaíba</Typography>
        </Box>
        <IconButton aria-label="Fechar menu" onClick={onClose} sx={{ color: "inherit", display: { md: "none" } }}>
          <Close />
        </IconButton>
      </Stack>
      <Box component="nav" id="navegacao-principal" aria-label="Navegação principal" sx={{ borderTop: 1, borderColor: "institutional.sidebarLine", pt: 2 }}>
        <List disablePadding>
          {navigation.map(({ path, label, Icon }) => (
            <ListItem key={path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={NavLink}
                to={path}
                end={path === "/"}
                onClick={onClose}
                sx={{
                  gap: 1.5, borderRadius: 1, minHeight: 46, color: "institutional.sidebarText",
                  "&:hover": { bgcolor: "institutional.sidebarLine", color: "common.white" },
                  '&[aria-current="page"]': { bgcolor: "institutional.sidebarActive", color: "common.white" },
                  '&[aria-current="page"] svg': { color: "institutional.accent" },
                }}
              >
                <Icon fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 650 }}>{label}</Typography>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ mt: "auto", pt: 2, pb: 2 }}>
        <Stack spacing={1.25} sx={{ borderTop: 1, borderColor: "institutional.sidebarLine", pt: 2, px: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: "institutional.sidebarLine", color: "institutional.sidebarText" }}>
              {initials(monitorName) || <PersonOutline fontSize="small" />}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 650 }} noWrap>{monitorName}</Typography>
              {email && (
                <Typography variant="caption" sx={{ color: "institutional.sidebarText" }} noWrap component="p">
                  {email}
                </Typography>
              )}
            </Box>
          </Stack>
          <Button
            startIcon={<LogoutOutlined />}
            onClick={signOut}
            sx={{ alignSelf: "flex-start", color: "institutional.sidebarText" }}
          >
            Sair
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
}
