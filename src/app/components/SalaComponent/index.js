import { Box, Typography } from "@mui/material";
import MesaComponent from "../MesaComponent";

function SalaComponent() {
  const mesas = [
    { id: 1, x: 100, y: 100 },
    { id: 2, x: 320, y: 100 },
    { id: 3, x: 540, y: 100 },
    { id: 4, x: 760, y: 100 },
    { id: 5, x: 980, y: 100 },
    { id: 6, x: 100, y: 200 },
    { id: 7, x: 320, y: 200 },
    { id: 8, x: 540, y: 200 },
    { id: 9, x: 760, y: 200 },
    { id: 10, x: 980, y: 200 },
    { id: 11, x: 100, y: 300 },
    { id: 12, x: 320, y: 300 },
    { id: 13, x: 540, y: 300 },
    { id: 14, x: 760, y: 300 },
    { id: 15, x: 980, y: 300 },
  ];

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "700px",
        overflow: "hidden",
      }}
    >
      {mesas.map((mesa) => {
        <Box
          key={mesas.id}
          sx={{
            position: "absolute",
            left: mesas.x,
            top: mesas.y,
          }}
        >
          <MesaComponent numero={mesas.id} />
        </Box>;
      })}
    </Box>
  );
}
