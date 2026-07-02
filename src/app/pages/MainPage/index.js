import { useState } from "react";
import "./style.css";
import { Box, Container, Menu } from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Tab from "@mui/material/Tab";
import MesaComponent from "../../components/MesaComponent";
import MenuComponent from "../../components/MenuComponent";
import { Outlet } from "react-router-dom";

function MainPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        pb: 7,
        display: { md: "flex", sx: "block" },
        flexDirection: { md: "row", sx: "column" },
      }}
    >
      <MenuComponent />
      <Box sx={{ flex: 1, pb: 0 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
export default MainPage;
