import "./style.css";
import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import FiltroComponent from "../../components/FiltroComponent";

const laboratorios = ["Delta Lab", "Carnauba Lab"];
const semestres = [
  "1º Semestre",
  "2º Semestre",
  "3º Semestre",
  "4º Semestre",
  "5º Semestre",
  "6º Semestre",
  "7º Semestre",
  "8º Semestre",
  "9º Semestre",
  "10º Semestre",
];
const onFiltrar = () => {
  console.log("filtrando");
};

const rows = [
  {
    nome: "Alice Ferreira da Silva",
    laboratorio: "Carnauba Lab",
    computador: "Comp. 04",
    data: "14/11/2025",
    tempoUtilizado: "02:32:54",
  },
  {
    nome: "Lara Moreira da Costa",
    laboratorio: "Delta Lab",
    computador: "Comp. 20",
    data: "13/11/2025",
    tempoUtilizado: "01:12:37",
  },
  {
    nome: "Júlia Andrade da Rocha",
    laboratorio: "Carnauba Lab",
    computador: "Comp. 02",
    data: "13/11/2025",
    tempoUtilizado: "04:12:04",
  },
  {
    nome: "Carlos Menezes Cunha",
    laboratorio: "Carnauba Lab",
    computador: "Comp. 05",
    data: "12/11/2025",
    tempoUtilizado: "02:32:54",
  },
  {
    nome: "Bruno Cardoso Silva",
    laboratorio: "Delta Lab",
    computador: "Comp. 12",
    data: "10/11/2025",
    tempoUtilizado: "04:12:04",
  },
  {
    nome: "Camila Pereira Noronha",
    laboratorio: "Delta Lab",
    computador: "Comp. 16",
    data: "10/11/2025",
    tempoUtilizado: "02:32:54",
  },
];

function RegistrosPage() {
  return (
    <Container className="registrosPage" maxWidth="lg">
      <Box className="registrosHeader">
        <div>
          <Typography variant="h4" component="h1" className="registrosTitle">
            Registros de Acesso
          </Typography>
        </div>
        <Box className="registrosActions">
          <Button className="registrosButton secondary" disableElevation>
            Atualizar
          </Button>
          <Button className="registrosButton primary" disableElevation>
            Exportar registros
          </Button>
        </Box>
      </Box>

      <Box className="registrosFilters">
        <FiltroComponent
          onFiltrar={onFiltrar}
          semestres={semestres}
          laboratorios={laboratorios}
          showButton={true}
        />
      </Box>

      <TableContainer
        component={Paper}
        className="registrosTablePaper"
        elevation={0}
      >
        <Table
          className="registrosTable"
          aria-label="registros de acesso"
          sx={{ width: "100%" }}
        >
          <TableHead>
            <TableRow>
              <TableCell className="registrosTableCellHeader">
                Nome Completo
              </TableCell>
              <TableCell className="registrosTableCellHeader">
                Laboratório
              </TableCell>
              <TableCell className="registrosTableCellHeader">
                Computador
              </TableCell>
              <TableCell className="registrosTableCellHeader">Data</TableCell>
              <TableCell className="registrosTableCellHeader">
                Tempo Utilizado
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.nome} className="registrosTableRow">
                <TableCell
                  className="registrosTableCell"
                  component="th"
                  scope="row"
                >
                  {row.nome}
                </TableCell>
                <TableCell className="registrosTableCell">
                  <span
                    className={`laboratorioBadge ${row.laboratorio === "Carnauba Lab" ? "green" : "yellow"}`}
                  >
                    {row.laboratorio}
                  </span>
                </TableCell>
                <TableCell className="registrosTableCell">
                  {row.computador}
                </TableCell>
                <TableCell className="registrosTableCell">{row.data}</TableCell>
                <TableCell className="registrosTableCell">
                  {row.tempoUtilizado}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default RegistrosPage;
