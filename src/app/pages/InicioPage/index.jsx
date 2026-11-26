import { useState } from "react";
import "./style.css";
import { Box, Container, Tab, Tabs } from "@mui/material";
import MesaComponent from "../../components/MesaComponent";

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function InicioPage() {
  const [value, setValue] = useState("1");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const lab1 = [
    {mesa: 1, status: "livre"},
    {mesa: 2, status: "ocupada"},
    {mesa: 3, status: "livre"},
    {mesa: 4, status: "manutencao"},
    {mesa: 5, status: "livre"},
    {mesa: 6, status: "ocupada"},
    {mesa: 7, status: "livre"},
    {mesa: 8, status: "manutencao"},
    {mesa: 9, status: "livre"},
    {mesa: 10, status: "ocupada"},
    {mesa: 11, status: "livre"},
    {mesa: 12, status: "manutencao"},
    {mesa: 13, status: "livre"},
    {mesa: 14, status: "ocupada"},
    {mesa: 15, status: "livre"}
  ]

  const lab2 = [
    {mesa: 1, status: "livre"},
    {mesa: 2, status: "ocupada"},
    {mesa: 3, status: "livre"},
    {mesa: 4, status: "manutencao"},
    {mesa: 5, status: "livre"},
    {mesa: 6, status: "ocupada"},
    {mesa: 7, status: "livre"},
    {mesa: 8, status: "manutencao"},
    {mesa: 9, status: "livre"},
    {mesa: 10, status: "ocupada"},
    {mesa: 11, status: "livre"},
    {mesa: 12, status: "manutencao"},
    {mesa: 13, status: "livre"},
    {mesa: 14, status: "ocupada"},
    {mesa: 15, status: "livre"},
    {mesa: 16, status: "ocupada"},
    {mesa: 17, status: "livre"},
    {mesa: 18, status: "manutencao"},
    {mesa: 19, status: "livre"},
    {mesa: 20, status: "ocupada"},
    {mesa: 21, status: "livre"},
    {mesa: 22, status: "manutencao"},
    {mesa: 23, status: "livre"},
    {mesa: 24, status: "ocupada"}
  ]

  return (
    <Container>
      <Box sx={{ width: "100%", typography: "body1" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={value} onChange={handleChange} aria-label="Laboratórios">
            <Tab label="Delta Lab" value="1" id="tab-delta" aria-controls="panel-delta" />
            <Tab label="Carnauba Lab" value="2" id="tab-carnauba" aria-controls="panel-carnauba" />
          </Tabs>
        </Box>
        <Box
          role="tabpanel"
          id="panel-delta"
          aria-labelledby="tab-delta"
          hidden={value !== "1"}
          sx={{ p: 3 }}
        >
          {value === "1" && (
            <Box sx={{ display: "flex", flexDirection: "row", gap: 2, flexWrap: "wrap" }}>
              {lab1.map((mesa) => (
                <MesaComponent key={mesa.mesa} numero={mesa.mesa} status={mesa.status} />
              ))}
            </Box>
          )}
        </Box>
        <Box
          role="tabpanel"
          id="panel-carnauba"
          aria-labelledby="tab-carnauba"
          hidden={value !== "2"}
          sx={{ p: 3 }}
        >
          {value === "2" && <Box className="mesaGrid carnaubaGrid" />}
        </Box>
      </Box>
    </Container>
  );
}
export default InicioPage;
