import { Container, Box, Typography } from '@mui/material';
import BuyWidget from '../../components/presale/BuyWidget';
import VestingPanel from '../../components/presale/VestingPanel';
import { useWeb3React } from '../../hooks/useWeb3React';
import styles from './Presale.module.scss';

export default function PresaleContainer() {
  const { active } = useWeb3React();

  return (
    <Container maxWidth="lg" className={styles.presale}>
      {/* Header title only */}
      <Box className={styles['presale-header']}>
        <Typography variant="h3">
          VaultX Presale Phase
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Secure your allocation early with dynamic vesting schedules.
        </Typography>
      </Box>      

      {/* Main layout using CSS Grid */}
      <Box className={styles['presale-layout']}>
        {/* Left Side */}
        <Box>
          <Box className={styles['presale-info']}>
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
            <Box className={styles['presale-prompt']}>
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
