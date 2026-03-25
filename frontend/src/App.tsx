import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { theme } from './theme';
import Navbar from './components/common/Navbar';
import PresaleContainer from './containers/pre-sale';
import './index.scss';
import styles from './App.module.scss';

import StakeContainer from './containers/stake';


function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box className={styles.app}>
          <Navbar />
          
          {/* Main Content Area */}
          <Box className={styles['app-main']}>
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
