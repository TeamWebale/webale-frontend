/**
 * MainLayout.jsx — Destination: src/components/MainLayout.jsx
 * Wraps all protected routes via React Router Outlet.
 * Top Navbar + profile banner. NO sidebar.
 */
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";

const COUNTRY_CODES = {
  "Uganda":"[UG]","United States":"[US]","United Kingdom":"[GB]",
  "Kenya":"[KE]","Tanzania":"[TZ]","Rwanda":"[RW]","Nigeria":"[NG]",
  "Ghana":"[GH]","South Africa":"[ZA]","Canada":"[CA]","Australia":"[AU]",
  "Germany":"[DE]","France":"[FR]","India":"[IN]","China":"[CN]",
  "Japan":"[JP]","Brazil":"[BR]","Mexico":"[MX]","European Union":"[EU]",
};

function getCountryCode(country) {
  if (!country) return "";
  if (/^\[[A-Z]{2,3}\]$/.test(country)) return country;
  return COUNTRY_CODES[country] || `[${country.slice(0,2).toUpperCase()}]`;
}

function getDisplayAvatar(user) {
  if (user?.avatar_type === "emoji" && user?.avatar_url) return user.avatar_url;
  if (user?.avatarType  === "emoji" && user?.avatarUrl)  return user.avatarUrl;
  const first = user?.first_name || user?.firstName || "";
  const last  = user?.last_name  || user?.lastName  || "";
  return (first[0] || "") + (last[0] || "");
}

export default function MainLayout() {
  const { user } = useAuth();
  const avatar      = getDisplayAvatar(user);
  const countryCode = getCountryCode(user?.country);
  const fullName    = `${user?.first_name||user?.firstName||""} ${user?.last_name||user?.lastName||""}`.trim();
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US",{month:"long",year:"numeric"})
    : "";
  const isEmoji = avatar && avatar.length <= 2 && /\p{Emoji}/u.test(avatar);

  return (
    <div style={s.shell}>
      <Navbar />
      <div style={s.banner}>
        <div style={s.bannerInner}>
          <div style={s.avatarRing}>
            <div style={s.avatar}>
              {isEmoji
                ? <span style={{fontSize:28}}>{avatar}</span>
                : <span style={s.initials}>{avatar||"?"}</span>
              }
            </div>
          </div>
          <div style={s.bannerText}>
            <div style={s.bannerName}>
              {fullName}
              {countryCode && <span style={s.badge}>{countryCode}</span>}
            </div>
            {memberSince && <div style={s.meta}>🗓 Member since {memberSince}</div>}
          </div>
        </div>
      </div>
      <main style={s.main}><Outlet /></main>
    </div>
  );
}
const s = {
  shell:{minHeight:"100vh",background:"#F0F4F9",display:"flex",flexDirection:"column"},
  banner:{background:"linear-gradient(135deg,#1B2D4F,#4A7FC1)",padding:"18px 24px"},
  bannerInner:{maxWidth:"1200px",margin:"0 auto",display:"flex",alignItems:"center",gap:"16px"},
  avatarRing:{width:"52px",height:"52px",borderRadius:"50%",border:"2px solid rgba(255,255,255,0.4)",padding:"2px",flexShrink:0},
  avatar:{width:"100%",height:"100%",borderRadius:"50%",background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"},
  initials:{fontSize:"18px",fontWeight:700,color:"#FFFFFF",fontFamily:"'Segoe UI',sans-serif"},
  bannerText:{display:"flex",flexDirection:"column",gap:"3px"},
  bannerName:{fontSize:"18px",fontWeight:700,color:"#FFFFFF",fontFamily:"'Segoe UI',sans-serif",display:"flex",alignItems:"center",gap:"8px"},
  badge:{fontSize:"12px",fontWeight:500,color:"rgba(255,255,255,0.7)",background:"rgba(255,255,255,0.12)",borderRadius:"4px",padding:"1px 6px",fontFamily:"'Segoe UI',sans-serif"},
  meta:{fontSize:"12px",color:"rgba(255,255,255,0.6)",fontFamily:"'Segoe UI',sans-serif"},
  main:{flex:1,maxWidth:"1200px",width:"100%",margin:"0 auto",padding:"24px 20px"},
};
