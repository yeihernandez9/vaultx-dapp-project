import { Container, Box, Typography } from '@mui/material';
import TierSelector from '../../components/stake/TierSelector';
import PositionsTable from '../../components/stake/PositionsTable';
import styles from './Stake.module.scss';

export default function StakeContainer() {
  return (
    <Container maxWidth="lg" className={styles.stake}>
      {/* Header title only */}
      <Box className={styles['stake-header']}>
        <Typography variant="h3">
          VaultX Staking Rewards
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Lock your VLTX tokens to earn per-block rewards. Early exit incurs a 10% penalty going directly to the community treasury.
        </Typography>
      </Box>

      {/* Main layout using CSS Grid */}
      <Box className={styles['stake-layout']}>
        {/* Left Side: Staking selector */}
        <Box>
          <TierSelector />
        </Box>

        {/* Right Side: Active positions */}
        <Box>
          <PositionsTable />
        </Box>
      </Box>
    </Container>
  );
}
