import { Container, Box, Typography } from '@mui/material';
import TierSelector from '../../components/stake/TierSelector';
import PositionsTable from '../../components/stake/PositionsTable';

export default function StakeContainer() {
  return (
    <Container maxWidth="lg" sx={{ pt: 10, pb: 10 }}>
      {/* Header title only */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" gutterBottom>
          VaultX Staking Rewards
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Lock your VLTX tokens to earn per-block rewards. Early exit incurs a 10% penalty going directly to the community treasury.
        </Typography>
      </Box>

      {/* Main layout using CSS Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' },
          gap: 6,
        }}
      >
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
