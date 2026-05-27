import { Link } from "react-router-dom";
import { useState } from "react";
import MenuComponent from "../../components/MenuComponent";
import "./style.css"
import { Box } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Tab from '@mui/material/Tab';
import MesaComponent from "../../components/MesaComponent";
import SalaComponent from "../../components/SalaComponent";

function MainPage() {

    const [value, setValue] = useState('1');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ marginLeft: "350px", width: '100%', typography: 'body1' }}>
            <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList onChange={handleChange} aria-label="lab API tabs example">
                        <Tab label="Delta Lab" value="1" />
                        <Tab label="Carnauba Lab" value="2" />
                    </TabList>
                </Box>
                <TabPanel value="1">
                    <SalaComponent
                        nome="Delta Lab"
                        linhas={3}
                        colunas={5}
                    />
                </TabPanel>

                <TabPanel value="2">
                    <SalaComponent
                        nome="Carnauba Lab"
                        linhas={4}
                        colunas={6}
                    />
                </TabPanel>
            </TabContext>
        </Box>
    )
}
export default MainPage;
