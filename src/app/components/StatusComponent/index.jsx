import { Box, Card } from "@mui/material";

function StatusComponent({ nome, cor, icone }) {
  return (
    <Box>
      <Card sx={{ backgroundColor: cor }}>
        <img src={icone}></img>
        nome: {nome}
      </Card>
    </Box>
  );
}

export default StatusComponent;
