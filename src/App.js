import './App.css';
import RoutesApp from './routes';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import tema from './tema';

function App() {
  return (

  <ThemeProvider theme={tema}>
      <CssBaseline />
      <RoutesApp/>
    </ThemeProvider>

  );
}

export default App;
