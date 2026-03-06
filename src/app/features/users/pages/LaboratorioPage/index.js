import { Link } from "react-router-dom";
import MenuComponent from "../../components/MenuComponent";
import "./style.css"
function LaboratorioPage() {
    return (
            <div className="main"> 
                <div><MenuComponent/></div>
                <div className="menu">
                    <h1> Pagina Laboratorio 
                    </h1>
                    <Link to="/laboratorio">ir para o laboratorio</Link>
                </div>
            </div>
    )
}   
export default LaboratorioPage;