// =============================================================================
// SIGN UP PAGE
// =============================================================================
// Self-service account creation. Two steps handled on the same page:
//
//   Step 1 — SIGN_UP:
//     User enters email + password → signUp() → Cognito sends a verification
//     code to their email → we switch to the confirmation form.
//
//   Step 2 — CONFIRM:
//     User enters the 6-digit code from their email → confirmSignUp() →
//     redirect to /login so they can sign in with their new account.
//
// Note: auto sign-in after confirmation is not enabled. Users must log in
// separately after confirming.
// =============================================================================

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
  backgroundColor: "#181818",
  color: "#fff",
  boxShadow: "0 5px 15px 0 rgba(0,0,0,0.5), 0 15px 35px -5px rgba(0,0,0,0.8)",
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  minHeight: "100vh",
  padding: theme.spacing(2),
  backgroundColor: "#111",
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    background: '#111',
  },
}));

export default function SignUpPage() {
  const navigate = useNavigate();

  // step controls which form is shown: email+password entry or code confirmation
  const [step, setStep] = useState<"SIGN_UP" | "CONFIRM">("SIGN_UP");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");   // verification code from Cognito email
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false); // disables submit button during async calls

  // Step 1: create the Cognito account and wait for email verification
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

      if (res.nextStep.signUpStep === "CONFIRM_SIGN_UP") {
        setStep("CONFIRM"); // show the code entry form
      } else {
        // Cognito pool is configured for auto-confirm → skip straight to login
        navigate("/login", { replace: true });
      }
    } catch (err: any) {
      setError(err?.message ?? "Sign up failed.");
    } finally {
      setBusy(false);
    }
  };

  // Step 2: verify the code Cognito emailed, then send the user to login
  const onConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await confirmSignUp({
        username: email,
        confirmationCode: code,
      });

      // Pass email in router state so Login can pre-fill the email field
      navigate("/login", { replace: true, state: { email } });
    } catch (err: any) {
      setError(err?.message ?? "Confirmation failed.");
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
