// =============================================================================
// FORGOT PASSWORD DIALOG
// =============================================================================
// A two-step modal dialog launched from the Login page.
//
//   Step 1 — Email entry:
//     User types their email → we call resetPassword() → Cognito sends a
//     verification code to that email address.
//
//   Step 2 — Code + new password:
//     User enters the code from their email + their new password →
//     we call confirmResetPassword() → on success, auto-close after 1.5s.
//     A "Resend code" link lets the user trigger another email without
//     closing and reopening the dialog.
//
// State resets to Step 1 whenever the dialog is closed, so reopening always
// starts fresh.
// =============================================================================

import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Typography,
} from '@mui/material';
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth';

interface Props {
  open: boolean;
  handleClose: () => void;
}

export default function ForgotPassword({ open, handleClose }: Props) {
  const [email, setEmail] = React.useState('');
  const [codeSent, setCodeSent] = React.useState(false); // true after Step 1 → switches to Step 2 UI
  const [code, setCode] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false); // disables buttons while a request is in flight
  const [resendSuccess, setResendSuccess] = React.useState(false); // shows "Code resent!" confirmation

  // Reset all state back to Step 1 whenever the dialog closes
  React.useEffect(() => {
    if (!open) {
      setEmail('');
      setCodeSent(false);
      setCode('');
      setNewPassword('');
      setError(null);
      setSuccess(false);
      setLoading(false);
      setResendSuccess(false);
    }
  }, [open]);

  // Step 1: send the reset code to the user's email via Cognito
  const handleSend = async () => {
    setError(null);
    setLoading(true);
    try {
      await resetPassword({ username: email });
      setCodeSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  // Resend: same Cognito call as Step 1 but we stay on Step 2 — clears the
  // old code field so the user types the new one
  const handleResend = async () => {
    setError(null);
    setResendSuccess(false);
    setLoading(true);
    try {
      await resetPassword({ username: email });
      setCode('');
      setResendSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify the code and set the new password
  // On success, show a confirmation message then auto-close after 1.5s
  const handleConfirm = async () => {
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      await confirmResetPassword({ username: email, confirmationCode: code, newPassword });
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Reset password</DialogTitle>
      <DialogContent>
        {!codeSent ? (
          // ── Step 1: email entry ──────────────────────────────────────────
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
          // ── Step 2: code + new password ──────────────────────────────────
          <>
            <TextField
              autoFocus
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

            {/* Resend link — sends a fresh code without leaving this step */}
            <Typography variant="body2" sx={{ mt: 1.5 }}>
              Didn't get the email?{' '}
              <Button
                variant="text"
                size="small"
                disabled={loading}
                onClick={handleResend}
                sx={{ p: 0, minWidth: 0, verticalAlign: 'baseline', textTransform: 'none' }}
              >
                Resend code
              </Button>
            </Typography>

            {resendSuccess && <Alert severity="info" sx={{ mt: 1 }}>A new code was sent to {email}.</Alert>}
            {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mt: 1 }}>Password reset successfully!</Alert>}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        {!codeSent ? (
          <Button onClick={handleSend} disabled={loading}>
            {loading ? 'Sending...' : 'Send Code'}
          </Button>
        ) : (
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? 'Confirming...' : 'Confirm'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
