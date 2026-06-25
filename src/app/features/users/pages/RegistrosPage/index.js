import { Link } from "react-router-dom";
import "./style.css"
import { Box, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import FiltroComponent from "../../components/FiltroComponent";

const laboratorios = ["Delta Lab", "Carnauba Lab"]
const semestres = ["1º Semestre", "2º Semestre", "3º Semestre", "4º Semestre", "5º Semestre", "6º Semestre", "7º Semestre", "8º Semestre", "9º Semestre", "10º Semestre"]
const onFiltrar = () => {
    console.log("filtrando")
}

const rows = [
    {nome: "João da Silva", laboratorio: "Delta Lab", computador: "PC-01", data: "01/01/2024", tempoUtilizado: "2h"},
    {nome: "Maria Souza", laboratorio: "Carnauba Lab", computador: "PC-02", data: "02/01/2024", tempoUtilizado: "1h"},
    {nome: "Pedro Oliveira", laboratorio: "Delta Lab", computador: "PC-03", data: "03/01/2024", tempoUtilizado: "3h"},
    {nome: "Ana Costa", laboratorio: "Carnauba Lab", computador: "PC-04", data: "04/01/2024", tempoUtilizado: "2h"},
    {nome: "Lucas Lima", laboratorio: "Delta Lab", computador: "PC-05", data: "05/01/2024", tempoUtilizado: "1h"},
    {nome: "Juliana Rocha", laboratorio: "Carnauba Lab", computador: "PC-06", data: "06/01/2024", tempoUtilizado: "2h"}
];

function RegistrosPage() {
    return (
        <Container>
            <FiltroComponent onFiltrar={onFiltrar} semestres={semestres} laboratorios={laboratorios} showButton={true} />
            <Box>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead >
                            <TableRow>
                                <TableCell align="right">Nome Completo</TableCell>
                                <TableCell align="right">Laboratorio</TableCell>
                                <TableCell align="right">Computador</TableCell>
                                <TableCell align="right">Data</TableCell>
                                <TableCell align="right">Tempo Utilizado</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row) => (
                                <TableRow
                                    key={row.nome}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">
                                        {row.nome}
                                    </TableCell>
                                    <TableCell align="right">{row.laboratorio}</TableCell>
                                    <TableCell align="right">{row.computador}</TableCell>
                                    <TableCell align="right">{row.data}</TableCell>
                                    <TableCell align="right">{row.tempoUtilizado}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Container>
    )
}

export default RegistrosPage;