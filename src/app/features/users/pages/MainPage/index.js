import { useState } from "react";
import "./style.css"
import { Box, Container } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Tab from '@mui/material/Tab';
import MesaComponent from "../../components/MesaComponent";

function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

function MainPage() {
    const [value, setValue] = useState('1');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const deltaMesas = Array.from({ length: 15 }, (_, index) => index + 1);
    const carnaubaMesas = Array.from({ length: 24 }, (_, index) => index + 1);
    const deltaRows = chunkArray(deltaMesas, 5);
    const carnaubaRows = chunkArray(carnaubaMesas, 6);

    return (
        <Container>
            <Box sx={{ width: '100%', typography: 'body1' }}>
                <TabContext value={value}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <TabList onChange={handleChange} aria-label="lab API tabs example">
                            <Tab label="Delta Lab" value="1" />
                            <Tab label="Carnauba Lab" value="2" />
                        </TabList>
                    </Box>
                    <TabPanel value="1">
                        <Box className="mesaGrid deltaGrid">
                            {deltaRows.map((row, rowIndex) => (
                                <Box key={rowIndex} className="mesaRow">
                                    {row.map((numero) => (
                                        <Box key={numero} className="mesaItem">
                                            <MesaComponent numero={numero} />
                                        </Box>
                                    ))}
                                </Box>
                            ))}
                        </Box>
                    </TabPanel>

                    <TabPanel value="2">
                        <Box className="mesaGrid carnaubaGrid">
                            {carnaubaRows.map((row, rowIndex) => (
                                <Box key={rowIndex} className="mesaRow carnaubaRow">
                                    <Box className="mesaGroup">
                                        {row.slice(0, 3).map((numero) => (
                                            <Box key={numero} className="mesaItem">
                                                <MesaComponent numero={numero} />
                                            </Box>
                                        ))}
                                    </Box>
                                    <Box className="mesaGroup">
                                        {row.slice(3, 6).map((numero) => (
                                            <Box key={numero} className="mesaItem">
                                                <MesaComponent numero={numero} />
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </TabPanel>
                </TabContext>
            </Box>
        </Container>
    )
}
export default MainPage;
