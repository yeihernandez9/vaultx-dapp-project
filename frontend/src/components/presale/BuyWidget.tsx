import { useState } from 'react';
import { Card, CardContent, Typography, Box, TextField, Button, LinearProgress, ToggleButtonGroup, ToggleButton, Alert } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { usePresale } from '../../hooks/usePresale';
import { useWeb3React } from '../../hooks/useWeb3React';

// Changed to 1000 tokens for testing visualization.
// Change back to desired tokenomics cap before production.
const HARDCAP = 1000;

export default function BuyWidget() {
  const { currentRound, tokenPrice, totalRaised, buyTokens, loading } = usePresale();
  const { active, activate, account } = useWeb3React();

  const [amount, setAmount] = useState('0.1');
  const [currency, setCurrency] = useState('ETH');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pending, setPending] = useState(false);

  const parsedAmount = parseFloat(amount) || 0;
  const parsedPrice = parseFloat(tokenPrice) || 0;
  const estimatedTokens = parsedPrice > 0 ? (parsedAmount / parsedPrice).toFixed(2) : '0';

  const raisedPercent = Math.min((parseFloat(totalRaised) / HARDCAP) * 100, 100);

  const getRoundBadge = () => {
    switch (currentRound) {
      case 1: return <Alert severity="info" sx={{ mb: 2 }}>🔥 Pre-Seed Round is ACTIVE 🔥</Alert>;
      case 2: return <Alert severity="warning" sx={{ mb: 2 }}>⚡ Seed Round is ACTIVE ⚡</Alert>;
      case 3: return <Alert severity="success" sx={{ mb: 2 }}>🚀 Public Round is ACTIVE 🚀</Alert>;
      default: return <Alert severity="error" sx={{ mb: 2 }}>⏸ Presale is PAUSED ⏸</Alert>;
    }
  };

  const handleBuy = async () => {
    setError('');
    setSuccess('');
    setPending(true);
    try {
      if (currentRound === 0) throw new Error('Sale is not active');
      if (parsedAmount <= 0) throw new Error('Amount must be greater than 0');
      await buyTokens(amount);
      setSuccess(`✅ Successfully purchased ~${estimatedTokens} VLTX tokens!`);
      setAmount('0.1');
    } catch (e: any) {
      setError(e.reason || e.message || 'Transaction Failed');
    } finally {
      setPending(false);
    }
  };

  return (
    <Card elevation={10}>
      <CardContent sx={{ p: 4 }}>
        {getRoundBadge()}

        {/* Hardcap Progress */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Hardcap Progress ({raisedPercent.toFixed(2)}%)
        </Typography>
        <LinearProgress
          variant="determinate"
          value={raisedPercent}
          sx={{ height: 12, borderRadius: 6, mb: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}
          color="secondary"
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mb: 4 }}>
          {totalRaised} / {HARDCAP.toLocaleString()} VLTX
        </Typography>

        {/* Currency toggle */}
        <ToggleButtonGroup
          color="secondary"
          value={currency}
          exclusive
          onChange={(_, val) => val && setCurrency(val)}
          fullWidth
          sx={{ mb: 3 }}
        >
          <ToggleButton value="ETH">Ethereum (ETH)</ToggleButton>
          <ToggleButton value="BNB">Binance (BNB)</ToggleButton>
        </ToggleButtonGroup>

        {/* Amount input */}
        <TextField
          label={`Pay with ${currency}`}
          type="number"
          fullWidth
          variant="outlined"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          sx={{ mb: 2 }}
          slotProps={{ htmlInput: { step: '0.01', min: '0' } }}
        />

        {/* Estimation box */}
        <Box sx={{ p: 2, mb: 3, bgcolor: 'background.default', borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="body2" color="text.secondary">You will receive approx:</Typography>
          <Typography variant="h4" color="secondary.main">{estimatedTokens} VLTX</Typography>
          <Typography variant="caption" color="text.secondary">
            1 VLTX = {parsedPrice > 0 ? tokenPrice : '—'} {currency}
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {/* Wallet status info */}
        {active && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, textAlign: 'center' }}>
            Connected: {account?.slice(0, 8)}...{account?.slice(-6)}
          </Typography>
        )}

        {/* Main Action Button */}
        {!active ? (
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={activate}
            startIcon={<AccountBalanceWalletIcon />}
            sx={{
              py: 1.5, fontSize: '1.1rem',
              background: 'linear-gradient(45deg, #7b1fa2 30%, #00b0d7 90%)',
            }}
          >
            Connect Wallet to Buy
          </Button>
        ) : (
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleBuy}
            disabled={loading || pending || currentRound === 0}
            sx={{
              py: 1.5, fontSize: '1.1rem',
              background: currentRound === 0 ? undefined : 'linear-gradient(45deg, #7b1fa2 30%, #00b0d7 90%)',
            }}
          >
            {pending ? 'Processing TX...' : 'Buy VaultX Tokens'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
