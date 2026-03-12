/**
 * Login.jsx — src/pages/Login.jsx
 * SWAPPED VERSION: Pitch text on left, login form on right
 * Mobile: collapsible pitch above footer
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
  const [pitchExpanded, setPitchExpanded] = useState(false);

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

      {/* ── Left: Pitch Text (desktop only) ── */}
      <div style={s.pitchSide} className="login-pitch">
        <div style={s.pitchContent}>
          <WebaleLogo variant="full" size="lg" theme="dark" />

          <div style={s.pitchPills}>
            <span style={s.pill}>🔒 Invitation-Only</span>
            <span style={s.pill}>💱 160+ Currencies</span>
            <span style={s.pill}>📊 Real-Time Tracking</span>
          </div>

          <p style={s.pitchPara1}>
            Repetitive manual posts updating donor groups of campaign progress cost fundraisers time, have to jostle for attention with the unbundled stream of randomized feed, and; <em>'it was never meant to be that way!'</em> So we rolled the sleeves to build <strong>Webale!</strong> for automation of that and related tasks.
          </p>
          <p style={s.pitchPara}>
            Be it a five member family group or five hundred diaspora contributors, <strong>Webale!</strong> is here to help you replace the chaos of manual record-keeping with a smart dashboard so alive and breathing it ensures that everyone is acknowledged, aligned, motivated, and updated.
          </p>
          <p style={s.pitchPara}>
            Pledges and contributions are tracked and logged so members are updated of who committed to what, fulfilled, revised or even revoked a pledge. The money conversation continues as real time progress-bars charm members with a visual of how close the group is to the finishing line; so 'fear of missing out' inspire a 'yes we can' wave of participation.
          </p>
          <p style={s.pitchPara}>
            <strong>Webale!</strong> is designed with your donor circle in mind; so team growth, campaign targets and action tracking dominate our array of tools, features and functions.
          </p>

          <p style={s.pitchClosing}>
            Because your cause is personal <span style={{ color: '#00E5CC' }}>Webale! — Private Group Fundraising</span> gives you a befitting platform.
          </p>
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

          {/* Mobile pitch (collapsible) */}
          <div className="login-pitch-mobile" style={s.mobilePitch}>
            <p style={s.mobilePitchText}>
              Repetitive manual posts updating donor groups of campaign progress cost fundraisers time... <em>'it was never meant to be that way!'</em> So we built <strong>Webale!</strong>
            </p>
            {!pitchExpanded && (
              <button onClick={() => setPitchExpanded(true)} style={s.mobileReadMore}>
                Read more ▼
              </button>
            )}
            {pitchExpanded && (
              <>
                <p style={s.mobilePitchText}>
                  Be it a five member family group or five hundred diaspora contributors, Webale! is here to help you replace the chaos of manual record-keeping with a smart dashboard so alive and breathing it ensures everyone is acknowledged, aligned, motivated, and updated.
                </p>
                <p style={s.mobilePitchText}>
                  Pledges and contributions are tracked and logged. Real time progress-bars charm members with a visual of how close the group is to the finishing line.
                </p>
                <p style={{ ...s.mobilePitchText, color: '#00E5CC', fontWeight: 600 }}>
                  Because your cause is personal — Webale! gives you a befitting platform.
                </p>
                <button onClick={() => setPitchExpanded(false)} style={s.mobileShowLess}>
                  Show less ▲
                </button>
              </>
            )}
            <div style={s.mobilePills}>
              <span style={s.pillSmall}>🔒 Invitation-Only</span>
              <span style={s.pillSmall}>💱 160+ Currencies</span>
              <span style={s.pillSmall}>📊 Real-Time Tracking</span>
            </div>
          </div>

          <div style={{ marginTop: "12px", textAlign: "center", fontFamily: "'Segoe UI',sans-serif" }}>
            <p style={{ margin: "0 0 2px", fontSize: "11px", fontWeight: 600, color: "#00E5CC", letterSpacing: "0.2px" }}>
              © Copyright 2026 Landfolks Aitech Ltd
            </p>
            <p style={{ margin: 0, fontSize: "11px", fontWeight: 600, color: "#FFB800", letterSpacing: "0.2px" }}>
              theteam@webale.net
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .login-pitch { display: flex; }
        .login-pitch-mobile { display: none; }
        @media (max-width: 900px) {
          .login-pitch { display: none !important; }
          .login-pitch-mobile { display: block !important; }
          .login-form-side {
            width: 100% !important;
            padding: 8px 16px 16px !important;
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

  // Left pitch side
  pitchSide: {
    flex: 1, position: "relative", overflow: "auto",
    background: "linear-gradient(135deg, #1B2D4F 0%, #2d4a7a 50%, #4A7FC1 100%)",
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    padding: "40px",
  },
  pitchContent: {
    maxWidth: "480px", color: "white",
  },
  pitchPills: {
    display: "flex", flexWrap: "wrap", gap: "8px", margin: "24px 0",
  },
  pill: {
    background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "20px", padding: "8px 16px", fontSize: "12px",
    fontWeight: 600, color: "rgba(255,255,255,0.95)",
    fontFamily: "'Segoe UI', sans-serif",
  },
  pitchPara1: {
    fontSize: "16px", lineHeight: 1.75, color: "rgba(255,255,255,0.9)",
    margin: "0 0 16px", fontFamily: "'Segoe UI', sans-serif",
  },
  pitchPara: {
    fontSize: "15px", lineHeight: 1.75, color: "rgba(255,255,255,0.8)",
    margin: "0 0 14px", fontFamily: "'Segoe UI', sans-serif",
  },
  pitchClosing: {
    fontSize: "15px", lineHeight: 1.6, margin: "20px 0 0",
    fontFamily: "'Segoe UI', sans-serif", color: "rgba(255,255,255,0.9)",
  },

  // Right form
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

  // Mobile pitch
  mobilePitch: {
    width: "100%", marginTop: "16px",
    background: "linear-gradient(135deg, #1B2D4F 0%, #2d4a7a 100%)",
    borderRadius: "12px", padding: "16px", overflow: "hidden",
  },
  mobilePitchText: {
    fontSize: "13px", lineHeight: 1.7, color: "rgba(255,255,255,0.85)",
    margin: "0 0 10px", fontFamily: "'Segoe UI', sans-serif",
  },
  mobileReadMore: {
    background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "16px", padding: "6px 16px", fontSize: "12px", fontWeight: 600,
    color: "#00E5CC", cursor: "pointer", display: "block", margin: "4px auto 8px",
  },
  mobileShowLess: {
    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "16px", padding: "4px 14px", fontSize: "11px", fontWeight: 600,
    color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "block", margin: "4px auto 8px",
  },
  mobilePills: {
    display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center", marginTop: "8px",
  },
  pillSmall: {
    background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "16px", padding: "4px 10px", fontSize: "10px",
    fontWeight: 600, color: "rgba(255,255,255,0.8)",
    fontFamily: "'Segoe UI', sans-serif",
  },
};
