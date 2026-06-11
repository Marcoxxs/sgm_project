import { Link } from "react-router-dom";
import "./style.css"
import { Container } from "@mui/material";
import FiltroComponent from "../../components/FiltroComponent";

const laboratorios = ["Delta Lab", "Carnauba Lab"]
const semestres = ["1º Semestre", "2º Semestre", "3º Semestre", "4º Semestre", "5º Semestre", "6º Semestre", "7º Semestre", "8º Semestre", "9º Semestre", "10º Semestre"]
const onFiltrar = () => {
    console.log("filtrando")
}

function RegistrosPage() {
    return (
        <Container>
            <FiltroComponent onFiltrar={onFiltrar} semestres={semestres} laboratorios={laboratorios} showButton={true}/>
                <div className="main">
                    <div className="menu">
                        <h1> Pagina Registros
                        </h1>
                        <Link to="/laboratorio">ir para o laboratorio</Link>
                    </div>
                </div>
        </Container>
    )
}

export default RegistrosPage;