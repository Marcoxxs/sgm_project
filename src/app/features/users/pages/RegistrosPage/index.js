import { Link } from "react-router-dom";
import "./style.css"
import { Container } from "@mui/material";
function RegistrosPage() {
    return (
        <Container>
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