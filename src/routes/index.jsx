import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import RequireAuth from "../auth/RequireAuth";
import AppLayout from "../components/AppLayout";
import LoginPage from "../pages/LoginPage";
import PersonDetailsPage from "../pages/PersonDetailsPage";
import RecordsPage from "../pages/RecordsPage";
import RegistrationPage from "../pages/RegistrationPage";
import HomePage from "../pages/HomePage";
import SectionPage from "../pages/SectionPage";
import { navigation } from "./navigation";

const implementedPaths = new Set(["/", "/cadastros", "/registros"]);

export default function AppRoutes({ repository }) {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={(
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          )}
        >
          <Route index element={<HomePage repository={repository} />} />
          <Route path="/cadastros" element={<RegistrationPage repository={repository} />} />
          <Route path="/registros" element={<RecordsPage repository={repository} />} />
          <Route path="/registros/:personId" element={<PersonDetailsPage repository={repository} />} />
          {navigation.filter(({ path }) => !implementedPaths.has(path)).map((section) => (
            <Route key={section.path} path={section.path} element={<SectionPage {...section} />} />
          ))}
          <Route path="/laboratorio" element={<Navigate to="/" replace />} />
          <Route path="*" element={<SectionPage label="Página não encontrada" description="Confira o endereço ou escolha uma seção no menu." />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
