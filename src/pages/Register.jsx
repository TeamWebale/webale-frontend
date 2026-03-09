/**
 * Register.jsx — src/pages/Register.jsx
 *
 * Flow:
 *   Step 1 — Fill registration form → submit → backend creates user + sends OTP email
 *   Step 2 — OTP entry screen → verify → backend issues JWT → user logged in
 */
import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import WebaleLogo from "../components/WebaleLogo";
import { COUNTRIES } from '../constants/countries';
import { useAuth } from '../context/AuthContext';

const API = "https://webale-api.onrender.com/api";

export default function Register() {
  const navigate  = useNavigate();
  const { login } = useAuth();

  // ── Step 1: registration form ──────────────────────────────────
  const [form, setForm] = useState({
    firstName:"", lastName:"", email:"", country:"", password:"", confirmPassword:"",
  });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // ── Step 2: OTP verification ───────────────────────────────────
  const [step,       setStep]       = useState(1);          // 1 = form, 2 = OTP
  const [otp,        setOtp]        = useState(["","","","","",""]);
  const [otpError,   setOtpError]   = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resending,  setResending]  = useState(false);
  const [resendMsg,  setResendMsg]  = useState("");
  const inputRefs = useRef([]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  // ── Submit registration form ───────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    if (!form.country) { setError("Please select your country"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (!acceptedTerms) { setError("You must accept the Terms & Conditions to create an account"); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/auth/register`, {
        firstName: form.firstName,
        lastName:  form.lastName,
        email:     form.email,
        country:   form.country,
        password:  form.password,
      });
      // Backend sends OTP — move to step 2
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input handling ─────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  // ── Verify OTP ─────────────────────────────────────────────────
  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) { setOtpError("Please enter all 6 digits"); return; }
    setOtpError("");
    setOtpLoading(true);
    try {
      const res = await axios.post(`${API}/auth/verify-otp`, {
        email: form.email,
        otp:   code,
      });
      if (res.data.success) {
        // Store token + user
        const { token, user } = res.data.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Check for pending invite, then do a full page load so AuthContext picks up the token
        const pendingInvite = localStorage.getItem("pendingInvite");
        if (pendingInvite) {
          localStorage.removeItem("pendingInvite");
          window.location.href = `/invite/${pendingInvite}`;
        } else {
          window.location.href = "/dashboard";
        }
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || "Invalid code. Please try again.");
      setOtp(["","","","","",""]);
      inputRefs.current[0]?.focus();
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Resend OTP ─────────────────────────────────────────────────
  const handleResend = async () => {
    setResending(true);
    setResendMsg("");
    setOtpError("");
    try {
      await axios.post(`${API}/auth/send-otp`, { email: form.email });
      setResendMsg("A new code has been sent to your email.");
      setOtp(["","","","","",""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setResendMsg("Failed to resend. Please try again.");
    } finally {
      setResending(false);
    }
  };

  // ════════════════════════════════════════════════════════════════
  // STEP 2 — OTP screen
  // ════════════════════════════════════════════════════════════════
  if (step === 2) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={{ textAlign:"center", marginBottom:"20px" }}>
            <WebaleLogo variant="full" size="md" theme="dark" />
          </div>

          <div style={{ textAlign:"center", marginBottom:"24px" }}>
            <div style={{ fontSize:"48px", marginBottom:"8px" }}>📧</div>
            <h2 style={s.heading}>Check your email</h2>
            <p style={{ color:"rgba(255,255,255,0.55)", fontSize:"14px", margin:"8px 0 0" }}>
              We sent a 6-digit code to
            </p>
            <p style={{ color:"#00E5CC", fontWeight:700, fontSize:"15px", margin:"4px 0 0" }}>
              {form.email}
            </p>
          </div>

          {/* 6-digit OTP boxes */}
          <div style={{ display:"flex", gap:"8px", justifyContent:"center", marginBottom:"20px", flexWrap:"nowrap" }}
               onPaste={handleOtpPaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                style={{
                  width:"42px", height:"52px", textAlign:"center",
                  fontSize:"22px", fontWeight:700,
                  background: digit ? "rgba(0,229,204,0.15)" : "rgba(255,255,255,0.07)",
                  border: digit ? "2px solid #00E5CC" : "2px solid rgba(255,255,255,0.15)",
                  borderRadius:"10px", color:"#ffffff", outline:"none",
                  transition:"all 0.15s",
                }}
              />
            ))}
          </div>

          {otpError && (
            <div style={{ ...s.errorBox, marginBottom:"16px" }}>⚠️ {otpError}</div>
          )}
          {resendMsg && (
            <div style={{ background:"rgba(0,229,204,0.1)", border:"1px solid rgba(0,229,204,0.3)",
              borderRadius:"8px", padding:"10px 14px", marginBottom:"16px",
              fontSize:"13px", color:"#00E5CC", textAlign:"center" }}>
              {resendMsg}
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={otpLoading || otp.join("").length < 6}
            style={{ ...s.submitBtn, opacity: otp.join("").length < 6 ? 0.6 : 1 }}
          >
            {otpLoading ? "Verifying…" : "✅ Verify Email"}
          </button>

          <div style={{ textAlign:"center", marginTop:"16px" }}>
            <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"13px", margin:"0 0 8px" }}>
              Didn't receive the code?
            </p>
            <button onClick={handleResend} disabled={resending}
              style={{ background:"none", border:"none", color:"#FFB800",
                fontWeight:600, fontSize:"13px", cursor:"pointer" }}>
              {resending ? "Sending…" : "🔄 Resend code"}
            </button>
          </div>

          <p style={{ textAlign:"center", marginTop:"16px", fontSize:"12px",
            color:"rgba(255,255,255,0.3)" }}>
            Wrong email?{" "}
            <button onClick={() => setStep(1)}
              style={{ background:"none", border:"none", color:"#00E5CC",
                fontWeight:600, fontSize:"12px", cursor:"pointer" }}>
              Go back
            </button>
          </p>

          {/* Footer */}
          <div style={{ marginTop:"24px", textAlign:"center" }}>
            <p style={{ margin:"0 0 4px", fontSize:"12px", fontWeight:600, color:"#00E5CC" }}>
              © Copyright 2026 Landfolks Aitech (U) Ltd
            </p>
            <p style={{ margin:0, fontSize:"12px", fontWeight:600, color:"#FFB800" }}>
              theteam@webale.net
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // STEP 1 — Registration form
  // ════════════════════════════════════════════════════════════════
  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={{ textAlign:"center", marginBottom:"20px" }}>
          <WebaleLogo variant="full" size="md" theme="dark" />
        </div>

        <h2 style={s.heading}>Create your account</h2>

        {error && (
          <div style={s.errorBox}>
            ⚠️ {error}
            <button onClick={() => setError("")} style={s.dismissBtn}>✕</button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display:"flex", gap:"12px", marginBottom:"14px" }}>
            <div style={{ flex:1 }}>
              <label style={s.label}>First Name</label>
              <input style={s.input} placeholder="First name" required
                value={form.firstName} onChange={set("firstName")} />
            </div>
            <div style={{ flex:1 }}>
              <label style={s.label}>Last Name</label>
              <input style={s.input} placeholder="Last name" required
                value={form.lastName} onChange={set("lastName")} />
            </div>
          </div>

          <div style={{ marginBottom:"14px" }}>
            <label style={s.label}>Email</label>
            <input type="email" style={s.input} placeholder="you@example.com"
              required value={form.email} onChange={set("email")} />
          </div>

          <div style={{ marginBottom:"14px" }}>
            <label style={s.label}>Country</label>
            <select value={form.country} onChange={set("country")} required style={s.select}>
              <option value="" disabled>Select your country…</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ marginBottom:"14px" }}>
            <label style={s.label}>Password</label>
            <input type="password" style={s.input} placeholder="Minimum 8 characters"
              required minLength={8} value={form.password} onChange={set("password")} />
          </div>

          <div style={{ marginBottom:"22px" }}>
            <label style={s.label}>Confirm Password</label>
            <input type="password" style={s.input} placeholder="Repeat password"
              required value={form.confirmPassword} onChange={set("confirmPassword")} />
          </div>

          <div style={{ marginBottom:"18px" }}>
            <label style={{ display:"flex", alignItems:"flex-start", gap:"10px", cursor:"pointer" }}>
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={e => setAcceptedTerms(e.target.checked)}
                style={{ marginTop:"3px", flexShrink:0, width:"18px", height:"18px", cursor:"pointer", accentColor:"#00E5CC" }}
              />
              <span style={{ fontSize:"13px", lineHeight:"1.5", color:"rgba(255,255,255,0.6)" }}>
                I have read and agree to the{" "}
                <a href="/terms" target="_blank" rel="noopener noreferrer"
                  style={{ color:"#00E5CC", fontWeight:700, textDecoration:"underline" }}>
                  Terms &amp; Conditions
                </a>
              </span>
            </label>
          </div>

          <button type="submit" disabled={loading || !acceptedTerms}
            style={{ ...s.submitBtn, opacity: (!acceptedTerms || loading) ? 0.5 : 1 }}>
            {loading ? "Creating account…" : "🚀 Create Account"}
          </button>
        </form>

        <p style={{ textAlign:"center", marginTop:"16px", fontSize:"13px",
          color:"rgba(255,255,255,0.5)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color:"#00E5CC", fontWeight:600 }}>Sign in</Link>
        </p>

        <div style={{ marginTop:"24px", textAlign:"center" }}>
          <p style={{ margin:"0 0 4px", fontSize:"12px", fontWeight:600, color:"#00E5CC" }}>
            © Copyright 2026 Landfolks Aitech (U) Ltd
          </p>
          <p style={{ margin:0, fontSize:"12px", fontWeight:600, color:"#FFB800" }}>
            theteam@webale.net
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:{
    minHeight:"100vh", background:"#0D1B2E",
    display:"flex", alignItems:"center", justifyContent:"center",
    padding:"20px", fontFamily:"'Segoe UI',sans-serif",
  },
  card:{
    background:"rgba(255,255,255,0.05)", borderRadius:"16px",
    border:"1px solid rgba(255,255,255,0.1)", padding:"32px 28px",
    width:"100%", maxWidth:"420px",
    boxShadow:"0 20px 60px rgba(0,0,0,0.4)",
  },
  heading:{
    fontSize:"20px", fontWeight:700, color:"#ffffff",
    textAlign:"center", margin:"0 0 20px",
  },
  label:{
    display:"block", marginBottom:"6px", fontSize:"13px",
    fontWeight:600, color:"rgba(255,255,255,0.6)",
    letterSpacing:"0.2px",
  },
  input:{
    width:"100%", padding:"12px 14px", borderRadius:"10px",
    border:"1px solid rgba(255,255,255,0.15)",
    background:"rgba(255,255,255,0.07)",
    color:"#ffffff", fontSize:"14px", boxSizing:"border-box",
    outline:"none", fontFamily:"'Segoe UI',sans-serif",
  },
  select:{
    width:"100%", padding:"12px 14px", borderRadius:"10px",
    border:"1px solid rgba(255,255,255,0.15)",
    background:"#1e2d40", color:"#ffffff",
    fontSize:"14px", boxSizing:"border-box",
    outline:"none", fontFamily:"'Segoe UI',sans-serif", cursor:"pointer",
  },
  errorBox:{
    background:"rgba(229,62,62,0.15)", border:"1px solid rgba(229,62,62,0.4)",
    borderRadius:"8px", padding:"10px 14px", marginBottom:"16px",
    fontSize:"13px", color:"#fc8181",
    display:"flex", justifyContent:"space-between", alignItems:"center",
  },
  dismissBtn:{
    background:"none", border:"none", color:"#fc8181",
    fontSize:"16px", cursor:"pointer", padding:"0 0 0 8px",
  },
  submitBtn:{
    width:"100%", padding:"13px",
    background:"linear-gradient(135deg, #00B4DB, #0083B0)",
    color:"white", border:"none", borderRadius:"10px",
    fontSize:"15px", fontWeight:700, cursor:"pointer",
    fontFamily:"'Segoe UI',sans-serif",
  },
};
