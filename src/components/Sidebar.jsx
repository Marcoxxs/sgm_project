import { Avatar, Box, Button, IconButton, List, ListItem, ListItemButton, Stack, Typography } from "@mui/material";
import Close from "@mui/icons-material/Close";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";
import PersonOutline from "@mui/icons-material/PersonOutline";
import { NavLink } from "react-router-dom";
import { navigation } from "../routes/navigation";

export default function Sidebar({ onClose }) {
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
              <PersonOutline fontSize="small" />
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 650 }}>Perfil do monitor</Typography>
          </Stack>
          <Button
            disabled
            startIcon={<LogoutOutlined />}
            sx={{ alignSelf: "flex-start", "&.Mui-disabled": { color: "institutional.sidebarText", opacity: 0.7 } }}
          >
            Sair
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
}
