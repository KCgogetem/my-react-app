
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUp, confirmSignUp } from "aws-amplify/auth";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import AppTheme from "../shared-theme/AppTheme";
import Link from "@mui/material/Link";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "450px",
  },
  // Match the light-mode login card styling
  backgroundColor: "#ffffff",
  color: "#000000",
  boxShadow: theme.shadows[6],
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  minHeight: "100vh",
  padding: theme.spacing(2),
  // Light background to align with light-mode login
  backgroundColor: "#f5f5f5",
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    background: "#f5f5f5",
  },
}));

export default function SignUpPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<"SIGN_UP" | "CONFIRM">("SIGN_UP");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await signUp({
        username: email,
        password,
        options: {
          userAttributes: { email },
        },
      });

      // Amplify v6 returns nextStep telling you what to do next
      if (res.nextStep.signUpStep === "CONFIRM_SIGN_UP") {
        setStep("CONFIRM");
      } else {
        // some configs can auto-confirm/auto-sign-in; send them to login
        navigate("/login", { replace: true });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign up failed.";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const onConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await confirmSignUp({
        username: email,
        confirmationCode: code,
      });

      // after confirmation, send them to login (or auto sign-in if you enable it later)
      navigate("/login", { replace: true, state: { email } });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Confirmation failed.";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

    return (
      <AppTheme>
        <CssBaseline enableColorScheme />
        <SignUpContainer direction="column" justifyContent="center" alignItems="center">
          <Card variant="outlined">
            <Typography component="h1" variant="h4" sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}>
              {step === "SIGN_UP" ? "Create account" : "Confirm your email"}
            </Typography>
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
            {step === "SIGN_UP" ? (
              <Box component="form" onSubmit={onSignUp} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormControl>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <TextField
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    fullWidth
                    autoFocus
                    variant="outlined"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <TextField
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    fullWidth
                    variant="outlined"
                  />
                </FormControl>
                <Button type="submit" variant="contained" fullWidth disabled={busy} sx={{ mt: 2 }}>
                  {busy ? "Creating..." : "Sign up"}
                </Button>
                <Typography sx={{ textAlign: "center", mt: 2 }}>
                  Already have an account?{' '}
                  <Link href="/login" variant="body2" sx={{ alignSelf: "center" }}>
                    Sign in
                  </Link>
                </Typography>
              </Box>
            ) : (
              <Box component="form" onSubmit={onConfirm} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography sx={{ mb: 1 }}>
                  Enter the verification code sent to <b>{email}</b>
                </Typography>
                <FormControl>
                  <FormLabel htmlFor="code">Verification code</FormLabel>
                  <TextField
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    fullWidth
                    variant="outlined"
                  />
                </FormControl>
                <Button type="submit" variant="contained" fullWidth disabled={busy} sx={{ mt: 2 }}>
                  {busy ? "Confirming..." : "Confirm"}
                </Button>
              </Box>
            )}
          </Card>
        </SignUpContainer>
      </AppTheme>
    );
}
