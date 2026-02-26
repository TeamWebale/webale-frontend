/**
 * MainLayout.jsx — src/components/MainLayout.jsx
 *
 * Structure:
 *   [Navbar]
 *   [Left Sidebar] | [Profile Banner + Main Content] | [Right Sidebar]
 *
 * Profile banner sits INSIDE the main column, above the Outlet content.
 * Pages inject right sidebar via: useRightSidebar().setRightSidebar(<JSX/>)
 */
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";
import { groupAPI } from "../services/api";

// ── Right Sidebar Context ──────────────────────────────────────────
export const RightSidebarContext = createContext({ setRightSidebar: () => {} });
export function useRightSidebar() { return useContext(RightSidebarContext); }

// ── Flag emoji map ─────────────────────────────────────────────────
const FLAG = {
  // Full country names
  "Afghanistan":"🇦🇫","Albania":"🇦🇱","Algeria":"🇩🇿","Angola":"🇦🇴",
  "Argentina":"🇦🇷","Armenia":"🇦🇲","Australia":"🇦🇺","Austria":"🇦🇹",
  "Azerbaijan":"🇦🇿","Bahrain":"🇧🇭","Bangladesh":"🇧🇩","Belarus":"🇧🇾",
  "Belgium":"🇧🇪","Benin":"🇧🇯","Bolivia":"🇧🇴","Bosnia and Herzegovina":"🇧🇦",
  "Botswana":"🇧🇼","Brazil":"🇧🇷","Bulgaria":"🇧🇬","Burkina Faso":"🇧🇫",
  "Burundi":"🇧🇮","Cambodia":"🇰🇭","Cameroon":"🇨🇲","Canada":"🇨🇦",
  "Chad":"🇹🇩","Chile":"🇨🇱","China":"🇨🇳","Colombia":"🇨🇴",
  "Congo":"🇨🇬","Costa Rica":"🇨🇷","Croatia":"🇭🇷","Cuba":"🇨🇺",
  "Cyprus":"🇨🇾","Czech Republic":"🇨🇿","Denmark":"🇩🇰",
  "Dominican Republic":"🇩🇴","DR Congo":"🇨🇩","Ecuador":"🇪🇨",
  "Egypt":"🇪🇬","El Salvador":"🇸🇻","Estonia":"🇪🇪","Ethiopia":"🇪🇹",
  "Finland":"🇫🇮","France":"🇫🇷","Gabon":"🇬🇦","Georgia":"🇬🇪",
  "Germany":"🇩🇪","Ghana":"🇬🇭","Greece":"🇬🇷","Guatemala":"🇬🇹",
  "Guinea":"🇬🇳","Haiti":"🇭🇹","Honduras":"🇭🇳","Hungary":"🇭🇺",
  "India":"🇮🇳","Indonesia":"🇮🇩","Iran":"🇮🇷","Iraq":"🇮🇶",
  "Ireland":"🇮🇪","Israel":"🇮🇱","Italy":"🇮🇹","Ivory Coast":"🇨🇮",
  "Jamaica":"🇯🇲","Japan":"🇯🇵","Jordan":"🇯🇴","Kazakhstan":"🇰🇿",
  "Kenya":"🇰🇪","Kuwait":"🇰🇼","Laos":"🇱🇦","Latvia":"🇱🇻",
  "Lebanon":"🇱🇧","Libya":"🇱🇾","Lithuania":"🇱🇹","Luxembourg":"🇱🇺",
  "Madagascar":"🇲🇬","Malawi":"🇲🇼","Malaysia":"🇲🇾","Mali":"🇲🇱",
  "Malta":"🇲🇹","Mauritania":"🇲🇷","Mauritius":"🇲🇺","Mexico":"🇲🇽",
  "Moldova":"🇲🇩","Mongolia":"🇲🇳","Montenegro":"🇲🇪","Morocco":"🇲🇦",
  "Mozambique":"🇲🇿","Myanmar":"🇲🇲","Namibia":"🇳🇦","Nepal":"🇳🇵",
  "Netherlands":"🇳🇱","New Zealand":"🇳🇿","Nicaragua":"🇳🇮","Niger":"🇳🇪",
  "Nigeria":"🇳🇬","North Korea":"🇰🇵","North Macedonia":"🇲🇰","Norway":"🇳🇴",
  "Oman":"🇴🇲","Pakistan":"🇵🇰","Palestine":"🇵🇸","Panama":"🇵🇦",
  "Papua New Guinea":"🇵🇬","Paraguay":"🇵🇾","Peru":"🇵🇪","Philippines":"🇵🇭",
  "Poland":"🇵🇱","Portugal":"🇵🇹","Qatar":"🇶🇦","Romania":"🇷🇴",
  "Russia":"🇷🇺","Rwanda":"🇷🇼","Saudi Arabia":"🇸🇦","Senegal":"🇸🇳",
  "Serbia":"🇷🇸","Sierra Leone":"🇸🇱","Singapore":"🇸🇬","Slovakia":"🇸🇰",
  "Slovenia":"🇸🇮","Somalia":"🇸🇴","South Africa":"🇿🇦","South Korea":"🇰🇷",
  "South Sudan":"🇸🇸","Spain":"🇪🇸","Sri Lanka":"🇱🇰","Sudan":"🇸🇩",
  "Sweden":"🇸🇪","Switzerland":"🇨🇭","Syria":"🇸🇾","Taiwan":"🇹🇼",
  "Tajikistan":"🇹🇯","Tanzania":"🇹🇿","Thailand":"🇹🇭","Togo":"🇹🇬",
  "Trinidad and Tobago":"🇹🇹","Tunisia":"🇹🇳","Turkey":"🇹🇷",
  "Turkmenistan":"🇹🇲","Uganda":"🇺🇬","Ukraine":"🇺🇦",
  "United Arab Emirates":"🇦🇪","United Kingdom":"🇬🇧","United States":"🇺🇸",
  "Uruguay":"🇺🇾","Uzbekistan":"🇺🇿","Venezuela":"🇻🇪","Vietnam":"🇻🇳",
  "Yemen":"🇾🇪","Zambia":"🇿🇲","Zimbabwe":"🇿🇼",
  // ISO 2-letter codes (for users stored with country codes)
  "AF":"🇦🇫","AL":"🇦🇱","DZ":"🇩🇿","AO":"🇦🇴","AR":"🇦🇷","AM":"🇦🇲",
  "AU":"🇦🇺","AT":"🇦🇹","AZ":"🇦🇿","BH":"🇧🇭","BD":"🇧🇩","BY":"🇧🇾",
  "BE":"🇧🇪","BJ":"🇧🇯","BO":"🇧🇴","BA":"🇧🇦","BW":"🇧🇼","BR":"🇧🇷",
  "BG":"🇧🇬","BF":"🇧🇫","BI":"🇧🇮","KH":"🇰🇭","CM":"🇨🇲","CA":"🇨🇦",
  "TD":"🇹🇩","CL":"🇨🇱","CN":"🇨🇳","CO":"🇨🇴","CG":"🇨🇬","CR":"🇨🇷",
  "HR":"🇭🇷","CU":"🇨🇺","CY":"🇨🇾","CZ":"🇨🇿","DK":"🇩🇰","DO":"🇩🇴",
  "CD":"🇨🇩","EC":"🇪🇨","EG":"🇪🇬","SV":"🇸🇻","EE":"🇪🇪","ET":"🇪🇹",
  "FI":"🇫🇮","FR":"🇫🇷","GA":"🇬🇦","GE":"🇬🇪","DE":"🇩🇪","GH":"🇬🇭",
  "GR":"🇬🇷","GT":"🇬🇹","GN":"🇬🇳","HT":"🇭🇹","HN":"🇭🇳","HU":"🇭🇺",
  "IN":"🇮🇳","ID":"🇮🇩","IR":"🇮🇷","IQ":"🇮🇶","IE":"🇮🇪","IL":"🇮🇱",
  "IT":"🇮🇹","CI":"🇨🇮","JM":"🇯🇲","JP":"🇯🇵","JO":"🇯🇴","KZ":"🇰🇿",
  "KE":"🇰🇪","KW":"🇰🇼","LA":"🇱🇦","LV":"🇱🇻","LB":"🇱🇧","LY":"🇱🇾",
  "LT":"🇱🇹","LU":"🇱🇺","MG":"🇲🇬","MW":"🇲🇼","MY":"🇲🇾","ML":"🇲🇱",
  "MT":"🇲🇹","MR":"🇲🇷","MU":"🇲🇺","MX":"🇲🇽","MD":"🇲🇩","MN":"🇲🇳",
  "ME":"🇲🇪","MA":"🇲🇦","MZ":"🇲🇿","MM":"🇲🇲","NA":"🇳🇦","NP":"🇳🇵",
  "NL":"🇳🇱","NZ":"🇳🇿","NI":"🇳🇮","NE":"🇳🇪","NG":"🇳🇬","KP":"🇰🇵",
  "MK":"🇲🇰","NO":"🇳🇴","OM":"🇴🇲","PK":"🇵🇰","PS":"🇵🇸","PA":"🇵🇦",
  "PG":"🇵🇬","PY":"🇵🇾","PE":"🇵🇪","PH":"🇵🇭","PL":"🇵🇱","PT":"🇵🇹",
  "QA":"🇶🇦","RO":"🇷🇴","RU":"🇷🇺","RW":"🇷🇼","SA":"🇸🇦","SN":"🇸🇳",
  "RS":"🇷🇸","SL":"🇸🇱","SG":"🇸🇬","SK":"🇸🇰","SI":"🇸🇮","SO":"🇸🇴",
  "ZA":"🇿🇦","KR":"🇰🇷","SS":"🇸🇸","ES":"🇪🇸","LK":"🇱🇰","SD":"🇸🇩",
  "SE":"🇸🇪","CH":"🇨🇭","SY":"🇸🇾","TW":"🇹🇼","TJ":"🇹🇯","TZ":"🇹🇿",
  "TH":"🇹🇭","TG":"🇹🇬","TT":"🇹🇹","TN":"🇹🇳","TR":"🇹🇷","TM":"🇹🇲",
  "UG":"🇺🇬","UA":"🇺🇦","AE":"🇦🇪","GB":"🇬🇧","US":"🇺🇸","UY":"🇺🇾",
  "UZ":"🇺🇿","VE":"🇻🇪","VN":"🇻🇳","YE":"🇾🇪","ZM":"🇿🇲","ZW":"🇿🇼",
};
function getFlag(country) {
  if (!country) return "";
  // Direct match (full name or ISO code)
  if (FLAG[country]) return FLAG[country];
  // Strip brackets e.g. [UG] -> UG
  const stripped = country.replace(/^\[|\]$/g, "");
  if (FLAG[stripped]) return FLAG[stripped];
  // Try uppercase 2-letter
  const upper = country.toUpperCase().replace(/^\[|\]$/g, "");
  return FLAG[upper] || "";
}

function getAvatar(user) {
  if (user?.avatar_type === "emoji" && user?.avatar_url) return user.avatar_url;
  if (user?.avatarType  === "emoji" && user?.avatarUrl)  return user.avatarUrl;
  return (user?.first_name?.[0] || user?.firstName?.[0] || "") +
         (user?.last_name?.[0]  || user?.lastName?.[0]  || "");
}

// ── Left Sidebar ───────────────────────────────────────────────────
function LeftSidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [stats, setStats] = useState({ total: 0, admin: 0, member: 0 });

  useEffect(() => {
    groupAPI.getAll().then(res => {
      const groups = res.data?.data?.groups || res.data?.groups || res.data || [];
      const arr    = Array.isArray(groups) ? groups : [];
      const admin  = arr.filter(g => g.user_role === "admin" || g.role === "admin").length;
      setStats({ total: arr.length, admin, member: arr.length - admin });
    }).catch(() => {});
  }, []);

  const handleLogout = () => {
    if (logout) logout();
    else { localStorage.removeItem("token"); localStorage.removeItem("user"); }
    navigate("/login");
  };

  return (
    <aside style={ls.wrap}>
      <nav style={{ marginBottom: "8px" }}>
        {[
          ["/dashboard",    "📊", "Dashboard",   "#e0e7ff", "#4c51bf"],
          ["/create-group", "🚀", "Start Fundraising", "#d1fae5", "#047857"],
          ["/profile",      "👤", "Profile",      "#fce7f3", "#be185d"],
        ].map(([to, icon, label, bg, color]) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display:"flex", alignItems:"center", gap:"10px",
            padding:"11px 14px", borderRadius:"10px", textDecoration:"none",
            fontSize:"14px", fontWeight:600, marginBottom:"6px",
            background: isActive
              ? "linear-gradient(135deg,#1B2D4F,#4A7FC1)"
              : `linear-gradient(135deg,${bg},${bg})`,
            color: isActive ? "#fff" : color,
            transition:"all 0.15s",
          })}>
            <span>{icon}</span>{label}
          </NavLink>
        ))}
      </nav>

      <p style={ls.statsLabel}>Quick Stats</p>
      {[
        ["Total Groups",  stats.total,  "#667eea","#764ba2"],
        ["Admin Groups",  stats.admin,  "#38b2ac","#319795"],
        ["Member Groups", stats.member, "#48bb78","#38a169"],
      ].map(([label, val, c1, c2]) => (
        <div key={label} style={{
          ...ls.statCard,
          background:`linear-gradient(135deg,${c1},${c2})`,
          marginBottom:"6px",
        }}>
          <span style={{fontSize:"12px",fontWeight:600}}>{label}</span>
          <span style={{fontSize:"20px",fontWeight:700}}>{val}</span>
        </div>
      ))}

      <div style={{ flex:1 }} />
      <button onClick={handleLogout} style={ls.logout}>🚪 Logout</button>
    </aside>
  );
}

const ls = {
  wrap:{
    width:"220px", background:"white", borderRight:"1px solid #e2e8f0",
    padding:"16px 14px", display:"flex", flexDirection:"column",
    flexShrink:0, overflowY:"auto",
  },
  statsLabel:{
    fontSize:"10px", fontWeight:700, color:"#a0aec0", letterSpacing:"1px",
    textTransform:"uppercase", margin:"16px 0 8px",
  },
  statCard:{
    display:"flex", alignItems:"center", justifyContent:"space-between",
    padding:"10px 14px", borderRadius:"10px", color:"white",
  },
  logout:{
    display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
    width:"100%", marginTop:"16px", padding:"11px",
    background:"linear-gradient(135deg,#fed7d7,#feb2b2)",
    color:"#c53030", border:"none", borderRadius:"10px",
    fontSize:"13px", fontWeight:600, cursor:"pointer",
  },
};

// ── Main Layout ────────────────────────────────────────────────────
export default function MainLayout() {
  const { user } = useAuth();
  const [rightSidebar, setRightSidebar] = useState(null);

  const avatar      = getAvatar(user);
  const flag        = getFlag(user?.country);
  const firstName   = user?.first_name || user?.firstName || "";
  const lastName    = user?.last_name  || user?.lastName  || "";
  const fullName    = [firstName, lastName].filter(Boolean).join(" ");
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US",{month:"long",year:"numeric"})
    : "";
  const isEmoji = avatar && avatar.length <= 2 && /\p{Emoji}/u.test(avatar);

  return (
    <RightSidebarContext.Provider value={{ setRightSidebar }}>
      <div style={ml.shell}>

        {/* Top Navbar */}
        <Navbar />

        {/* Three-column body — profile banner is INSIDE main column */}
        <div style={ml.body}>

          {/* Left Sidebar — no logo, no profile */}
          <div className="sidebar-left">
            <LeftSidebar />
          </div>

          {/* Main column: profile banner + page content */}
          <div style={ml.mainCol}>

            {/* Profile Banner */}
            <div style={ml.banner}>
              <div style={ml.avatarRing}>
                <div style={ml.avatar}>
                  {isEmoji
                    ? <span style={{fontSize:26}}>{avatar}</span>
                    : <span style={ml.initials}>{avatar||"?"}</span>}
                </div>
              </div>
              <div>
                <div style={ml.bannerName}>
                  {fullName}
                  {flag && <span style={ml.flag}>{flag}</span>}
                </div>
                {memberSince && <div style={ml.meta}>🗓 Member since {memberSince}</div>}
              </div>
            </div>

            {/* Page content */}
            <main style={ml.main}>
              <Outlet />
            </main>

          </div>

          {/* Right Sidebar — injected by pages via useRightSidebar() */}
          {rightSidebar && (
            <div style={ml.rightSidebar} className="sidebar-right">
              {rightSidebar}
            </div>
          )}

        </div>
      </div>

      <style>{`
        .sidebar-left  { display: flex; flex-direction: column; }
        .sidebar-right { display: flex; flex-direction: column; }
        @media (max-width: 900px) {
          .sidebar-left  { display: none !important; }
          .sidebar-right { display: none !important; }
        }
      `}</style>
    </RightSidebarContext.Provider>
  );
}

const ml = {
  shell:{ minHeight:"100vh", background:"#F0F4F9", display:"flex", flexDirection:"column" },
  body:{ display:"flex", flex:1, minHeight:0 },
  mainCol:{ flex:1, display:"flex", flexDirection:"column", minWidth:0 },
  banner:{
    background:"linear-gradient(135deg,#1B2D4F,#4A7FC1)",
    padding:"14px 24px", display:"flex", alignItems:"center", gap:"14px",
  },
  avatarRing:{
    width:"48px", height:"48px", borderRadius:"50%",
    border:"2px solid rgba(255,255,255,0.4)", padding:"2px", flexShrink:0,
  },
  avatar:{
    width:"100%", height:"100%", borderRadius:"50%",
    background:"rgba(255,255,255,0.15)", display:"flex",
    alignItems:"center", justifyContent:"center", overflow:"hidden",
  },
  initials:{ fontSize:"17px", fontWeight:700, color:"#FFFFFF", fontFamily:"'Segoe UI',sans-serif" },
  bannerName:{
    fontSize:"17px", fontWeight:700, color:"#FFFFFF",
    fontFamily:"'Segoe UI',sans-serif", display:"flex", alignItems:"center", gap:"8px",
  },
  flag:{ fontSize:"22px", lineHeight:1 },
  meta:{ fontSize:"12px", color:"rgba(255,255,255,0.7)", fontFamily:"'Segoe UI',sans-serif", marginTop:"2px" },
  main:{ flex:1, padding:"20px", overflowY:"auto" },
  rightSidebar:{
    width:"250px", padding:"16px", overflowY:"auto",
    borderLeft:"1px solid #e2e8f0", background:"#F8FAFC", flexShrink:0,
  },
};
