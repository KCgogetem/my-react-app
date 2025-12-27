import React, { useState } from 'react';
import { fetchAuthSession, confirmSignIn } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleToggleNewPassword = () => setShowNewPassword((prev) => !prev);
  const handleToggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await confirmSignIn({ challengeResponse: newPassword });
      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 3, boxShadow: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
      <Typography variant="h6" gutterBottom>Change Password</Typography>
      <form onSubmit={handleSubmit}>
        {/* Current password removed for admin reset flow */}
        <Box sx={{ position: 'relative', mb: 2 }}>
          <TextField
            label="New Password"
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <Button
            onClick={handleToggleNewPassword}
            sx={{ position: 'absolute', right: 8, top: 8, minWidth: 0, padding: '4px 8px', zIndex: 1 }}
            tabIndex={-1}
            aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
          >
            {showNewPassword ? 'Hide' : 'Show'}
          </Button>
        </Box>
        <Box sx={{ position: 'relative', mb: 2 }}>
          <TextField
            label="Confirm New Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <Button
            onClick={handleToggleConfirmPassword}
            sx={{ position: 'absolute', right: 8, top: 8, minWidth: 0, padding: '4px 8px', zIndex: 1 }}
            tabIndex={-1}
            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
          >
            {showConfirmPassword ? 'Hide' : 'Show'}
          </Button>
        </Box>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>Password updated successfully!</Alert>}
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>
          {loading ? 'Updating...' : 'Update Password'}
        </Button>
      </form>
    </Box>
  );
}
