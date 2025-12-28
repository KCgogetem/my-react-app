// src/App.tsx
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import NewCMA from "./pages/NewCMA";
import CmaList from "./pages/CmaList";
import CmaResults from "./pages/CmaResults";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import SignUpPage from "./pages/SignUpPage";
import ProtectedRoute from "./components/ProtectedRoutes";
import Feedback from "./pages/Feedback";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUpPage />} />
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
        <Route
          path="/cma-results"
          element={
            <ProtectedRoute>
              <CmaList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cma-results/:requestId"
          element={
            <ProtectedRoute>
              <CmaResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/privacy-policy"
          element={
            <ProtectedRoute>
              <PrivacyPolicy />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback"
          element={
            <ProtectedRoute>
              <Feedback />
            </ProtectedRoute>
          }
        />

        {/* Defaults */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;