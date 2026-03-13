/**
 * Login.jsx — src/pages/Login.jsx
 * Left side: Pitch text (collapsible) on navy gradient
 * Right side: Login form
 * Mobile: pitch below form as collapsible card
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

  const PitchContent = ({ mobile }) => {
    const fontSize = mobile ? '13px' : '15px';
    const paraStyle = { margin: '0 0 14px', fontSize, lineHeight: 1.75, color: 'rgba(255,255,255,0.85)' };
    const para1Style = { ...paraStyle, color: 'rgba(255,255,255,0.95)' };

    return (
      <>
        <p style={para1Style}>
          Repetitive manual posts updating donor groups of campaign progress cost fundraisers time, they have to jostle for attention with unbundled stream of randomized feed, and; <em>'it was never meant to be that way!'</em> So we rolled the sleeves to build <strong>Webale!</strong> for automation of that and related tasks.
        </p>

        {!pitchExpanded && (
          <button onClick={() => setPitchExpanded(true)} style={{
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: '20px', padding: mobile ? '6px 16px' : '8px 20px',
            fontSize: mobile ? '12px' : '13px', fontWeight: 600,
            color: '#00E5CC', cursor: 'pointer', display: 'block',
            margin: '4px auto 0',
          }}>
            Read more ▼
          </button>
        )}

        {pitchExpanded && (
          <>
            <p style={paraStyle}>
              Be it a five member family group or five hundred diaspora contributors, <strong>Webale!</strong> is here to help you replace the chaos of manual record-keeping with a smart dashboard so alive and breathing it ensures that everyone is acknowledged, aligned, motivated, and updated.
            </p>
            <p style={paraStyle}>
              Pledges and contributions are tracked and logged so members are updated of who committed to what, fulfilled, revised or even revoked a pledge. The money conversation continues as real time progress-bars charm members with a visual of how close the group is to the finishing line; so 'fear of missing out' inspire a 'yes we can' wave of participation.
            </p>
            <p style={paraStyle}>
              Next is currency conversion across 160+ countries, highlights of quarterly milestones, automated reminders, acknowledgements, in-built member messaging and lots of other admin controls together put fundraisers firmly in charge.
            </p>
            <p style={paraStyle}>
              <strong>Webale!</strong> is designed with your donor circle in mind; so team growth, campaign targets and action tracking dominate our array of tools, features and functions. Because invitation-only groups already trust each other, what they missed is privacy away from general purpose groups and a structured, transparent alternative that enliven the task of pooling money.
            </p>
            <p style={paraStyle}>
              That's a peek into our ever growing arsenal of innovation for the success of your cause; so what keeps you from launching your fundraising here today?
            </p>
            <p style={{ margin: '0 0 10px', fontSize: mobile ? '14px' : '15px', color: 'rgba(255,255,255,0.9)' }}>
              Because your cause is personal <span style={{ color: '#00E5CC' }}>Webale! — Private Group Fundraising</span> gives you a befitting platform.
            </p>
            <p style={{ margin: '0 0 4px', fontSize: '13px', opacity: 0.7, color: 'white' }}>
              Sincerely,
            </p>
            <p style={{ margin: '0 0 8px' }}>
              <a href="mailto:theteam@webale.net" style={{ color: '#FFB800', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
                theteam@webale.net 📧
              </a>
            </p>
            <button onClick={() => setPitchExpanded(false)} style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '20px', padding: '5px 14px', fontSize: '11px', fontWeight: 600,
              color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'block',
              margin: '0 auto',
            }}>
              Show less ▲
            </button>
          </>
        )}
      </>
    );
  };

  return (
    <div style={s.page}>

      {/* ── Left: Pitch Text (desktop only) ── */}
      <div style={s.pitchSide} className="login-pitch">
        <div style={s.pitchInner}>
          <WebaleLogo variant="full" size="lg" theme="dark" />
          <div style={s.pills}>
            <span style={s.pill}>🔒 Invitation-Only</span>
            <span style={s.pill}>💱 160+ Currencies</span>
            <span style={s.pill}>📊 Real-Time Tracking</span>
          </div>
          <PitchContent mobile={false} />
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

          {/* Mobile: Pitch card below form */}
          <div className="login-pitch-mobile" style={s.mobilePitch}>
            <PitchContent mobile={true} />
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
  page: { minHeight: "100vh", display: "flex", background: "#0D1B2E" },
  pitchSide: {
    flex: 1, overflow: "auto",
    background: "linear-gradient(135deg, #1B2D4F 0%, #2d4a7a 50%, #4A7FC1 100%)",
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    padding: "40px",
  },
  pitchInner: { maxWidth: "500px", color: "white" },
  pills: { display: "flex", flexWrap: "wrap", gap: "8px", margin: "20px 0 24px" },
  pill: {
    background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "20px", padding: "8px 16px", fontSize: "12px",
    fontWeight: 600, color: "rgba(255,255,255,0.95)", fontFamily: "'Segoe UI', sans-serif",
  },
  formSide: {
    width: "480px", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "40px 32px", background: "#0D1B2E",
  },
  card: { width: "100%", maxWidth: "380px", display: "flex", flexDirection: "column", alignItems: "center" },
  brand: { marginBottom: "8px" },
  welcome: { fontSize: "14px", color: "#00E5CC", fontWeight: 500, marginBottom: "16px" },
  error: {
    width: "100%", background: "rgba(220,53,69,0.15)", border: "1px solid rgba(220,53,69,0.4)",
    borderRadius: "8px", padding: "10px 14px", color: "#ff8a8a", fontSize: "13px",
    marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px",
  },
  errClose: { background: "transparent", border: "none", color: "#ff8a8a", cursor: "pointer", fontSize: "14px", padding: "0" },
  form: { width: "100%", display: "flex", flexDirection: "column", gap: "12px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,0.55)", letterSpacing: "0.3px", fontFamily: "'Segoe UI',sans-serif" },
  input: {
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "10px", padding: "11px 14px", fontSize: "15px",
    color: "#FFFFFF", outline: "none", fontFamily: "'Segoe UI',sans-serif",
  },
  forgot: { fontSize: "13px", color: "#00C2CC", textDecoration: "none" },
  btn: {
    marginTop: "4px", background: "linear-gradient(135deg,#00C2CC,#4A7FC1)",
    color: "#FFF", border: "none", borderRadius: "10px", padding: "13px",
    fontSize: "15px", fontWeight: 600, cursor: "pointer", fontFamily: "'Segoe UI',sans-serif",
  },
  reg: { marginTop: "12px", fontSize: "14px", color: "rgba(255,255,255,0.4)", fontFamily: "'Segoe UI',sans-serif" },
  regLink: { color: "#00C2CC", textDecoration: "none", fontWeight: 500 },
  mobilePitch: {
    width: "100%", marginTop: "16px",
    background: "linear-gradient(135deg, #1B2D4F 0%, #2d4a7a 50%, #4A7FC1 100%)",
    borderRadius: "12px", padding: "16px",
  },
};
