/**
 * Register.jsx — src/pages/Register.jsx
 * Root cause of blank country list: options had color:#ffffff on white background.
 * Fix: explicit dark text + white background on each option.
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import WebaleLogo from "../components/WebaleLogo";
import { authAPI } from "../services/api";

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Angola","Argentina","Armenia","Australia",
  "Austria","Azerbaijan","Bahrain","Bangladesh","Belarus","Belgium","Benin",
  "Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Bulgaria","Burkina Faso",
  "Burundi","Cambodia","Cameroon","Canada","Chad","Chile","China","Colombia",
  "Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark",
  "Dominican Republic","DR Congo","Ecuador","Egypt","El Salvador","Estonia",
  "Ethiopia","Finland","France","Gabon","Georgia","Germany","Ghana","Greece",
  "Guatemala","Guinea","Haiti","Honduras","Hungary","India","Indonesia","Iran",
  "Iraq","Ireland","Israel","Italy","Ivory Coast","Jamaica","Japan","Jordan",
  "Kazakhstan","Kenya","Kuwait","Laos","Latvia","Lebanon","Libya","Lithuania",
  "Luxembourg","Madagascar","Malawi","Malaysia","Mali","Malta","Mauritania",
  "Mauritius","Mexico","Moldova","Mongolia","Montenegro","Morocco","Mozambique",
  "Myanmar","Namibia","Nepal","Netherlands","New Zealand","Nicaragua","Niger",
  "Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palestine",
  "Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal",
  "Qatar","Romania","Russia","Rwanda","Saudi Arabia","Senegal","Serbia",
  "Sierra Leone","Singapore","Slovakia","Slovenia","Somalia","South Africa",
  "South Korea","South Sudan","Spain","Sri Lanka","Sudan","Sweden","Switzerland",
  "Syria","Taiwan","Tajikistan","Tanzania","Thailand","Togo","Trinidad and Tobago",
  "Tunisia","Turkey","Turkmenistan","Uganda","Ukraine","United Arab Emirates",
  "United Kingdom","United States","Uruguay","Uzbekistan","Venezuela","Vietnam",
  "Yemen","Zambia","Zimbabwe",
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName:"", lastName:"", email:"", country:"", password:"", confirmPassword:"",
  });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    if (!form.country) { setError("Please select your country"); return; }
    setLoading(true);
    try {
      await authAPI.register({
        firstName: form.firstName, lastName: form.lastName,
        email: form.email, country: form.country, password: form.password,
      });
      navigate("/login?registered=1");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

          {/* Name row */}
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

          {/* Email */}
          <div style={{ marginBottom:"14px" }}>
            <label style={s.label}>Email</label>
            <input type="email" style={s.input} placeholder="you@example.com"
              required value={form.email} onChange={set("email")} />
          </div>

          {/* Country — KEY FIX: select uses light background + dark text */}
          <div style={{ marginBottom:"14px" }}>
            <label style={s.label}>Country</label>
            <select
              value={form.country}
              onChange={set("country")}
              required
              style={s.select}
            >
              <option value="" disabled>Select your country…</option>
              {COUNTRIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Password */}
          <div style={{ marginBottom:"14px" }}>
            <label style={s.label}>Password</label>
            <input type="password" style={s.input} placeholder="Minimum 8 characters"
              required minLength={8} value={form.password} onChange={set("password")} />
          </div>

          {/* Confirm */}
          <div style={{ marginBottom:"22px" }}>
            <label style={s.label}>Confirm Password</label>
            <input type="password" style={s.input} placeholder="Repeat password"
              required value={form.confirmPassword} onChange={set("confirmPassword")} />
          </div>

          <button type="submit" disabled={loading} style={s.submitBtn}>
            {loading ? "Creating account…" : "🚀 Create Account"}
          </button>
        </form>

        <p style={{ textAlign:"center", marginTop:"16px", fontSize:"13px", color:"rgba(255,255,255,0.5)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color:"#00E5CC", fontWeight:600 }}>Sign in</Link>
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
    display:"block", marginBottom:"6px", fontSize:"12px",
    fontWeight:600, color:"rgba(255,255,255,0.6)",
    textTransform:"uppercase", letterSpacing:"0.5px",
  },
  input:{
    width:"100%", padding:"12px 14px", borderRadius:"10px",
    border:"1px solid rgba(255,255,255,0.15)",
    background:"rgba(255,255,255,0.07)",
    color:"#ffffff", fontSize:"14px", boxSizing:"border-box",
    outline:"none", fontFamily:"'Segoe UI',sans-serif",
  },
  // Select MUST use light bg + dark text — browser renders options with OS styling,
  // and white text on white option background = invisible
  select:{
    width:"100%", padding:"12px 14px", borderRadius:"10px",
    border:"1px solid rgba(255,255,255,0.15)",
    background:"#1e2d40",   // dark but not pitch black
    color:"#ffffff",         // selected value text: white (visible on dark bg)
    fontSize:"14px", boxSizing:"border-box",
    outline:"none", fontFamily:"'Segoe UI',sans-serif",
    cursor:"pointer",
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
