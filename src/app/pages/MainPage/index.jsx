import "./style.css";
import { Box } from "@mui/material";
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
