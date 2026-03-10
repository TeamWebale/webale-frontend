/**
 * Login.jsx — src/pages/Login.jsx
 * Split-screen: hero image (left) + login form (right)
 * Mobile: form only with subtle background
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
    e.preventDefault(); setError(""); setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Incorrect email or password. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>

      {/* ── Left: Hero Image (desktop only) ── */}
      <div style={s.heroSide} className="login-hero">
        <div style={s.heroOverlay}>
          <div style={s.heroPillsWrap}>
            <span style={s.heroPill}>🔒 Invitation-Only</span>
            <span style={s.heroPill}>💱 160+ Currencies</span>
            <span style={s.heroPill}>📊 Real-Time Tracking</span>
          </div>
        </div>
      </div>

      {/* ── Right: Login Form ── */}
      <div style={s.formSide} className="login-form-side">
        <div style={s.card}>
          <div style={s.brand}>
            <WebaleLogo variant="full" size="lg" theme="dark" />
          </div>
          <p style={s.welcome}>(Teams, Targets, Tracking)</p>

          {error && (
            <div style={s.error}>
              <span>{error}</span>
              <button onClick={() => setError("")} style={s.errClose}>✕</button>
            </div>
          )}

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="you@example.com" style={s.input} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                required placeholder="••••••••" style={s.input} />
            </div>
            <div style={{ textAlign: "right" }}>
              <Link to="/forgot-password" style={s.forgot}>Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading} style={s.btn}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p style={s.reg}>
            Don't have an account? <Link to="/register" style={s.regLink}>Create one</Link>
          </p>

          {/* Mobile hero banner */}
          <div className="login-hero-mobile" style={s.mobileHero}>
            <div style={s.mobileHeroOverlay}>
              <div style={s.mobileTopPills}>
                <span style={s.heroPill}>🔒 Invitation-Only</span>
                <span style={s.heroPill}>💱 160+ Currencies</span>
              </div>
              <div style={s.mobileBottomPill}>
                <span style={s.heroPill}>📊 Real-Time Tracking</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "12px", textAlign: "center", fontFamily: "'Segoe UI',sans-serif" }}>
            <p style={{ margin: "0 0 2px", fontSize: "11px", fontWeight: 600, color: "#00E5CC", letterSpacing: "0.2px" }}>
              © Copyright 2026 Landfolks Aitech (U) Ltd
            </p>
            <p style={{ margin: 0, fontSize: "11px", fontWeight: 600, color: "#FFB800", letterSpacing: "0.2px" }}>
              theteam@webale.net
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .login-hero { display: flex; }
        .login-hero-mobile { display: none; }
        @media (max-width: 900px) {
          .login-hero { display: none !important; }
          .login-hero-mobile { display: block !important; }
          .login-form-side {
            width: 100% !important;
            padding: 16px 16px !important;
            align-items: center !important;
          }
          .login-form-side > div {
            max-width: 320px !important;
          }
        }
      `}</style>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh", display: "flex", background: "#0D1B2E",
  },
  heroSide: {
    flex: 1, position: "relative", overflow: "hidden",
    backgroundImage: "url('/login-hero.jpg')",
    backgroundSize: "cover", backgroundPosition: "center",
    minHeight: "100vh",
  },
  heroOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    background: "linear-gradient(180deg, rgba(13,27,46,0.7) 0%, rgba(13,27,46,0.2) 40%, rgba(13,27,46,0.3) 100%)",
    display: "flex", alignItems: "flex-start", justifyContent: "flex-start",
    padding: "28px 24px",
  },
  heroPillsWrap: {
    display: "flex", flexDirection: "column", gap: "8px",
  },
  heroPill: {
    background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "20px", padding: "8px 16px", fontSize: "12px",
    fontWeight: 600, color: "rgba(255,255,255,0.95)",
    fontFamily: "'Segoe UI', sans-serif",
    backdropFilter: "blur(4px)",
  },
  formSide: {
    width: "480px", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "40px 32px",
    background: "#0D1B2E",
  },
  card: {
    width: "100%", maxWidth: "380px",
    display: "flex", flexDirection: "column", alignItems: "center",
  },
  brand: { marginBottom: "8px" },
  welcome: { fontSize: "14px", color: "#00E5CC", fontWeight: 500, marginBottom: "16px" },
  error: {
    width: "100%", background: "rgba(220,53,69,0.15)",
    border: "1px solid rgba(220,53,69,0.4)", borderRadius: "8px",
    padding: "10px 14px", color: "#ff8a8a", fontSize: "13px",
    marginBottom: "16px", display: "flex", justifyContent: "space-between",
    alignItems: "center", gap: "8px",
  },
  errClose: {
    background: "transparent", border: "none", color: "#ff8a8a",
    cursor: "pointer", fontSize: "14px", padding: "0",
  },
  form: { width: "100%", display: "flex", flexDirection: "column", gap: "12px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: {
    fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,0.55)",
    letterSpacing: "0.3px", fontFamily: "'Segoe UI',sans-serif",
  },
  input: {
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "10px", padding: "11px 14px", fontSize: "15px",
    color: "#FFFFFF", outline: "none", fontFamily: "'Segoe UI',sans-serif",
  },
  forgot: { fontSize: "13px", color: "#00C2CC", textDecoration: "none" },
  btn: {
    marginTop: "4px", background: "linear-gradient(135deg,#00C2CC,#4A7FC1)",
    color: "#FFF", border: "none", borderRadius: "10px", padding: "13px",
    fontSize: "15px", fontWeight: 600, cursor: "pointer",
    fontFamily: "'Segoe UI',sans-serif",
  },
  reg: {
    marginTop: "12px", fontSize: "14px", color: "rgba(255,255,255,0.4)",
    fontFamily: "'Segoe UI',sans-serif",
  },
  regLink: { color: "#00C2CC", textDecoration: "none", fontWeight: 500 },
  mobileHero: {
    width: "100%", height: "150px", marginTop: "16px",
    borderRadius: "12px", overflow: "hidden", position: "relative",
    backgroundImage: "url('/login-hero.jpg')",
    backgroundSize: "cover", backgroundPosition: "center",
  },
  mobileHeroOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    background: "linear-gradient(180deg, rgba(13,27,46,0.7) 0%, rgba(13,27,46,0.15) 50%, rgba(13,27,46,0.7) 100%)",
    display: "flex", flexDirection: "column", justifyContent: "space-between",
    padding: "10px 12px",
  },
  mobileTopPills: {
    display: "flex", gap: "6px", justifyContent: "center",
  },
  mobileBottomPill: {
    display: "flex", justifyContent: "center",
  },
};
