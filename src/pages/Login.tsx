// src/pages/Login.tsx
import { signInWithRedirect } from "aws-amplify/auth";
import {
  Avatar,
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Stack,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

export default function Login() {
  const handleSignIn = () => {
    signInWithRedirect(); // opens Cognito Hosted UI
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 4,
          }}
        >
          <Stack spacing={3} alignItems="center">
            <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
              <LockOutlinedIcon />
            </Avatar>

            <Box textAlign="center">
              <Typography variant="h5" fontWeight={600}>
                AI CMA Portal
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Sign in to generate, manage, and share your CMAs in seconds.
              </Typography>
            </Box>

            <Button
              fullWidth
              size="large"
              variant="contained"
              onClick={handleSignIn}
              sx={{ mt: 1, textTransform: "none", fontWeight: 600 }}
            >
              Sign in with Cognito
            </Button>

            <Typography variant="caption" color="text.secondary" textAlign="center">
              You&apos;ll be redirected to a secure login page powered by Amazon Cognito.
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}