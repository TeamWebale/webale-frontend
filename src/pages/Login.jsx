/**
 * Login.jsx
 * Destination: src/pages/Login.jsx
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import WebaleLogo from "../components/WebaleLogo";

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* ── Brand ── */}
        <div style={styles.brand}>
          <WebaleLogo variant="full" size="lg" theme="dark" />
        </div>

        <p style={styles.welcome}>Welcome back</p>

        {/* ── Error ── */}
        {error && (
          <div style={styles.error}>
            <span>{error}</span>
            <button onClick={() => setError("")} style={styles.errorClose}>✕</button>
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={styles.input}
            />
          </div>

          <div style={styles.forgotRow}>
            <Link to="/forgot-password" style={styles.forgotLink}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* ── Register link ── */}
        <p style={styles.registerRow}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.registerLink}>Create one</Link>
        </p>

        {/* ── Footer ── */}
        <p style={styles.footer}>© 2026 Webale · webale.net</p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight      : "100vh",
    background     : "#0D1B2E",
    display        : "flex",
    alignItems     : "center",
    justifyContent : "center",
    padding        : "24px 16px",
  },
  card: {
    background   : "#0D1B2E",
    borderRadius : "20px",
    border       : "1px solid rgba(255,255,255,0.08)",
    padding      : "44px 40px 32px",
    width        : "100%",
    maxWidth     : "400px",
    display      : "flex",
    flexDirection: "column",
    alignItems   : "center",
    gap          : "0",
    boxShadow    : "0 8px 48px rgba(0,0,0,0.4)",
  },
  brand: {
    marginBottom: "24px",
  },
  welcome: {
    fontSize    : "14px",
    color       : "rgba(255,255,255,0.45)",
    marginBottom: "24px",
    letterSpacing: "0.3px",
  },
  error: {
    width          : "100%",
    background     : "rgba(220,53,69,0.15)",
    border         : "1px solid rgba(220,53,69,0.4)",
    borderRadius   : "8px",
    padding        : "10px 14px",
    color          : "#ff8a8a",
    fontSize       : "13px",
    marginBottom   : "16px",
    display        : "flex",
    justifyContent : "space-between",
    alignItems     : "center",
    gap            : "8px",
  },
  errorClose: {
    background: "transparent",
    border    : "none",
    color     : "#ff8a8a",
    cursor    : "pointer",
    fontSize  : "14px",
    padding   : "0",
    flexShrink: 0,
  },
  form: {
    width        : "100%",
    display      : "flex",
    flexDirection: "column",
    gap          : "16px",
  },
  field: {
    display      : "flex",
    flexDirection: "column",
    gap          : "6px",
  },
  label: {
    fontSize    : "12px",
    fontWeight  : 500,
    color       : "rgba(255,255,255,0.55)",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    fontFamily  : "'Segoe UI', sans-serif",
  },
  input: {
    background  : "rgba(255,255,255,0.06)",
    border      : "1px solid rgba(255,255,255,0.12)",
    borderRadius: "10px",
    padding     : "11px 14px",
    fontSize    : "15px",
    color       : "#FFFFFF",
    outline     : "none",
    fontFamily  : "'Segoe UI', sans-serif",
    transition  : "border-color 0.15s",
  },
  forgotRow: {
    textAlign: "right",
    marginTop: "-4px",
  },
  forgotLink: {
    fontSize      : "13px",
    color         : "#00C2CC",
    textDecoration: "none",
  },
  btn: {
    marginTop   : "4px",
    background  : "linear-gradient(135deg, #00C2CC 0%, #4A7FC1 100%)",
    color       : "#FFFFFF",
    border      : "none",
    borderRadius: "10px",
    padding     : "13px",
    fontSize    : "15px",
    fontWeight  : 600,
    cursor      : "pointer",
    fontFamily  : "'Segoe UI', sans-serif",
    transition  : "opacity 0.15s",
  },
  registerRow: {
    marginTop : "20px",
    fontSize  : "14px",
    color     : "rgba(255,255,255,0.4)",
    fontFamily: "'Segoe UI', sans-serif",
  },
  registerLink: {
    color         : "#00C2CC",
    textDecoration: "none",
    fontWeight    : 500,
  },
  footer: {
    marginTop   : "28px",
    fontSize    : "11px",
    color       : "rgba(255,255,255,0.2)",
    letterSpacing: "0.3px",
    fontFamily  : "'Segoe UI', sans-serif",
  },
};
