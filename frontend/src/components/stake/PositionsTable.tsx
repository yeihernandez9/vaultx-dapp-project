import { useState } from 'react';
import { Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip } from '@mui/material';
import { useStaking } from '../../hooks/useStaking';

export default function PositionsTable() {
  const { positions, claimRewards, unstake } = useStaking();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const activePositions = positions.filter(p => p.isOpen);

  const handleClaim = async (id: string) => {
    try {
      setLoadingAction(`claim-${id}`);
      await claimRewards(id);
    } catch (e: any) {
      alert(e.reason || e.message || "Failed to claim rewards");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUnstake = async (id: string, isEarly: boolean) => {
    try {
      if (isEarly) {
        if (!window.confirm("WARNING: Unstaking early incurs a 10% penalty going to the treasury. Proceed?")) return;
      }
      setLoadingAction(`unstake-${id}`);
      await unstake(id);
    } catch (e: any) {
      alert(e.reason || e.message || "Failed to unstake");
    } finally {
      setLoadingAction(null);
    }
  };

  if (activePositions.length === 0) {
    return (
      <Card elevation={5} sx={{ bgcolor: 'rgba(255,255,255,0.02)', textAlign: 'center', p: 4, borderRadius: 4 }}>
        <Typography color="text.secondary">No active staking positions found.</Typography>
      </Card>
    );
  }

  return (
    <Card elevation={10} sx={{ overflow: 'hidden' }}>
      <Typography variant="h6" color="secondary" sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        Your Active Positions
      </Typography>
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}>
            <TableRow>
              <TableCell>Amount (VLTX)</TableCell>
              <TableCell>Multiplier</TableCell>
              <TableCell>Time Remaining</TableCell>
              <TableCell>Pending Reward</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activePositions.map((pos) => {
              const endsAtDate = new Date(parseInt(pos.endTimestamp) * 1000);
              const now = new Date();
              const isEarly = endsAtDate > now;
              const daysRemaining = Math.max(0, Math.ceil((endsAtDate.getTime() - now.getTime()) / (1000 * 3600 * 24)));
              const multiplierText = (parseInt(pos.multiplier) / 100).toFixed(1) + 'x';
              
              return (
                <TableRow key={pos.positionId} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    <Typography fontWeight={600}>{parseFloat(pos.amount).toFixed(2)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={multiplierText} size="small" color="secondary" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    {isEarly ? (
                      <Typography variant="body2" color="warning.main">{daysRemaining} days left (Early exit)</Typography>
                    ) : (
                      <Typography variant="body2" color="success.main">Unlocked</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600} color="primary.light">
                      +{parseFloat(pos.pendingReward).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color="primary"
                        disabled={parseFloat(pos.pendingReward) <= 0 || loadingAction !== null}
                        onClick={() => handleClaim(pos.positionId)}
                      >
                        {loadingAction === `claim-${pos.positionId}` ? '...' : 'Claim'}
                      </Button>
                      <Button 
                        size="small" 
                        variant="contained" 
                        color={isEarly ? "error" : "success"}
                        disabled={loadingAction !== null}
                        onClick={() => handleUnstake(pos.positionId, isEarly)}
                      >
                        {loadingAction === `unstake-${pos.positionId}` ? '...' : 'Unstake'}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
