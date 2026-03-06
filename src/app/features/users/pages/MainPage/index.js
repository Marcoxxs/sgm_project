import { Link } from "react-router-dom";
import MenuComponent from "../../components/MenuComponent";
import "./style.css"
function MainPage() {
    return (
        <div className="main">
            <div><MenuComponent /></div>
            <div className="menu">
                <h1> Pagina Inicial
                </h1>
                <Link to="/laboratorio">ir para o laboratorio</Link>
                <h1 className="text-3xl font-bold text-blue-600">Hello Tailwind!</h1>
            </div>
        </div>
    )
}
export default MainPage;