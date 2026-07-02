import { BrowserRouter, Route, Routes } from "react-router-dom";
import LaboratorioPage from "./app/pages/LaboratorioPage";
import RegistrosPage from "./app/pages/RegistrosPage";
import DashboardsPage from "./app/pages/DashboardsPage";
import AnotacoesPage from "./app/pages/AnotacoesPage";
import AjudaPage from "./app/pages/AjudaPage";
import InicioPage from "./app/pages/InicioPage";
import MainPage from "./app/pages/MainPage";

function RoutesApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainPage />}>
          <Route path="/" element={<InicioPage />} />
          <Route path="/registros" element={<RegistrosPage />} />
          <Route path="/dashboard" element={<DashboardsPage />} />
          <Route path="/anotacoes" element={<AnotacoesPage />} />
          <Route path="/ajuda" element={<AjudaPage />} />
          <Route path="/laboratorio" element={<LaboratorioPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default RoutesApp;
