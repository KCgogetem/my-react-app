// src/pages/Login.tsx
import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CssBaseline from "@mui/material/CssBaseline";
import FormControlLabel from "@mui/material/FormControlLabel";
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
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");

  const [open, setOpen] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const [loginError, setLoginError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // NEW PASSWORD REQUIRED flow
  const [needsNewPassword, setNeedsNewPassword] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmingNewPassword, setConfirmingNewPassword] = React.useState(false);

  const navigate = useNavigate();

  const handleTogglePassword = () => setShowPassword((prev) => !prev);
  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const validateInputs = () => {
    const email = document.getElementById("email") as HTMLInputElement;
    const password = document.getElementById("password") as HTMLInputElement;

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must be at least 6 characters long.");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);

    if (!validateInputs()) return;

    const data = new FormData(event.currentTarget);
    const email = String(data.get("email"));
    const password = String(data.get("password"));

    setLoading(true);
    try {
      // Ensure we start clean (optional but helps during testing)
      // await signOut();

      const res = await signIn({ username: email, password });

      if (res.nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
        setNeedsNewPassword(true);
        setLoginError("First login requires setting a new password.");
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setLoginError(err?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmNewPassword = async () => {
    setLoginError(null);
    if (!newPassword || newPassword.length < 8) {
      setLoginError("New password must be at least 8 characters.");
      return;
    }

    setConfirmingNewPassword(true);
    try {
      await confirmSignIn({ challengeResponse: newPassword });
      // After confirmSignIn, user is signed in
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setLoginError(err?.message || "Failed to set new password.");
      // If something gets weird, you can reset the flow:
      // await signOut();
      // setNeedsNewPassword(false);
    } finally {
      setConfirmingNewPassword(false);
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="space-between">
        <ColorModeSelect sx={{ position: "fixed", top: "1rem", right: "1rem" }} />

        <Card variant="outlined">
          <SitemarkIcon />

          <Typography component="h1" variant="h4" sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}>
            Sign in
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 2 }}
          >
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
                disabled={needsNewPassword} // lock during new password step
              />
            </FormControl>

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
                  disabled={needsNewPassword} // lock during new password step
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

            {!needsNewPassword && (
              <>
                <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Remember me" />

                <Button variant="text" onClick={handleClickOpen} sx={{ alignSelf: "flex-end", mb: 1 }}>
                  Forgot Password?
                </Button>

                <ForgotPassword open={open} handleClose={handleClose} />

                <Button type="submit" fullWidth variant="contained" disabled={loading} onClick={validateInputs}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </>
            )}

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