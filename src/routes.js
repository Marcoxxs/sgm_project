import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainPage from "./app/features/users/pages/MainPage";
import LaboratorioPage from "./app/features/users/pages/LaboratorioPage";
import RegistrosPage from "./app/features/users/pages/RegistrosPage";
import DashboardsPage from "./app/features/users/pages/DashboardsPage";
import AnotacoesPage from "./app/features/users/pages/AnotacoesPage";
import AjudaPage from "./app/features/users/pages/AjudaPage";

function RoutesApp() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/laboratorio" element={<LaboratorioPage />} />
                <Route path="/registros" element={<RegistrosPage />} />
                <Route path="/dashboard" element={<DashboardsPage />} />
                <Route path="/anotacoes" element={<AnotacoesPage />} />
                <Route path="/ajuda" element={<AjudaPage />} />
            </Routes>
        </BrowserRouter>
    )
}
export default RoutesApp;