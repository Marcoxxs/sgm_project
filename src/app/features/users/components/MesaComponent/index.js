import { Link } from "react-router-dom";
import MenuComponent from "../../components/MenuComponent";
import { useNavigate } from "react-router-dom";
import { Box, CardMedia, Typography } from "@mui/material";

function MesaComponent() {
    return (
        <Box>
            <CardMedia component="img" image="./mesa_default.png" sx={{width:"200px"}}/> 
            <CardMedia component="img" image="./mesa_fix.png" sx={{width:"200px", display: "none"}}/> 
            <CardMedia component="img" image="./mesa_hover.png" sx={{width:"200px", display: "none"}}/> 
            <CardMedia component="img" image="./mesa_active.png" sx={{width:"200px", display: "none"}}/> 
            <Typography sx={{}}>01</Typography>
        </Box>
    )
}

export default MesaComponent;