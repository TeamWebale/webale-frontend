/**
 * ForgotPassword.jsx
 * Destination: src/pages/ForgotPassword.jsx
 *
 * 3-step wizard:
 *   Step 1 — Enter email → POST /api/auth/forgot-password
 *   Step 2 — Enter 6-char code + new password → POST /api/auth/reset-password
 *   Step 3 — Success screen → Go to Sign In
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import WebaleLogo from "../components/WebaleLogo";

const API = "https://webale-api.onrender.com/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step,     setStep]     = useState(1);
  const [email,    setEmail]    = useState("");
  const [code,     setCode]     = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  // Step 1 — send reset code
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await axios.post(`${API}/auth/forgot-password`, { email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Could not send reset code. Check your email.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — verify code + set new password
  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) return setError("Passwords do not match.");
    setLoading(true);
    try {
      await axios.post(`${API}/auth/reset-password`, { email, code, password });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brand}>
          <WebaleLogo variant="compact" size="md" theme="dark" />
        </div>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <>
            <h2 style={styles.title}>Reset Password</h2>
            <p style={styles.sub}>Enter your email and we'll send a reset code.</p>
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleSendCode} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Email</label>
                <input
                  type="email" value={email} required
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" style={styles.input}
                />
              </div>
              <button type="submit" disabled={loading} style={styles.btn}>
                {loading ? "Sending…" : "Send Reset Code"}
              </button>
            </form>
            <Link to="/login" style={styles.backLink}>← Back to Sign In</Link>
          </>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <>
            <h2 style={styles.title}>Enter Code</h2>
            <p style={styles.sub}>Check your email for the 6-character code.</p>
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleReset} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Reset Code</label>
                <input
                  value={code} required maxLength={6}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="6-character code" style={{ ...styles.input, letterSpacing: "4px", textTransform: "uppercase" }}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>New Password</label>
                <input
                  type="password" value={password} required
                  onChange={e => setPassword(e.target.value)}
                  placeholder="New password" style={styles.input}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Confirm Password</label>
                <input
                  type="password" value={confirm} required
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat password" style={styles.input}
                />
              </div>
              <button type="submit" disabled={loading} style={styles.btn}>
                {loading ? "Resetting…" : "Reset Password"}
              </button>
            </form>
            <button onClick={() => { setStep(1); setError(""); }} style={styles.backLink}>
              ← Back
            </button>
          </>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div style={styles.success}>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.title}>Password Reset!</h2>
            <p style={styles.sub}>Your password has been updated successfully.</p>
            <button onClick={() => navigate("/login")} style={styles.btn}>
              Go to Sign In
            </button>
          </div>
        )}

        <p style={styles.footer}>© 2026 Webale · webale.net</p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh", background: "#0D1B2E",
    display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px",
  },
  card: {
    background: "#0D1B2E", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px", padding: "44px 40px 32px", width: "100%", maxWidth: "400px",
    display: "flex", flexDirection: "column", alignItems: "center",
    boxShadow: "0 8px 48px rgba(0,0,0,0.4)",
  },
  brand:  { marginBottom: "24px" },
  title:  { fontSize: "20px", fontWeight: 700, color: "#FFFFFF", marginBottom: "8px", fontFamily: "'Segoe UI', sans-serif" },
  sub:    { fontSize: "13px", color: "rgba(255,255,255,0.45)", marginBottom: "20px", textAlign: "center", fontFamily: "'Segoe UI', sans-serif" },
  error:  { width: "100%", background: "rgba(220,53,69,0.15)", border: "1px solid rgba(220,53,69,0.4)", borderRadius: "8px", padding: "10px 14px", color: "#ff8a8a", fontSize: "13px", marginBottom: "16px", fontFamily: "'Segoe UI', sans-serif" },
  form:   { width: "100%", display: "flex", flexDirection: "column", gap: "14px" },
  field:  { display: "flex", flexDirection: "column", gap: "5px" },
  label:  { fontSize: "11px", fontWeight: 500, color: "rgba(255,255,255,0.5)", letterSpacing: "0.5px", textTransform: "uppercase", fontFamily: "'Segoe UI', sans-serif" },
  input:  { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "11px 14px", fontSize: "14px", color: "#FFFFFF", outline: "none", fontFamily: "'Segoe UI', sans-serif" },
  btn:    { marginTop: "4px", background: "linear-gradient(135deg, #00C2CC 0%, #4A7FC1 100%)", color: "#FFF", border: "none", borderRadius: "10px", padding: "13px", fontSize: "15px", fontWeight: 600, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif" },
  backLink: { marginTop: "16px", fontSize: "13px", color: "rgba(255,255,255,0.4)", textDecoration: "none", background: "none", border: "none", cursor: "pointer", fontFamily: "'Segoe UI', sans-serif" },
  success: { display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "100%" },
  successIcon: { width: "56px", height: "56px", borderRadius: "50%", background: "rgba(0,194,204,0.2)", border: "2px solid #00C2CC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", color: "#00C2CC" },
  footer: { marginTop: "28px", fontSize: "11px", color: "rgba(255,255,255,0.2)", fontFamily: "'Segoe UI', sans-serif" },
};
