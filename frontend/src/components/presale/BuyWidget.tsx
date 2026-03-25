import { useState } from 'react';
import { Card, CardContent, Typography, Box, TextField, Button, LinearProgress, ToggleButtonGroup, ToggleButton, Alert } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { usePresale } from '../../hooks/usePresale';
import { useWeb3React } from '../../hooks/useWeb3React';
import styles from './BuyWidget.module.scss';

// Hardcap read from .env (defaults to 10M if not set)
const HARDCAP = Number(import.meta.env.VITE_HARDCAP) || 10000000;

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
      case 1: return <Alert severity="info" className={styles['buy-widget-alert']}>🔥 Pre-Seed Round is ACTIVE 🔥</Alert>;
      case 2: return <Alert severity="warning" className={styles['buy-widget-alert']}>⚡ Seed Round is ACTIVE ⚡</Alert>;
      case 3: return <Alert severity="success" className={styles['buy-widget-alert']}>🚀 Public Round is ACTIVE 🚀</Alert>;
      default: return <Alert severity="error" className={styles['buy-widget-alert']}>⏸ Presale is PAUSED ⏸</Alert>;
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
      <CardContent className={styles['buy-widget-content']}>
        {getRoundBadge()}

        {/* Hardcap Progress */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Hardcap Progress ({raisedPercent.toFixed(2)}%)
        </Typography>
        <LinearProgress
          variant="determinate"
          value={raisedPercent}
          className={styles['buy-widget-progress']}
          color="secondary"
        />
        <Typography variant="caption" color="text.secondary" className={styles['buy-widget-text']}>
          {totalRaised} / {HARDCAP.toLocaleString()} VLTX
        </Typography>

        {/* Currency toggle */}
        <ToggleButtonGroup
          color="secondary"
          value={currency}
          exclusive
          onChange={(_, val) => val && setCurrency(val)}
          fullWidth
          className={styles['buy-widget-toggle']}
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
          className={styles['buy-widget-input']}
          slotProps={{ htmlInput: { step: '0.01', min: '0' } }}
        />

        {/* Estimation box */}
        <Box className={styles['buy-widget-estimation']}>
          <Typography variant="body2" color="text.secondary">You will receive approx:</Typography>
          <Typography variant="h4" color="secondary.main">{estimatedTokens} VLTX</Typography>
          <Typography variant="caption" color="text.secondary">
            1 VLTX = {parsedPrice > 0 ? tokenPrice : '—'} {currency}
          </Typography>
        </Box>

        {error && <Alert severity="error" className={styles['buy-widget-alert']}>{error}</Alert>}
        {success && <Alert severity="success" className={styles['buy-widget-alert']}>{success}</Alert>}

        {/* Wallet status info */}
        {active && (
          <Typography variant="caption" color="text.secondary" className={styles['buy-widget-wallet']}>
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
            className={`${styles['buy-widget-button']} ${styles['buy-widget-button--gradient']}`}
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
            className={`${styles['buy-widget-button']} ${currentRound !== 0 ? styles['buy-widget-button--gradient'] : ''}`}
          >
            {pending ? 'Processing TX...' : 'Buy VaultX Tokens'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
