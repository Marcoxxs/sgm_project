import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Box, Button, CardMedia, Typography } from "@mui/material";
import { useState } from "react";
import Modal from '@mui/material/Modal';
import StatusComponent from '../StatusComponent'

function MesaComponent({ numero }) {
    const [hover, setHover] = useState(false);
    const [active, setActive] = useState(false);
    const [open, setOpen] = useState(false);
    const handleClose = () => setOpen(false);
    const getImage = () => {
        if (active) return "./mesa_active.png";
        if (hover) return "./mesa_hover.png";
        return "./mesa_default.png";
    };

    return (
        <Box
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={() => setOpen(true)}
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                transition: "0.2s",
            }}
        >
            <CardMedia
                component="img"
                image={getImage()}
                sx={{
                    width: {
                        xs: "70px",
                        sm: "100px",
                        md: "120px",
                    },
                    transition: "0.2s",
                }}
            />

            <Typography
                sx={{
                    marginTop: 1,
                    fontWeight: "bold",
                    fontSize: {
                        xs: "12px",
                        sm: "14px",
                        md: "16px",
                    }
                }}>
                {numero.toString().padStart(2, "0")}
            </Typography>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description">
                <Box sx={{
                    backgroundColor: "white", position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, p: 4
                }}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Text in a modal
                    </Typography>
                    <Button onClick={() => setOpen(false)}>
                        X
                    </Button>
                    <StatusComponent nome="teste" cor="#078936" />
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                    </Typography>
                </Box>
            </Modal>
        </Box >
    );
}

export default MesaComponent;