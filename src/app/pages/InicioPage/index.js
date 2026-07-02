import { useState } from "react";
import "./style.css";
import { Box, Container } from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Tab from "@mui/material/Tab";
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
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList onChange={handleChange} aria-label="lab API tabs example">
              <Tab label="Delta Lab" value="1" />
              <Tab label="Carnauba Lab" value="2" />
            </TabList>
          </Box>
          <TabPanel value="1">
            <Box  sx={{display:"flex", flexDirection:'row', gap: 2, flexWrap:'wrap', }}>
              { 
                lab1.map((mesa) => (
                  <MesaComponent key={mesa.mesa} numero={mesa.mesa} status={mesa.status} />
                ))  
              }
            </Box>
          </TabPanel>

          <TabPanel value="2">
            <Box className="mesaGrid carnaubaGrid">
              {/* Mesa carnauba Lab */}
            </Box>
          </TabPanel>
        </TabContext>
      </Box>
    </Container>
  );
}
export default InicioPage;
