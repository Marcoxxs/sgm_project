import { Link } from "react-router-dom";
import "./style.css";
import { useNavigate } from "react-router-dom";
import { Container } from "@mui/material";

function AjudaPage() {
  const navigate = useNavigate();
  return (
    <Container>
      <div className="main">
        <div className="menu" style={{ marginLeft: "500px" }}>
          <h1> Pagina Ajuda</h1>
          <Link to="/laboratorio">ir para o laboratorio</Link>
          <button onClick={() => navigate("/laboratorio")}>
            Ir paa laboratorio
          </button>
        </div>
      </div>
    </Container>
  );
}

export default AjudaPage;
