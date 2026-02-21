/**
 * Navbar.jsx
 * Destination: src/components/Navbar.jsx
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import WebaleLogo from "./WebaleLogo";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>

        {/* ── Logo ── */}
        <Link to="/dashboard" style={{ textDecoration: "none" }}>
          {/* Desktop: compact  |  Mobile: icon only */}
          <span className="logo-desktop">
            <WebaleLogo variant="compact" size="sm" theme="light" />
          </span>
          <span className="logo-mobile">
            <WebaleLogo variant="icon" size={30} theme="light" />
          </span>
        </Link>

        {/* ── Desktop nav links ── */}
        <div style={styles.links} className="nav-links-desktop">
          <Link to="/dashboard"    style={styles.link}>Dashboard</Link>
          <Link to="/create-group" style={styles.link}>New Group</Link>
          <Link to="/profile"      style={styles.link}>Profile</Link>
        </div>

        {/* ── Right side ── */}
        <div style={styles.right}>
          <NotificationBell />

          {/* Desktop logout */}
          <button
            onClick={handleLogout}
            style={styles.logoutBtn}
            className="nav-logout-desktop"
          >
            🚪 Logout
          </button>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={styles.hamburger}
            className="nav-hamburger"
            aria-label="Menu"
          >
            <span style={styles.bar}></span>
            <span style={styles.bar}></span>
            <span style={styles.bar}></span>
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown ── */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          <Link to="/dashboard"    style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Dashboard</Link>
          <Link to="/create-group" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>New Group</Link>
          <Link to="/profile"      style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Profile</Link>
          <button onClick={handleLogout} style={styles.mobileLogout}>🚪 Logout</button>
        </div>
      )}

      {/* Responsive CSS */}
      <style>{`
        .logo-mobile  { display: none; }
        .logo-desktop { display: inline-flex; }
        .nav-links-desktop { display: flex; }
        .nav-logout-desktop { display: inline-flex; }
        .nav-hamburger { display: none !important; }

        @media (max-width: 640px) {
          .logo-mobile        { display: inline-flex; }
          .logo-desktop       { display: none; }
          .nav-links-desktop  { display: none !important; }
          .nav-logout-desktop { display: none !important; }
          .nav-hamburger      { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}

const styles = {
  nav: {
    background  : "#FFFFFF",
    borderBottom: "1px solid #E8EEF5",
    position    : "sticky",
    top         : 0,
    zIndex      : 100,
    boxShadow   : "0 1px 8px rgba(27,45,79,0.06)",
  },
  inner: {
    maxWidth      : "1200px",
    margin        : "0 auto",
    padding       : "0 20px",
    height        : "58px",
    display       : "flex",
    alignItems    : "center",
    justifyContent: "space-between",
    gap           : "16px",
  },
  links: {
    display   : "flex",
    gap       : "24px",
    alignItems: "center",
  },
  link: {
    fontSize      : "14px",
    color         : "#5A6A7E",
    fontWeight    : 500,
    textDecoration: "none",
    transition    : "color 0.15s",
  },
  right: {
    display   : "flex",
    alignItems: "center",
    gap       : "12px",
  },
  logoutBtn: {
    background  : "transparent",
    border      : "1px solid #D0DCE8",
    borderRadius: "8px",
    padding     : "6px 14px",
    fontSize    : "13px",
    fontWeight  : 500,
    color       : "#5A6A7E",
    cursor      : "pointer",
    fontFamily  : "'Segoe UI', sans-serif",
  },
  hamburger: {
    background    : "transparent",
    border        : "none",
    cursor        : "pointer",
    padding       : "4px",
    display       : "flex",
    flexDirection : "column",
    gap           : "5px",
    alignItems    : "center",
    justifyContent: "center",
  },
  bar: {
    display     : "block",
    width       : "20px",
    height      : "2px",
    background  : "#1B2D4F",
    borderRadius: "2px",
  },
  mobileMenu: {
    background  : "#FFFFFF",
    borderTop   : "1px solid #E8EEF5",
    padding     : "12px 20px 16px",
    display     : "flex",
    flexDirection: "column",
    gap         : "2px",
  },
  mobileLink: {
    fontSize      : "15px",
    color         : "#1B2D4F",
    fontWeight    : 500,
    textDecoration: "none",
    padding       : "10px 0",
    borderBottom  : "1px solid #F0F4F9",
  },
  mobileLogout: {
    marginTop  : "8px",
    background : "transparent",
    border     : "1px solid #D0DCE8",
    borderRadius: "8px",
    padding    : "10px 0",
    fontSize   : "14px",
    fontWeight : 500,
    color      : "#5A6A7E",
    cursor     : "pointer",
    fontFamily : "'Segoe UI', sans-serif",
    textAlign  : "left",
  },
};
