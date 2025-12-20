import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
} from '@mui/material';
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth';

interface Props {
  open: boolean;
  handleClose: () => void;
}

export default function ForgotPassword({ open, handleClose }: Props) {
  const [email, setEmail] = React.useState('');
  const [codeSent, setCodeSent] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSend = async () => {
    setError(null);
    setSuccess(false);
    try {
      await resetPassword({ username: email });
      setCodeSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code.');
    }
  };

  const handleConfirm = async () => {
    setError(null);
    setSuccess(false);
    try {
      await confirmResetPassword({ username: email, confirmationCode: code, newPassword });
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Reset password</DialogTitle>
      <DialogContent>
        {!codeSent ? (
          <>
            <TextField
              autoFocus
              margin="dense"
              id="forgot-email"
              label="Email Address"
              type="email"
              fullWidth
              variant="standard"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </>
        ) : (
          <>
            <TextField
              margin="dense"
              id="reset-code"
              label="Confirmation Code"
              type="text"
              fullWidth
              variant="standard"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <TextField
              margin="dense"
              id="new-password"
              label="New Password"
              type="password"
              fullWidth
              variant="standard"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mt: 2 }}>Password reset successfully!</Alert>}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        {!codeSent ? (
          <Button onClick={handleSend}>Send Code</Button>
        ) : (
          <Button onClick={handleConfirm}>Confirm</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
