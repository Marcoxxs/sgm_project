import { Link } from "react-router-dom";
import "./style.css";
import { Container } from "@mui/material";
function AnotacoesPage() {
  return (
    <Container>
      <div className="main">
        <div className="menu">
          <h1> Pagina Anotações</h1>
          <Link to="/laboratorio">ir para o laboratorio</Link>
        </div>
      </div>
    </Container>
  );
}
export default AnotacoesPage;
