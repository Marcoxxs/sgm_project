import { Link } from "react-router-dom";

function MenuComponent() {
    return (
            <div>
                <ul> 
                    <li><Link to="/">Home</Link></li>                     
                    <li><Link to="/laboratorio">laboratorio</Link></li> 
                    <li><Link to="/registros">Registros</Link></li> 
                    <li><Link to="/dashboard">Dashboards</Link></li> 
                    <li><Link to="/anotacoes">Anotações</Link></li> 
                    <li><Link to="/ajuda">Ajuda</Link></li> 
                </ul> 
                
            </div>
    )
}   
export default MenuComponent;