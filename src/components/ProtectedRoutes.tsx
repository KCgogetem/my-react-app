// src/components/ProtectedRoute.tsx
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        await getCurrentUser();
        if (alive) setAuthenticated(true);
      } catch {
        if (alive) setAuthenticated(false);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}