import { Link } from "react-router-dom";
import "./style.css";
import { useNavigate } from "react-router-dom";
import { Container } from "@mui/material";
import FilhoComponent from "../DashboardsPage/teste";

function AjudaPage() {
  const navigate = useNavigate();
  const colaboradores = [
  {
    id: 1,
    nome: "Ana",
    cargo: "Desenvolvedora",
    ativo: true
  },
  {
    id: 2,
    nome: "Carlos",
    cargo: "QA",
    ativo: false
  },
  {
    id: 3,
    nome: "Marina",
    cargo: "UX Designer",
    ativo: true
  },
  {
    id: 4,
    nome: "João",
    cargo: "Desenvolvedor Backend",
    ativo: true
  },
  {
    id: 5,
    nome: "Fernanda",
    cargo: "Product Owner",
    ativo: true
  },
  {
    id: 6,
    nome: "Ricardo",
    cargo: "Scrum Master",
    ativo: false
  },
  {
    id: 7,
    nome: "Patrícia",
    cargo: "DevOps",
    ativo: true
  },
  {
    id: 8,
    nome: "Lucas",
    cargo: "Desenvolvedor Frontend",
    ativo: false
  },
  {
    id: 9,
    nome: "Juliana",
    cargo: "Analista de Negócios",
    ativo: true
  },
  {
    id: 10,
    nome: "Roberto",
    cargo: "Arquiteto de Software",
    ativo: true
  },
  {
    id: 11,
    nome: "Camila",
    cargo: "QA",
    ativo: true
  },
  {
    id: 12,
    nome: "Thiago",
    cargo: "Desenvolvedor Full Stack",
    ativo: false
  },
  {
    id: 13,
    nome: "Amanda",
    cargo: "UX Researcher",
    ativo: true
  },
  {
    id: 14,
    nome: "Felipe",
    cargo: "Tech Lead",
    ativo: true
  },
  {
    id: 15,
    nome: "Beatriz",
    cargo: "Analista de Dados",
    ativo: false
  },
  {
    id: 16,
    nome: "Rafael",
    cargo: "Desenvolvedor Mobile",
    ativo: true
  },
  {
    id: 17,
    nome: "Larissa",
    cargo: "Product Designer",
    ativo: true
  },
  {
    id: 18,
    nome: "Gustavo",
    cargo: "Administrador de Banco de Dados",
    ativo: false
  },
  {
    id: 19,
    nome: "Vanessa",
    cargo: "Analista de Sistemas",
    ativo: true
  },
  {
    id: 20,
    nome: "Bruno",
    cargo: "Desenvolvedor Frontend",
    ativo: true
  }
];
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
      <FilhoComponent nome="Exemplo" id={1} cargo="Desenvolvedor" ativo={true} />
    </Container>
  );
}

export default AjudaPage;