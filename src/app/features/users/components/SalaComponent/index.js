import { Box, Typography } from "@mui/material";
import MesaComponent from "../MesaComponent";

function SalaComponent({ nome, linhas, colunas }) {

    const total = linhas * colunas;

    return (
        <Box>
            <Typography
                variant="h5"
                sx={{
                    marginBottom: 4,
                    textAlign: "center",
                    fontWeight: "bold"
                }}
            >
                {nome}
            </Typography>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${colunas}, 1fr)`,
                    gap: {
                        xs: 2,
                        sm: 3,
                        md: 5
                    },
                    justifyItems: "center",
                    alignItems: "center",
                    width: "100%",
                }}
            >
                {[...Array(total)].map((_, index) => (
                    <MesaComponent
                        key={index}
                        numero={index + 1}
                    />
                ))}
            </Box>
        </Box>
    );
}

export default SalaComponent;