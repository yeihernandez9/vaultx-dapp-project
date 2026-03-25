import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { theme } from './theme';
import Navbar from './components/common/Navbar';
import PresaleContainer from './containers/pre-sale';
import './index.css';

import StakeContainer from './containers/stake';


function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          
          {/* Main Content Area */}
          <Box sx={{ flexGrow: 1, mt: 8 }}>
            <Routes>
              <Route path="/" element={<PresaleContainer />} />
              <Route path="/stake" element={<StakeContainer />} />
            </Routes>
          </Box>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
