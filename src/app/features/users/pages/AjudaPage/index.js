import { Link } from "react-router-dom";
import MenuComponent from "../../components/MenuComponent";
import "./style.css"
import { useNavigate } from "react-router-dom";

function AjudaPage() {
    const navigate = useNavigate();
    return (
        <div className="main">
            <div className="menu" style={{marginLeft:'500px'}}>
                <h1> Pagina Ajuda
                </h1>
                <Link to="/laboratorio">ir para o laboratorio</Link>
                <button onClick={() => navigate("/laboratorio")}>
                    Ir paa laboratorio
                </button>
            </div>
        </div>
    )
}

export default AjudaPage;