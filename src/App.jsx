/**
 * App.jsx
 * Destination: src/App.jsx
 *
 * Layout logic:
 *   Public routes  (Login, Register, ForgotPassword, AcceptInvite)
 *     → rendered bare, NO Navbar, NO MainLayout
 *   Protected routes (Dashboard, Groups, Profile, etc.)
 *     → wrapped in MainLayout which includes Navbar
 *     → redirect to /login if not authenticated
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Layouts
import MainLayout from "./components/MainLayout";

// Public pages
import Login          from "./pages/Login";
import Register       from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AcceptInvite   from "./pages/AcceptInvite";

// Protected pages
import Dashboard   from "./pages/Dashboard";
import CreateGroup from "./pages/CreateGroup";
import GroupDetails from "./pages/GroupDetails";
import Profile     from "./pages/Profile";

// ─── Route guards ────────────────────────────────────────────────

/** Redirect authenticated users away from login/register */
function PublicRoute({ children }) {
  const { user } = useAuth();

  // If logged in and there's a pending invite, honour it first
  const pendingInvite = localStorage.getItem("pendingInvite");
  if (user && pendingInvite) {
    return <Navigate to={`/invite/${pendingInvite}`} replace />;
  }

  return user ? <Navigate to="/dashboard" replace /> : children;
}

/** Redirect unauthenticated users to login */
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

// ─── App ─────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public routes — no Navbar ── */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/invite/:token"   element={<AcceptInvite />} />
        <Route path="/join/:token"     element={<AcceptInvite />} />

        {/* ── Protected routes — wrapped in MainLayout (includes Navbar) ── */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard"      element={<Dashboard />} />
          <Route path="/create-group"   element={<CreateGroup />} />
          <Route path="/groups/:id"     element={<GroupDetails />} />
          <Route path="/profile"        element={<Profile />} />
        </Route>

        {/* ── Catch-all ── */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
