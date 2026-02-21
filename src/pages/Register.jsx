/**
 * Register.jsx
 * Destination: src/pages/Register.jsx
 *
 * - Close ✕ button (navigates back to login)
 * - Country field required
 * - Pending invite redirect after signup
 * - Auto-accepts pending invite via POST /api/invitations/:token/accept
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import WebaleLogo from "../components/WebaleLogo";
import axios from "axios";

const API = "https://webale-api.onrender.com/api";

const COUNTRIES = [
  "Uganda","Kenya","Tanzania","Rwanda","Nigeria","Ghana","South Africa",
  "United Kingdom","United States","Canada","Australia","India","Germany",
  "France","Japan","China","Brazil","Mexico","Other"
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "",
    password: "", confirm_password: "", country: "",
  });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm_password) {
      return setError("Passwords do not match.");
    }
    if (!form.country) {
      return setError("Please select your country.");
    }

    setLoading(true);
    try {
      const result = await register({
        first_name: form.first_name,
        last_name : form.last_name,
        email     : form.email,
        password  : form.password,
        country   : form.country,
      });

      if (!result.success) {
        setError(result.message || "Registration failed.");
        setLoading(false);
        return;
      }

      // Auto-accept pending invite if present
      const pendingInvite = localStorage.getItem("pendingInvite");
      if (pendingInvite) {
        try {
          const token = localStorage.getItem("token");
          await axios.post(
            `${API}/invitations/${pendingInvite}/accept`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          localStorage.removeItem("pendingInvite");
          navigate(`/invite/${pendingInvite}`);
          return;
        } catch {
          localStorage.removeItem("pendingInvite");
        }
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* ✕ Close */}
        <button onClick={() => navigate("/login")} style={styles.closeBtn} aria-label="Close">✕</button>

        {/* Brand */}
        <div style={styles.brand}>
          <WebaleLogo variant="full" size="md" theme="dark" />
        </div>

        <p style={styles.subtitle}>Create your account</p>

        {/* Error */}
        {error && (
          <div style={styles.error}>
            <span>{error}</span>
            <button onClick={() => setError("")} style={styles.errorClose}>✕</button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>First Name</label>
              <input
                name="first_name" value={form.first_name}
                onChange={handleChange} required
                placeholder="First name" style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Last Name</label>
              <input
                name="last_name" value={form.last_name}
                onChange={handleChange} required
                placeholder="Last name" style={styles.input}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              name="email" type="email" value={form.email}
              onChange={handleChange} required
              placeholder="you@example.com" style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Country <span style={styles.req}>*</span></label>
            <select
              name="country" value={form.country}
              onChange={handleChange} required style={styles.input}
            >
              <option value="">Select your country…</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              name="password" type="password" value={form.password}
              onChange={handleChange} required
              placeholder="Min. 8 characters" style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Confirm Password</label>
            <input
              name="confirm_password" type="password" value={form.confirm_password}
              onChange={handleChange} required
              placeholder="Repeat password" style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p style={styles.loginRow}>
          Already have an account?{" "}
          <Link to="/login" style={styles.loginLink}>Sign in</Link>
        </p>

        <p style={styles.footer}>© 2026 Webale · webale.net</p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight     : "100vh",
    background    : "#0D1B2E",
    display       : "flex",
    alignItems    : "center",
    justifyContent: "center",
    padding       : "24px 16px",
  },
  card: {
    background   : "#0D1B2E",
    border       : "1px solid rgba(255,255,255,0.08)",
    borderRadius : "20px",
    padding      : "44px 40px 32px",
    width        : "100%",
    maxWidth     : "460px",
    display      : "flex",
    flexDirection: "column",
    alignItems   : "center",
    boxShadow    : "0 8px 48px rgba(0,0,0,0.4)",
    position     : "relative",
  },
  closeBtn: {
    position  : "absolute",
    top       : "16px",
    right     : "16px",
    background: "transparent",
    border    : "none",
    color     : "rgba(255,255,255,0.4)",
    fontSize  : "18px",
    cursor    : "pointer",
    lineHeight: 1,
    padding   : "4px",
  },
  brand: { marginBottom: "16px" },
  subtitle: {
    fontSize    : "14px",
    color       : "rgba(255,255,255,0.45)",
    marginBottom: "20px",
  },
  error: {
    width         : "100%",
    background    : "rgba(220,53,69,0.15)",
    border        : "1px solid rgba(220,53,69,0.4)",
    borderRadius  : "8px",
    padding       : "10px 14px",
    color         : "#ff8a8a",
    fontSize      : "13px",
    marginBottom  : "16px",
    display       : "flex",
    justifyContent: "space-between",
    alignItems    : "center",
    gap           : "8px",
  },
  errorClose: {
    background: "transparent", border: "none",
    color: "#ff8a8a", cursor: "pointer", fontSize: "14px", padding: "0",
  },
  form: {
    width: "100%", display: "flex", flexDirection: "column", gap: "14px",
  },
  row: {
    display: "flex", gap: "12px",
  },
  field: {
    flex: 1, display: "flex", flexDirection: "column", gap: "5px",
  },
  label: {
    fontSize: "11px", fontWeight: 500, color: "rgba(255,255,255,0.5)",
    letterSpacing: "0.5px", textTransform: "uppercase",
    fontFamily: "'Segoe UI', sans-serif",
  },
  req: { color: "#00C2CC" },
  input: {
    background  : "rgba(255,255,255,0.06)",
    border      : "1px solid rgba(255,255,255,0.12)",
    borderRadius: "10px",
    padding     : "11px 14px",
    fontSize    : "14px",
    color       : "#FFFFFF",
    outline     : "none",
    fontFamily  : "'Segoe UI', sans-serif",
    width       : "100%",
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
  },
  loginRow: {
    marginTop: "18px", fontSize: "14px",
    color: "rgba(255,255,255,0.4)", fontFamily: "'Segoe UI', sans-serif",
  },
  loginLink: { color: "#00C2CC", textDecoration: "none", fontWeight: 500 },
  footer: {
    marginTop: "24px", fontSize: "11px",
    color: "rgba(255,255,255,0.2)", fontFamily: "'Segoe UI', sans-serif",
  },
};
