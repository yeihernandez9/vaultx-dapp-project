import { useState } from 'react';
import { Card, CardContent, Typography, Box, Button, CircularProgress, Divider } from '@mui/material';
import { usePresale } from '../../hooks/usePresale';
import styles from './VestingPanel.module.scss';

export default function VestingPanel() {
  const { userAllocation, userClaimed, userVested, claimTokens, loading } = usePresale();
  const [claiming, setClaiming] = useState(false);

  const lockedAmount = parseFloat(userAllocation) - parseFloat(userClaimed);
  const claimable = parseFloat(userVested) - parseFloat(userClaimed);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      await claimTokens();
      alert("Tokens Claimed Successfully!");
    } catch (e: any) {
      alert(e.reason || e.message || "Failed to claim");
    } finally {
      setClaiming(false);
    }
  };

  if (loading) return <CircularProgress color="secondary" />;

  return (
    <Card elevation={10} className={styles['vesting-card']}>
      <CardContent className={styles['vesting-content']}>
        <Typography variant="h5" color="primary.light" gutterBottom>
          Your Vesting Schedule
        </Typography>

        <div className={styles['vesting-grid']}>
          <Box>
            <Typography variant="body2" color="text.secondary">Total Allocated</Typography>
            <Typography variant="h6" color="text.primary">{parseFloat(userAllocation).toFixed(2)} VLTX</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Total Claimed</Typography>
            <Typography variant="h6" color="success.main">{parseFloat(userClaimed).toFixed(2)} VLTX</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Currently Locked</Typography>
            <Typography variant="h6" color="error.light">{lockedAmount > 0 ? lockedAmount.toFixed(2) : '0.00'} VLTX</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Available to Claim</Typography>
            <Typography variant="h6" color="secondary.main">{claimable > 0 ? claimable.toFixed(2) : '0.00'} VLTX</Typography>
          </Box>
        </div>

        <Divider className={styles['vesting-divider']} />

        <Button 
          variant="outlined" 
          color="secondary" 
          fullWidth
          disabled={claiming || claimable <= 0}
          onClick={handleClaim}
          className={styles['vesting-button']}
        >
          {claiming ? 'Processing...' : 'Claim Unlocked Tokens'}
        </Button>
      </CardContent>
    </Card>
  );
}
