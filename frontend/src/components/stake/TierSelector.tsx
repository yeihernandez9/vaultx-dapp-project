import { useState } from 'react';
import { Card, CardContent, Typography, Box, Button, TextField, ToggleButtonGroup, ToggleButton, Alert } from '@mui/material';
import LockClockIcon from '@mui/icons-material/LockClock';
import { useStaking } from '../../hooks/useStaking';
import { useWeb3React } from '../../hooks/useWeb3React';

export default function TierSelector() {
  const { vltxBalance, stake } = useStaking();
  const { active, activate } = useWeb3React();

  const [tier, setTier] = useState<number>(30);
  const [amount, setAmount] = useState<string>('1.0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const parsedAmount = parseFloat(amount) || 0;
  
  const handleStake = async () => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      if (parsedAmount <= 0) throw new Error("Amount must be greater than 0");
      if (parsedAmount > parseFloat(vltxBalance)) throw new Error("Insufficient VLTX balance");
      
      await stake(amount, tier);
      setSuccess(`✅ Successfully staked ${amount} VLTX for ${tier} days!`);
      setAmount('1.0');
    } catch (e: any) {
      setError(e.reason || e.message || "Staking Failed");
    } finally {
      setLoading(false);
    }
  };

  const getMultiplier = () => {
    if (tier === 30) return "1x";
    if (tier === 90) return "1.5x";
    return "2x";
  };

  return (
    <Card elevation={10}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" color="secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockClockIcon /> Lock Tokens
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Select a lock tier and stake your VaultX tokens to earn per-block rewards.
        </Typography>

        <Typography variant="subtitle2" sx={{ mb: 1, mt: 3 }}>Select Lock Duration</Typography>
        <ToggleButtonGroup
          color="secondary"
          value={tier}
          exclusive
          onChange={(_, val) => val && setTier(val)}
          fullWidth
          sx={{ mb: 3 }}
        >
          <ToggleButton value={30}>30 Days (1x)</ToggleButton>
          <ToggleButton value={90}>90 Days (1.5x)</ToggleButton>
          <ToggleButton value={180}>180 Days (2x)</ToggleButton>
        </ToggleButtonGroup>

        <Box sx={{ mb: 3 }}>
          <TextField
            label="Amount to Stake (VLTX)"
            type="number"
            fullWidth
            variant="outlined"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            slotProps={{ htmlInput: { step: '0.1', min: '0' } }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
            Balance: {vltxBalance} VLTX
          </Typography>
        </Box>

        <Box sx={{ p: 2, mb: 3, bgcolor: 'background.default', borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="body2" color="text.secondary">Estimated Current APY Multiplier:</Typography>
          <Typography variant="h4" color="secondary.main">{getMultiplier()} Rewards</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        {!active ? (
          <Button 
            variant="contained" 
            size="large" 
            fullWidth 
            onClick={activate}
            sx={{ py: 1.5, background: 'linear-gradient(45deg, #7b1fa2, #00b0d7)' }}
          >
            Connect Wallet
          </Button>
        ) : (
          <Button 
            variant="contained" 
            size="large" 
            fullWidth 
            onClick={handleStake}
            disabled={loading || parsedAmount <= 0}
            sx={{ py: 1.5, background: 'linear-gradient(45deg, #7b1fa2, #00b0d7)' }}
          >
            {loading ? 'Approving & Staking...' : 'Stake VLTX'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
