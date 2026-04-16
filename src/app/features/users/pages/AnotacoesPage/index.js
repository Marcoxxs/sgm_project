import { Link } from "react-router-dom";
import MenuComponent from "../../components/MenuComponent";
import "./style.css"
function AnotacoesPage() {
    return (
            <div className="main"> 
                <div className="menu">
                    <h1> Pagina Anotações
                    </h1>
                    <Link to="/laboratorio">ir para o laboratorio</Link>
                </div>
            </div>
    )
}   
export default AnotacoesPage;