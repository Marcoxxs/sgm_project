import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import { AppRegistration, ChevronRight, GroupAdd, Help, HomeOutlined, NoteAlt, QueryStats, } from '@mui/icons-material';
import { HelpIcon } from '@mui/icons-material/Help';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';

function MenuComponent() {

  const navigate = useNavigate()

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate("/")}>
            <ListItemIcon>
              <HomeOutlined />
            </ListItemIcon>
            <ListItemText primary='Inicio' />
          </ListItemButton>
        </ListItem>
        <div>
          <Accordion expanded={true}>
            <AccordionSummary>
              <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                <Box sx={{ display: "flex", gap: 4 }}>
                  <GroupAdd sx={{ opacity: 0.6 }} />
                  <Typography component="span">Cadastros</Typography>
                </Box>
                <Box>
                  <ChevronRight />
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Alunos
              </Typography>
              <Typography>
                Visitantes
              </Typography>
            </AccordionDetails>
          </Accordion>
        </div>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate("/registros")}>
            <ListItemIcon>
              <AppRegistration />
            </ListItemIcon>
            <ListItemText primary='Registros' />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate("/dashboard")}>
            <ListItemIcon>
              <QueryStats />
            </ListItemIcon>
            <ListItemText primary='Dashboards' />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate("/anotacoes")}>
            <ListItemIcon>
              <NoteAlt />
            </ListItemIcon>
            <ListItemText primary='Anotações' />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate("/ajuda")}>
            <ListItemIcon>
              <Help />
            </ListItemIcon>
            <ListItemText primary='Ajuda' />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <div>
      <Drawer variant="permanent" sx={{
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
          },
        }}
      >
        {DrawerList}
      </Drawer>
    </div>
  );
}

export default MenuComponent;