// src/pages/AuthCallback.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "aws-amplify/auth";

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        // Amplify Hosted UI should have already processed the redirect by the time
        // this component runs. This call confirms the user is now signed in.
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