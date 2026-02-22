/**
 * Login.jsx — Destination: src/pages/Login.jsx
 * Landing page redesign with approved Webale logo
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
      setError(err.message || "Invalid email or password.");
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.brand}><WebaleLogo variant="full" size="lg" theme="dark" /></div>
        <p style={s.welcome}>Welcome back</p>
        {error && (
          <div style={s.error}>
            <span>{error}</span>
            <button onClick={() => setError("")} style={s.errClose}>✕</button>
          </div>
        )}
        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com" style={s.input}/>
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••" style={s.input}/>
          </div>
          <div style={{textAlign:"right"}}>
            <Link to="/forgot-password" style={s.forgot}>Forgot password?</Link>
          </div>
          <button type="submit" disabled={loading} style={s.btn}>{loading?"Signing in…":"Sign In"}</button>
        </form>
        <p style={s.reg}>Don't have an account? <Link to="/register" style={s.regLink}>Create one</Link></p>
        <p style={s.footer}>© 2026 Webale · webale.net</p>
      </div>
    </div>
  );
}
const s = {
  page:{minHeight:"100vh",background:"#0D1B2E",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px 16px"},
  card:{background:"#0D1B2E",borderRadius:"20px",border:"1px solid rgba(255,255,255,0.08)",padding:"44px 40px 32px",width:"100%",maxWidth:"400px",display:"flex",flexDirection:"column",alignItems:"center",boxShadow:"0 8px 48px rgba(0,0,0,0.4)"},
  brand:{marginBottom:"24px"},
  welcome:{fontSize:"14px",color:"rgba(255,255,255,0.45)",marginBottom:"24px"},
  error:{width:"100%",background:"rgba(220,53,69,0.15)",border:"1px solid rgba(220,53,69,0.4)",borderRadius:"8px",padding:"10px 14px",color:"#ff8a8a",fontSize:"13px",marginBottom:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"8px"},
  errClose:{background:"transparent",border:"none",color:"#ff8a8a",cursor:"pointer",fontSize:"14px",padding:"0"},
  form:{width:"100%",display:"flex",flexDirection:"column",gap:"16px"},
  field:{display:"flex",flexDirection:"column",gap:"6px"},
  label:{fontSize:"11px",fontWeight:500,color:"rgba(255,255,255,0.55)",letterSpacing:"0.5px",textTransform:"uppercase",fontFamily:"'Segoe UI',sans-serif"},
  input:{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"10px",padding:"11px 14px",fontSize:"15px",color:"#FFFFFF",outline:"none",fontFamily:"'Segoe UI',sans-serif"},
  forgot:{fontSize:"13px",color:"#00C2CC",textDecoration:"none"},
  btn:{marginTop:"4px",background:"linear-gradient(135deg,#00C2CC,#4A7FC1)",color:"#FFF",border:"none",borderRadius:"10px",padding:"13px",fontSize:"15px",fontWeight:600,cursor:"pointer",fontFamily:"'Segoe UI',sans-serif"},
  reg:{marginTop:"20px",fontSize:"14px",color:"rgba(255,255,255,0.4)",fontFamily:"'Segoe UI',sans-serif"},
  regLink:{color:"#00C2CC",textDecoration:"none",fontWeight:500},
  footer:{marginTop:"28px",fontSize:"11px",color:"rgba(255,255,255,0.2)",fontFamily:"'Segoe UI',sans-serif"},
};
