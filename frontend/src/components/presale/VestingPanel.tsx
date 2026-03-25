import { useState } from 'react';
import { Card, CardContent, Typography, Box, Button, CircularProgress, Divider } from '@mui/material';
import { usePresale } from '../../hooks/usePresale';

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
    <Card elevation={10} sx={{ mt: 4, bgcolor: 'rgba(123, 31, 162, 0.05)', border: '1px solid rgba(123, 31, 162, 0.2)' }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" color="primary.light" gutterBottom>
          Your Vesting Schedule
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, my: 3 }}>
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
        </Box>

        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.05)' }} />

        <Button 
          variant="outlined" 
          color="secondary" 
          fullWidth
          disabled={claiming || claimable <= 0}
          onClick={handleClaim}
          sx={{ py: 1 }}
        >
          {claiming ? 'Processing...' : 'Claim Unlocked Tokens'}
        </Button>
      </CardContent>
    </Card>
  );
}
