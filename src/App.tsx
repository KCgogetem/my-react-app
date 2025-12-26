import CmaList from "./pages/CmaList";
        <Route
          path="/cma-results"
          element={
            <ProtectedRoute>
              <CmaList />
            </ProtectedRoute>
          }
        />
// src/App.tsx
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AuthCallback from "./pages/AuthCallback";
import ProtectedRoute from "./components/ProtectedRoutes";
import Users from "./pages/Users";
import NewCMA from "./pages/NewCMA";
import CmaResults from "./pages/CmaResults"; // ✅ add this

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />

        <Route
          path="/new-cma"
          element={
            <ProtectedRoute>
              <NewCMA />
            </ProtectedRoute>
          }
        />

        {/* ✅ CMA Results route */}
        <Route
          path="/cmas/:requestId"
          element={
            <ProtectedRoute>
              <CmaResults />
            </ProtectedRoute>
          }
        />

        {/* Root → dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Catch-all → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;