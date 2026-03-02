/**
 * App.jsx — Destination: src/App.jsx
 *
 * Public routes: Login, Register, ForgotPassword, AcceptInvite — NO Navbar/Sidebar
 * Protected routes: wrapped in MainLayout (Navbar + profile banner + Outlet)
 *
 * Code splitting: Heavy pages (GroupDetails, PlatformAdmin, Inbox, Profile)
 * are lazy-loaded to reduce initial bundle size (was 656KB).
 */
import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import MainLayout    from "./components/MainLayout";
import Login         from "./pages/Login";
import Register      from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AcceptInvite  from "./pages/AcceptInvite";
import Dashboard     from "./pages/Dashboard";
import CreateGroup   from "./pages/CreateGroup";

// Lazy-loaded heavy pages — split into separate chunks
const GroupDetails  = lazy(() => import("./pages/GroupDetails"));
const PlatformAdmin = lazy(() => import("./pages/PlatformAdmin"));
const Inbox         = lazy(() => import("./pages/Inbox"));
const Profile       = lazy(() => import("./pages/Profile"));

// Shared loading fallback
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <div className="spinner" style={{ width: 36, height: 36 }}></div>
  </div>
);

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
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public — bare, no Navbar, no Sidebar */}
        <Route path="/"               element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/login"          element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register"       element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/invite/:token"  element={<AcceptInvite />} />
        <Route path="/join/:token"    element={<AcceptInvite />} />

        {/* Protected — MainLayout provides Navbar + banner + Outlet */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard"    element={<Dashboard />} />
          <Route path="/create-group" element={<CreateGroup />} />
          <Route path="/groups/:id"   element={<GroupDetails />} />
          <Route path="/profile"      element={<Profile />} />
          <Route path="/admin"        element={<PlatformAdmin />} />
          <Route path="/inbox"        element={<Inbox />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
