/**
 * Navbar.jsx — src/components/Navbar.jsx
 *
 * Desktop: Logo block (220px = left sidebar width) | nav links (center) | controls (250px = right sidebar width)
 * Mobile:  W icon | "Webale!" | spacer | bell | dark hamburger button
 */
import { useState, useContext, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import WebaleLogo from "./WebaleLogo";
import AuthContext from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

const LANGUAGES = [
  { code:"en", label:"🇬🇧 EN" },
  { code:"fr", label:"🇫🇷 FR" },
  { code:"sw", label:"🇰🇪 SW" },
  { code:"lg", label:"🇺🇬 LG" },
];

export default function Navbar() {
  const auth     = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [lang,     setLang]     = useState("en");
  const [langOpen, setLangOpen] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);
  const langRef = useRef(null);
  const mobileLangRef = useRef(null);

  // Close desktop language dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
      if (mobileLangRef.current && !mobileLangRef.current.contains(e.target)) setMobileLangOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  const handleLogout = () => {
    if (auth?.logout) auth.logout();
    else { localStorage.removeItem("token"); localStorage.removeItem("user"); }
    navigate("/login");
    setMenuOpen(false);
  };

  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <nav style={s.nav}>

      {/* ══ DESKTOP ══════════════════════════════════════════════ */}
      <div style={s.desktopBar} className="nav-desktop">

        {/* Logo block — same width as left sidebar (220px) */}
        <div style={s.logoBlock}>
          <Link to="/dashboard" style={{ textDecoration:"none" }}>
            <WebaleLogo variant="compact" size="sm" theme="light" />
          </Link>
        </div>

        {/* Center spacer */}
        <div style={{ flex:1 }} />

        {/* Right controls — same width as right sidebar (250px) */}
        <div style={s.rightBlock}>
          {/* Language */}
          <div ref={langRef} style={{ position:"relative" }}>
            <button onClick={() => setLangOpen(o => !o)} style={s.pill}>
              {currentLang.label} ▾
            </button>
            {langOpen && (
              <div style={s.langDrop}>
                {LANGUAGES.map(l => (
                  <button key={l.code}
                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                    style={{ ...s.langItem, fontWeight: l.code === lang ? 700 : 400,
                             background: l.code === lang ? "#f0f4ff" : "white" }}>
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark mode */}
          <button onClick={() => setDarkMode(d => !d)} style={s.pill} title="Toggle theme">
            {darkMode ? "☀️" : "🌙"}
          </button>

          <NotificationBell />

          <button onClick={handleLogout} style={s.logoutBtn}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* ══ MOBILE ═══════════════════════════════════════════════ */}
      <div style={s.mobileBar} className="nav-mobile">
        <Link to="/dashboard" style={{ textDecoration:"none", display:"flex", alignItems:"center" }}>
          <WebaleLogo variant="icon" size={32} theme="light" />
        </Link>
        <span style={s.mobileTitle}>Webale!</span>
        <div style={{ flex:1 }} />
        <NotificationBell />
        <button
          onClick={() => setMenuOpen(o => !o)}
          style={s.hamburger}
          aria-label="Menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={s.mobileMenu} className="nav-mobile">
          {[
            ["/dashboard",    "📊 Dashboard"],
            ["/create-group", "🚀 Start Fundraising"],
            ["/profile",      "🧑‍💼 Profile"],
            ["/terms",        "📜 Terms & Conditions"],
          ].map(([to, label]) => (
            <Link key={to} to={to} style={s.mobileLink}
              onClick={() => setMenuOpen(false)}>
              {label}
            </Link>
          ))}
          {/* Language dropdown — closed by default */}
          <div ref={mobileLangRef} style={{ position:"relative" }}>
            <button onClick={() => setMobileLangOpen(o => !o)} style={s.mobileLink2}>
              🌐 Language: {currentLang.label} {mobileLangOpen ? "▲" : "▼"}
            </button>
            {mobileLangOpen && (
              <div style={{ display:"flex", gap:"8px", padding:"8px 0 12px", flexWrap:"wrap" }}>
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => { setLang(l.code); setMobileLangOpen(false); }}
                    style={{
                      padding:"8px 14px", borderRadius:"8px",
                      border:"none", fontSize:"13px", fontWeight:700,
                      background: l.code === lang ? "linear-gradient(135deg,#667eea,#764ba2)" : "linear-gradient(135deg,#1B2D4F,#4A7FC1)",
                      color: "#fff",
                      cursor:"pointer", boxShadow:"0 2px 6px rgba(27,45,79,0.2)",
                    }}>
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setDarkMode(d => !d)} style={s.mobileAction}>
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
          <button onClick={handleLogout} style={s.mobileLogout}>
            🚪 Logout
          </button>
        </div>
      )}

      <style>{`
        .nav-desktop { display: flex !important; }
        .nav-mobile  { display: none !important; }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile  { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}

const s = {
  nav:{
    background:"#FFFFFF", borderBottom:"1px solid #E8EEF5",
    position:"sticky", top:0, zIndex:200,
    boxShadow:"0 1px 8px rgba(27,45,79,0.08)",
  },
  // Desktop
  desktopBar:{
    display:"flex", alignItems:"center", height:"58px",
    paddingLeft:"14px", paddingRight:"16px",
  },
  logoBlock:{
    width:"220px", flexShrink:0,
    display:"flex", alignItems:"center",
  },
  links:{
    flex:1, display:"flex", justifyContent:"center",
    alignItems:"center", gap:"28px",
  },
  link:{
    fontSize:"14px", textDecoration:"none",
    fontFamily:"'Segoe UI',sans-serif",
    paddingBottom:"4px", transition:"all 0.15s",
    whiteSpace:"nowrap",
  },
  rightBlock:{
    width:"250px", flexShrink:0,
    display:"flex", alignItems:"center",
    justifyContent:"flex-end", gap:"8px",
  },
  pill:{
    background:"linear-gradient(135deg,#667eea,#764ba2)", border:"none", borderRadius:"8px",
    padding:"6px 12px", fontSize:"12px", fontWeight:600,
    color:"#fff", cursor:"pointer", whiteSpace:"nowrap",
    boxShadow:"0 2px 8px rgba(102,126,234,0.3)",
  },
  langDrop:{
    position:"absolute", top:"calc(100% + 6px)", right:0,
    background:"white", borderRadius:"10px", minWidth:"110px",
    boxShadow:"0 8px 24px rgba(0,0,0,0.12)", zIndex:300, overflow:"hidden",
    border:"1px solid #e2e8f0",
  },
  langItem:{
    display:"block", width:"100%", padding:"9px 14px",
    border:"none", borderBottom:"1px solid #f0f4f9",
    fontSize:"13px", color:"#2d3748", cursor:"pointer", textAlign:"left",
  },
  logoutBtn:{
    background:"linear-gradient(135deg,#e53e3e,#c53030)", border:"none",
    borderRadius:"8px", padding:"6px 14px", fontSize:"13px",
    fontWeight:600, color:"#fff", cursor:"pointer",
    fontFamily:"'Segoe UI',sans-serif", whiteSpace:"nowrap",
    boxShadow:"0 2px 8px rgba(229,62,62,0.3)",
  },
  // Mobile
  mobileBar:{
    height:"58px", display:"flex", alignItems:"center",
    gap:"10px", paddingLeft:"12px", paddingRight:"12px",
    width:"100%",
  },
  mobileTitle:{
    fontSize:"18px", fontWeight:700, color:"#1B2D4F",
    fontFamily:"'Lucida Calligraphy','Palatino Linotype',serif",
    fontStyle:"italic", marginLeft:"4px",
  },
  hamburger:{
    background:"linear-gradient(135deg,#667eea,#764ba2)", border:"none", borderRadius:"8px",
    width:"40px", height:"40px", display:"flex",
    alignItems:"center", justifyContent:"center",
    fontSize:"22px", color:"white", cursor:"pointer",
    flexShrink:0, boxShadow:"0 2px 8px rgba(102,126,234,0.35)",
  },
  mobileMenu:{
    background:"#fff", borderTop:"1px solid #E8EEF5",
    padding:"12px 20px 16px", flexDirection:"column", gap:"0",
  },
  mobileLink:{
    fontSize:"15px", color:"#fff", fontWeight:700,
    textDecoration:"none", padding:"12px 14px",
    display:"block",
    background:"linear-gradient(135deg,#1B2D4F,#4A7FC1)", borderRadius:"10px",
    marginBottom:"6px",
    boxShadow:"0 2px 8px rgba(27,45,79,0.25)",
    letterSpacing:"0.3px",
  },
  mobileLink2:{
    width:"100%", fontSize:"15px", color:"#fff", fontWeight:700,
    textDecoration:"none", padding:"12px 14px", display:"flex",
    justifyContent:"space-between", alignItems:"center",
    background:"linear-gradient(135deg,#38b2ac,#319795)", border:"none",
    borderRadius:"10px", cursor:"pointer",
    fontFamily:"'Segoe UI',sans-serif", textAlign:"left",
    marginBottom:"6px", boxShadow:"0 2px 8px rgba(49,151,149,0.3)",
  },
  mobileAction:{
    width:"100%", textAlign:"left", background:"linear-gradient(135deg,#667eea,#764ba2)",
    border:"none", borderRadius:"8px",
    padding:"11px 14px", fontSize:"14px", color:"#fff",
    fontWeight:600, cursor:"pointer", marginTop:"6px",
  },
  mobileLogout:{
    marginTop:"8px", width:"100%", textAlign:"left",
    background:"linear-gradient(135deg,#e53e3e,#c53030)", border:"none",
    borderRadius:"8px", padding:"11px 14px", fontSize:"14px",
    fontWeight:600, color:"#fff", cursor:"pointer",
    boxShadow:"0 2px 8px rgba(229,62,62,0.25)",
  },
};
