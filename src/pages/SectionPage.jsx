import { Box, Card, Stack, Typography } from "@mui/material";
import PageHeader from "../components/PageHeader";

export default function SectionPage({ label, description, details, Icon }) {
  return (
    <Stack spacing={3}>
      <PageHeader title={label} description={description} />
      {details && <Card>
        <Stack alignItems="flex-start" spacing={1.25} sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: "grid", placeItems: "center", width: 44, height: 44, bgcolor: "institutional.soft", color: "primary.main", borderRadius: 1 }}>
            <Icon />
          </Box>
          <Typography component="h2" variant="h2">Em preparação</Typography>
          <Typography color="text.secondary">{details}</Typography>
        </Stack>
      </Card>}
    </Stack>
  );
}
