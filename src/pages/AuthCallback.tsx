// src/pages/AuthCallback.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const err = params.get("error");

    if (err) {
      setError(err);
      return;
    }

    if (code) {
      // TODO: exchange `code` for tokens with your backend or use Amplify's OAuth helpers.
      // For now, we simply redirect to the dashboard. Replace this with your token handling flow.
      navigate("/dashboard", { replace: true });
    } else {
      setError("No authorization code found in the callback URL.");
    }
  }, [navigate]);

  if (error) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Authentication error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Processing sign-in...</h2>
      <p>If you are not redirected automatically, please wait or return to the <a href="/login">login</a> page.</p>
    </div>
  );
}
