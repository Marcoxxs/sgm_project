import { Stack, Typography } from "@mui/material";

export default function PageHeader({ title, description }) {
  return (
    <Stack component="header" spacing={1}>
      <Typography component="h1" variant="h1" id="page-title">{title}</Typography>
      {description && <Typography color="text.secondary">{description}</Typography>}
    </Stack>
  );
}
