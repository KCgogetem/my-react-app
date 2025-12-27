// src/components/ProtectedRoute.tsx
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { fetchAuthSession } from "aws-amplify/auth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const session = await fetchAuthSession();
        const authed = !!session.tokens?.accessToken;
        if (alive) setAuthenticated(authed);
      } catch {
        if (alive) setAuthenticated(false);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [location.pathname]);

  if (loading) return <div>Loading...</div>;
  if (!authenticated) return <Navigate to="/login" replace state={{ from: location }} />;

  return <>{children}</>;
}