import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';

interface Props {
  open: boolean;
  handleClose: () => void;
}

export default function ForgotPassword({ open, handleClose }: Props) {
  const [email, setEmail] = React.useState('');

  const handleSend = () => {
    console.log('forgot password email:', email);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Reset password</DialogTitle>
      <DialogContent>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSend}>Send</Button>
      </DialogActions>
    </Dialog>
  );
}
