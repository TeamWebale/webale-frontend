/**
 * App.jsx — Destination: src/App.jsx
 *
 * Public routes: Login, Register, ForgotPassword, AcceptInvite — NO Navbar/Sidebar
 * Protected routes: wrapped in MainLayout (Navbar + profile banner + Outlet)
 */
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import MainLayout    from "./components/MainLayout";
import Login         from "./pages/Login";
import Register      from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AcceptInvite  from "./pages/AcceptInvite";
import Dashboard     from "./pages/Dashboard";
import CreateGroup   from "./pages/CreateGroup";
import GroupDetails  from "./pages/GroupDetails";
import Profile       from "./pages/Profile";
import PlatformAdmin from "./pages/PlatformAdmin";
import Inbox         from "./pages/Inbox";
import Terms         from "./pages/Terms";

function PublicRoute({ children }) {
  const { user } = useAuth();
  const pendingInvite = localStorage.getItem("pendingInvite");
  if (user && pendingInvite) return <Navigate to={`/invite/${pendingInvite}`} replace />;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public — bare, no Navbar, no Sidebar */}
      <Route path="/"               element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/login"          element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register"       element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/invite/:token"  element={<AcceptInvite />} />
      <Route path="/join/:token"    element={<AcceptInvite />} />
      <Route path="/terms"          element={<Terms />} />

      {/* Protected — MainLayout provides Navbar + banner + Outlet */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/dashboard"    element={<Dashboard />} />
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/groups/:id"   element={<GroupDetails />} />
        <Route path="/profile"      element={<Profile />} />
        <Route path="/admin"        element={<PlatformAdmin />} />
        <Route path="/inbox"        element={<Inbox />} />
        <Route path="/terms"        element={<Terms />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
