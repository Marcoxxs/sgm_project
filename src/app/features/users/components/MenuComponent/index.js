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
import { AppRegistration, GroupAdd, Help, HomeOutlined, NoteAlt, QueryStats } from '@mui/icons-material';
import { HelpIcon } from '@mui/icons-material/Help';

function MenuComponent() {

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                 <HomeOutlined />
              </ListItemIcon>
              <ListItemText primary='Inicio' />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                 <GroupAdd />
              </ListItemIcon>
              <ListItemText primary='Cadastros' />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                 <AppRegistration />
              </ListItemIcon>
              <ListItemText primary='Registros' />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                 <QueryStats />
              </ListItemIcon>
              <ListItemText primary='Dashboards' />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                 <NoteAlt />
              </ListItemIcon>
              <ListItemText primary='Anotações' />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
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
      <Drawer variant='temporary' open={true} elevation={0} hideBackdrop={true}>
        {DrawerList}
      </Drawer>
    </div>
  );
}
   
export default MenuComponent;