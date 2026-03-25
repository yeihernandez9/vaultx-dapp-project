import { AppBar, Toolbar, Typography, Box, Button, Chip } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useWeb3React } from '../../hooks/useWeb3React';

export default function Navbar() {
  const { account, activate, active, deactivate, chainId, switchToGanache } = useWeb3React();
  const location = useLocation();

  const navLinks = [
    { title: 'Presale', path: '/' },
    { title: 'Staking', path: '/stake' },
  ];

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        background: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 8 }, py: 1 }}>
        
        {/* Logo Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography 
            variant="h5" 
            fontWeight={800} 
            sx={{ 
              background: 'linear-gradient(45deg, #00b0d7, #7b1fa2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: 1
            }}
          >
            VaultX
          </Typography>
        </Box>

        {/* Navigation Links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4 }}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Button
                key={link.title}
                component={NavLink}
                to={link.path}
                sx={{
                  color: isActive ? 'white' : 'text.secondary',
                  fontSize: '1rem',
                  fontWeight: isActive ? 700 : 500,
                  textTransform: 'none',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: isActive ? '100%' : '0%',
                    height: '2px',
                    background: 'linear-gradient(90deg, #00b0d7, #7b1fa2)',
                    transition: 'width 0.3s ease'
                  },
                  '&:hover': {
                    color: 'white',
                    background: 'transparent'
                  }
                }}
              >
                {link.title}
              </Button>
            );
          })}
        </Box>

        {/* Wallet & Network Utilities */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {active && chainId !== 1337 && (
            <Chip
              label="⚠️ Switch to Ganache"
              clickable
              color="error"
              onClick={switchToGanache}
              sx={{ borderRadius: 2, fontWeight: 600, display: { xs: 'none', sm: 'flex' } }}
            />
          )}

          <Chip
            icon={<AccountBalanceWalletIcon />}
            label={active ? `${account?.slice(0, 6)}...${account?.slice(-4)}` : 'Connect Wallet'}
            clickable
            color={active ? 'secondary' : 'default'}
            onClick={active ? deactivate : activate}
            sx={{
              py: 2.5, px: 2, fontSize: '1rem', borderRadius: 4,
              fontWeight: 600,
              bgcolor: active ? 'secondary.dark' : 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: active ? 'error.dark' : 'rgba(255,255,255,0.2)' },
              transition: 'background-color 0.2s',
            }}
          />
        </Box>

      </Toolbar>
    </AppBar>
  );
}
