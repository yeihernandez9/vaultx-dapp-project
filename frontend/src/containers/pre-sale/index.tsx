import { Container, Box, Typography, Chip } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BuyWidget from '../../components/presale/BuyWidget';
import VestingPanel from '../../components/presale/VestingPanel';
import { useWeb3React } from '../../hooks/useWeb3React';

export default function PresaleContainer() {
  const { active } = useWeb3React();

  return (
    <Container maxWidth="lg" sx={{ pt: 10, pb: 10 }}>
      {/* Header title only */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" gutterBottom>
          VaultX Presale Phase
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Secure your allocation early with dynamic vesting schedules.
        </Typography>
      </Box>      {/* Main layout using CSS Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' },
          gap: 6,
        }}
      >
        {/* Left Side */}
        <Box>
          <Box
            sx={{
              bgcolor: 'rgba(0, 229, 255, 0.05)', p: 4, borderRadius: 4,
              border: '1px solid rgba(0, 229, 255, 0.2)', mb: 4,
            }}
          >
            <Typography variant="h5" color="secondary" gutterBottom>
              Why VaultX?
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              VaultX introduces the most robust mechanics combining algorithmic staking,
              dynamic asset vaults, and frictionless yield onto one single token.
              By participating in this presale, you agree to a linear drop vesting schedule
              mapped perfectly to prevent chart dumping and secure the ecosystem.
            </Typography>
          </Box>

          {active ? (
            <VestingPanel />
          ) : (
            <Box sx={{ p: 4, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                Please connect your wallet to view your vesting schedule.
              </Typography>
            </Box>
          )}
        </Box>

        {/* Right Side */}
        <Box>
          <BuyWidget />
        </Box>
      </Box>
    </Container>
  );
}
