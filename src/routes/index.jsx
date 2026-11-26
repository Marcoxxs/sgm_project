import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import HomePage from "../pages/HomePage";
import SectionPage from "../pages/SectionPage";
import { navigation } from "./navigation";

export default function AppRoutes() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          {navigation.filter(({ path }) => path !== "/").map((section) => (
            <Route key={section.path} path={section.path} element={<SectionPage {...section} />} />
          ))}
          <Route path="/laboratorio" element={<Navigate to="/" replace />} />
          <Route path="*" element={<SectionPage label="Página não encontrada" description="Confira o endereço ou escolha uma seção no menu." />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
