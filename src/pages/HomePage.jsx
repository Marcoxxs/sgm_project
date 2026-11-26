import { Box, Card, CardActionArea, Divider, Stack, Typography } from "@mui/material";
import ArrowForward from "@mui/icons-material/ArrowForward";
import DesktopWindowsOutlined from "@mui/icons-material/DesktopWindowsOutlined";
import GridViewOutlined from "@mui/icons-material/GridViewOutlined";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { navigation } from "../routes/navigation";

const labs = [
  { name: "Delta Lab", computers: 15, rows: 3, columns: 5 },
  { name: "Carnaúba Lab", computers: 24, rows: 4, columns: 6 },
];

const quickLinks = navigation.filter(({ path }) => ["/cadastros", "/registros", "/dashboard"].includes(path));

export default function HomePage() {
  return (
    <Stack spacing={{ xs: 3, md: 4 }}>
      <PageHeader title="Home" description="Visão geral dos laboratórios do Campus Parnaíba." />

      <Box
        component="section"
        aria-labelledby="intro-title"
        sx={{
          bgcolor: "institutional.navy", color: "common.white", borderRadius: 1,
          px: { xs: 3, sm: 4 }, py: { xs: 3, sm: 4 },
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4,
        }}
      >
        <Stack spacing={1.25}>
          <Typography component="h2" variant="h2" id="intro-title" sx={{ fontSize: { sm: "1.75rem" } }}>
            Gerenciamento de laboratórios
          </Typography>
          <Typography sx={{ color: "institutional.sidebarText", maxWidth: 475 }}>
            Consulte a estrutura do Delta Lab e do Carnaúba Lab e navegue pelas áreas do SGMLab.
          </Typography>
        </Stack>
        <Box
          aria-hidden="true"
          sx={{
            display: { xs: "none", sm: "grid" }, placeItems: "center", flexShrink: 0,
            width: 96, height: 96, border: 1, borderColor: "institutional.sidebarActive",
            bgcolor: "institutional.sidebarLine", borderRadius: 1, color: "institutional.accent",
          }}
        >
          <DesktopWindowsOutlined sx={{ fontSize: 46 }} />
        </Box>
      </Box>

      <Stack component="section" aria-labelledby="labs-title" spacing={1.5}>
        <Typography component="h2" variant="h2" id="labs-title">Laboratórios</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
          {labs.map(({ name, computers, rows, columns }) => (
            <Card component="article" key={name}>
              <Stack spacing={2} sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ display: "grid", placeItems: "center", width: 42, height: 42, bgcolor: "institutional.soft", color: "primary.main", borderRadius: 1 }}>
                    <DesktopWindowsOutlined fontSize="small" />
                  </Box>
                  <Typography component="h3" variant="h3">{name}</Typography>
                </Stack>
                <Divider />
                <Stack direction="row" flexWrap="wrap" columnGap={3} rowGap={1}>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <DesktopWindowsOutlined fontSize="small" color="action" />
                    <Typography variant="body2"><strong>{computers}</strong> computadores</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <GridViewOutlined fontSize="small" color="action" />
                    <Typography variant="body2"><strong>{rows} × {columns}</strong> posições</Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Card>
          ))}
        </Box>
      </Stack>

      <Stack component="section" aria-labelledby="quick-title" spacing={1.5}>
        <Typography component="h2" variant="h2" id="quick-title">Acesso rápido</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
          {quickLinks.map(({ path, label, Icon }) => (
            <Card key={path}>
              <CardActionArea component={Link} to={path} sx={{ px: 2, py: 1.75, "&:focus-visible": { outlineOffset: -3 } }}>
                <Stack direction="row" alignItems="center" spacing={1.25}>
                  <Icon color="primary" fontSize="small" />
                  <Typography variant="body2" sx={{ flex: 1, fontWeight: 700 }}>{label}</Typography>
                  <ArrowForward color="action" fontSize="small" />
                </Stack>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Stack>
    </Stack>
  );
}
