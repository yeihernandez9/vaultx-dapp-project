import { AppBar, Toolbar, Typography, Box, Button, Chip } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useWeb3React } from '../../hooks/useWeb3React';
import styles from './Navbar.module.scss'; // SCSS Module Import

export default function Navbar() {
  const { account, activate, active, deactivate, chainId, switchToGanache } = useWeb3React();
  const location = useLocation();

  const navLinks = [
    { title: 'Presale', path: '/' },
    { title: 'Staking', path: '/stake' },
  ];

  return (
    <AppBar position="fixed" elevation={0} className={styles.navbar}>
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 8 }, py: 1 }}>
        
        {/* Logo Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h5" className={styles['navbar-logo']}>
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
                className={`${styles['navbar-link']} ${isActive ? styles.active : ''}`}
                disableRipple
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
              label="⚠️ Switch"
              clickable
              color="error"
              onClick={switchToGanache}
              className={styles['navbar-wallet']}
            />
          )}

          <Chip
            icon={<AccountBalanceWalletIcon />}
            label={active ? `${account?.slice(0, 6)}...${account?.slice(-4)}` : 'Connect Wallet'}
            clickable
            color={active ? 'secondary' : 'default'}
            onClick={active ? deactivate : activate}
            className={`${styles['navbar-wallet']} ${active ? styles.activeWallet : styles.inactive}`}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
