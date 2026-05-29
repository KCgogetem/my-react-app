// =============================================================================
// AUTH CALLBACK PAGE  —  route: /auth/callback
// =============================================================================
// This page is the OAuth redirect target registered in Cognito and amplify-auth.ts.
// It is only reached after a Cognito Hosted UI login (Google, SSO, etc.).
//
// Flow:
//   1. User clicks a social/SSO login button → Cognito redirects them here
//      with a ?code= query param in the URL.
//   2. Amplify automatically exchanges the code for tokens when the app loads
//      (this happens inside the Amplify library, not in our code).
//   3. We call getCurrentUser() to confirm the session is active.
//   4. On success → redirect to /dashboard.
//      On failure → show an error message with a link back to /login.
//
// Note: the error and loading states use plain HTML/inline styles, not MUI.
// That's a known inconsistency to clean up.
// =============================================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "aws-amplify/auth";

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // alive flag prevents state updates if the component unmounts mid-flight
    let alive = true;

    (async () => {
      try {
        // By the time React renders this component, Amplify has already parsed the
        // ?code= param and exchanged it for tokens. getCurrentUser() just confirms
        // that a valid session now exists.
        await getCurrentUser();
        if (!alive) return;

        navigate("/dashboard", { replace: true });
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Failed to complete sign-in.");
      }
    })();

    return () => {
      alive = false;
    };
  }, [navigate]);

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Authentication error</h2>
        <p>{error}</p>
        <p>
          Go back to <a href="/login">login</a>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Processing sign-in...</h2>
      <p>Finishing authentication, one moment.</p>
    </div>
  );
}