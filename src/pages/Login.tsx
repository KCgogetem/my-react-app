// =============================================================================
// LOGIN PAGE
// =============================================================================
// This is the main sign-in screen. It handles two flows:
//
//   Flow 1 — Normal login:
//     User enters email + password → Amplify signIn() → redirect to /dashboard
//
//   Flow 2 — Admin-created account (first login):
//     Cognito requires the user to set a new password before they can proceed.
//     signIn() returns nextStep = "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"
//     → we show a "Set New Password" form inline
//     → user submits → confirmSignIn() → redirect to /dashboard
//
// Related files:
//   - ForgotPassword.tsx  → the "Forgot Password?" dialog (resetPassword flow)
//   - AuthCallback.tsx    → handles the redirect after OAuth/Hosted UI login
//   - amplify-auth.ts     → Cognito config (userPoolId, clientId, OAuth domain)
// =============================================================================

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import ForgotPassword from "../components/ForgotPassword";
import AppTheme from "../shared-theme/AppTheme";
import ColorModeSelect from "../shared-theme/ColorModeSelect";
import { SitemarkIcon } from "../components/CustomIcons";
import { signIn, confirmSignIn, signOut } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";

// Dark card that holds the sign-in form, max 450px wide on desktop
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

// Full-screen dark background that centers the Card vertically
const SignInContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  backgroundColor: "#111",
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    background: "#111",
  },
}));

export default function Login(props: { disableCustomTheme?: boolean }) {
  // --- Controlled field values ---
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  // --- Field-level validation error state (shown under each input) ---
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");

  // --- UI control state ---
  const [open, setOpen] = React.useState(false);           // ForgotPassword dialog open/closed
  const [showPassword, setShowPassword] = React.useState(false); // toggle password visibility

  // --- Async / submission state ---
  const [loginError, setLoginError] = React.useState<string | null>(null); // API-level error shown below the form
  const [loading, setLoading] = React.useState(false);     // disables the Sign In button while the request is in flight

  // --- NEW_PASSWORD_REQUIRED flow (admin-created accounts) ---
  // When Cognito was used to create a user via the admin console, the first
  // signIn() call comes back with nextStep = "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED".
  // We flip needsNewPassword=true to swap the form into a "set your password" mode.
  const [needsNewPassword, setNeedsNewPassword] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmingNewPassword, setConfirmingNewPassword] = React.useState(false); // loading state for that step

  const navigate = useNavigate();

  const handleTogglePassword = () => setShowPassword((prev) => !prev);
  const handleClickOpen = () => setOpen(true);   // opens ForgotPassword dialog
  const handleClose = () => setOpen(false);      // closes ForgotPassword dialog

  // Validates the email and password state values and sets the inline error
  // messages shown under each TextField. Returns true if both pass.
  const validateInputs = () => {
    let isValid = true;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError(true);
      setEmailErrorMessage("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!password || password.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must be at least 6 characters long.");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return isValid;
  };

  // Called when the sign-in form is submitted (Flow 1).
  // Validates inputs first, then calls Amplify signIn().
  // If Cognito returns a NEW_PASSWORD_REQUIRED challenge (admin-created account),
  // we switch to Flow 2 instead of navigating away.
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);

    if (!validateInputs()) return;

    setLoading(true);
    try {
      const res = await signIn({ username: email, password });

      // Admin-created accounts must set a new password on first login
      if (res.nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
        setNeedsNewPassword(true);
        setLoginError("First login requires setting a new password.");
        return;
      }

      // Normal success → go to the dashboard
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setLoginError(err?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  // Called when the user submits their new password (Flow 2).
  // confirmSignIn() completes the Cognito challenge and signs the user in.
  // After this resolves successfully, the session is active — navigate to dashboard.
  const handleConfirmNewPassword = async () => {
    setLoginError(null);
    if (!newPassword || newPassword.length < 8) {
      setLoginError("New password must be at least 8 characters.");
      return;
    }

    setConfirmingNewPassword(true);
    try {
      await confirmSignIn({ challengeResponse: newPassword });
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setLoginError(err?.message || "Failed to set new password.");
    } finally {
      setConfirmingNewPassword(false);
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="space-between">
        {/* Light/dark mode toggle pinned to top-right corner */}
        <ColorModeSelect sx={{ position: "fixed", top: "1rem", right: "1rem" }} />

        <Card variant="outlined">
          <Typography component="h1" variant="h4" sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}>
            Sign in
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 2 }}
          >
            {/* Email field — disabled once we're in the new-password step */}
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                error={emailError}
                helperText={emailErrorMessage}
                id="email"
                type="email"
                name="email"
                placeholder="your@email.com"
                autoComplete="email"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={emailError ? "error" : "primary"}
                disabled={needsNewPassword}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>

            {/* Password field — the Show/Hide button is absolutely positioned inside the box */}
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <Box sx={{ position: "relative" }}>
                <TextField
                  error={passwordError}
                  helperText={passwordErrorMessage}
                  name="password"
                  placeholder="••••••"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  required
                  fullWidth
                  variant="outlined"
                  color={passwordError ? "error" : "primary"}
                  disabled={needsNewPassword}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  onClick={handleTogglePassword}
                  sx={{ position: "absolute", right: 8, top: 8, minWidth: 0, padding: "4px 8px", zIndex: 1 }}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </Button>
              </Box>
            </FormControl>

            {/* ── FLOW 1: Normal sign-in controls ─────────────────────────────── */}
            {!needsNewPassword && (
              <>
                <Button variant="text" onClick={handleClickOpen} sx={{ alignSelf: "flex-end", mb: 1 }}>
                  Forgot Password?
                </Button>

                {/* ForgotPassword is always mounted; open prop controls visibility */}
                <ForgotPassword open={open} handleClose={handleClose} />

                <Button type="submit" fullWidth variant="contained" disabled={loading} onClick={validateInputs}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </>
            )}

            {/* ── FLOW 2: New password required (admin-created accounts) ────────
                Shown after signIn() returns CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED.
                The email/password fields above are locked. User types their new
                password here, hits the button, and we call confirmSignIn().        */}
            {needsNewPassword && (
              <>
                <Divider sx={{ my: 2 }}>Set New Password</Divider>

                <TextField
                  label="New Password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
                />

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleConfirmNewPassword}
                  disabled={confirmingNewPassword}
                >
                  {confirmingNewPassword ? "Updating..." : "Set Password & Continue"}
                </Button>
              </>
            )}

            {/* API-level error (shown below the form for both flows) */}
            {loginError && (
              <Box sx={{ mt: 1 }}>
                <Typography color="error" variant="body2">
                  {loginError}
                </Typography>
              </Box>
            )}
          </Box>

          <Typography sx={{ textAlign: "center", mt: 2 }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" variant="body2" sx={{ alignSelf: "center" }}>
              Sign up
            </Link>
          </Typography>
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}