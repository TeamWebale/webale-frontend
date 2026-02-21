/**
 * AcceptInvite.jsx
 * Destination: src/pages/AcceptInvite.jsx
 *
 * - Does NOT use useAuth() directly (avoids AuthProvider crash on public route)
 * - Validates token via GET /api/invitations/:token/validate
 * - If not logged in: saves token to localStorage.pendingInvite, redirects to login/register
 * - If logged in: shows Accept & Join / Decline buttons
 * - Accept calls POST /api/invitations/:token/accept with JWT
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import WebaleLogo from "../components/WebaleLogo";

const API = "https://webale-api.onrender.com/api";

export default function AcceptInvite() {
  const { token }  = useParams();
  const navigate   = useNavigate();

  const [invite,  setInvite]  = useState(null);
  const [status,  setStatus]  = useState("loading"); // loading | valid | invalid | accepted | declined
  const [error,   setError]   = useState("");
  const [working, setWorking] = useState(false);

  // Check if user is already logged in
  const authToken  = localStorage.getItem("token");
  const isLoggedIn = !!authToken;

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const res = await axios.get(`${API}/invitations/${token}/validate`);
      setInvite(res.data.data || res.data);
      setStatus("valid");
    } catch (err) {
      setStatus("invalid");
      setError(err.response?.data?.message || "This invitation link is invalid or has expired.");
    }
  };

  const handleSignIn = () => {
    localStorage.setItem("pendingInvite", token);
    navigate("/login");
  };

  const handleRegister = () => {
    localStorage.setItem("pendingInvite", token);
    navigate("/register");
  };

  const handleAccept = async () => {
    setWorking(true); setError("");
    try {
      const res = await axios.post(
        `${API}/invitations/${token}/accept`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      localStorage.removeItem("pendingInvite");
      setStatus("accepted");
      const groupId = res.data?.data?.group_id || res.data?.groupId;
      if (groupId) setTimeout(() => navigate(`/groups/${groupId}`), 1500);
      else         setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Could not accept invitation.");
      setWorking(false);
    }
  };

  const handleDecline = () => {
    localStorage.removeItem("pendingInvite");
    setStatus("declined");
    setTimeout(() => navigate(isLoggedIn ? "/dashboard" : "/login"), 1500);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brand}>
          <WebaleLogo variant="compact" size="md" theme="dark" />
        </div>

        {/* ── Loading ── */}
        {status === "loading" && (
          <p style={styles.msg}>Validating invitation…</p>
        )}

        {/* ── Invalid ── */}
        {status === "invalid" && (
          <div style={styles.center}>
            <div style={styles.iconBad}>✕</div>
            <h2 style={styles.title}>Invalid Invitation</h2>
            <p style={styles.sub}>{error}</p>
            <Link to="/login" style={styles.btn}>Go to Sign In</Link>
          </div>
        )}

        {/* ── Valid ── */}
        {status === "valid" && invite && (
          <div style={styles.center}>
            <div style={styles.iconGood}>✉</div>
            <h2 style={styles.title}>You're Invited!</h2>
            <p style={styles.sub}>
              You've been invited to join{" "}
              <strong style={{ color: "#00C2CC" }}>
                {invite.group_name || invite.groupName || "a group"}
              </strong>
              {invite.invited_by_name || invite.invitedByName
                ? ` by ${invite.invited_by_name || invite.invitedByName}`
                : ""}.
            </p>

            {error && <div style={styles.error}>{error}</div>}

            {isLoggedIn ? (
              <div style={styles.btnRow}>
                <button onClick={handleAccept} disabled={working} style={styles.acceptBtn}>
                  {working ? "Joining…" : "✓ Accept & Join"}
                </button>
                <button onClick={handleDecline} disabled={working} style={styles.declineBtn}>
                  Decline
                </button>
              </div>
            ) : (
              <div style={styles.btnCol}>
                <p style={styles.loginNote}>Sign in to accept this invitation:</p>
                <button onClick={handleSignIn}   style={styles.acceptBtn}>Sign In to Accept</button>
                <button onClick={handleRegister} style={styles.declineBtn}>Create Account & Join</button>
              </div>
            )}
          </div>
        )}

        {/* ── Accepted ── */}
        {status === "accepted" && (
          <div style={styles.center}>
            <div style={styles.iconGood}>✓</div>
            <h2 style={styles.title}>You've Joined!</h2>
            <p style={styles.sub}>Taking you to the group…</p>
          </div>
        )}

        {/* ── Declined ── */}
        {status === "declined" && (
          <div style={styles.center}>
            <h2 style={styles.title}>Invitation Declined</h2>
            <p style={styles.sub}>Redirecting…</p>
          </div>
        )}

        <p style={styles.footer}>© 2026 Webale · webale.net</p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#0D1B2E", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" },
  card: { background: "#0D1B2E", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "44px 40px 32px", width: "100%", maxWidth: "420px", display: "flex", flexDirection: "column", alignItems: "center", boxShadow: "0 8px 48px rgba(0,0,0,0.4)" },
  brand: { marginBottom: "24px" },
  center: { display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "100%" },
  iconGood: { width: "56px", height: "56px", borderRadius: "50%", background: "rgba(0,194,204,0.15)", border: "2px solid #00C2CC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", color: "#00C2CC" },
  iconBad:  { width: "56px", height: "56px", borderRadius: "50%", background: "rgba(220,53,69,0.15)", border: "2px solid rgba(220,53,69,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", color: "#ff8a8a" },
  title: { fontSize: "20px", fontWeight: 700, color: "#FFFFFF", textAlign: "center", fontFamily: "'Segoe UI', sans-serif" },
  sub:   { fontSize: "14px", color: "rgba(255,255,255,0.5)", textAlign: "center", lineHeight: 1.6, fontFamily: "'Segoe UI', sans-serif" },
  msg:   { fontSize: "14px", color: "rgba(255,255,255,0.4)", fontFamily: "'Segoe UI', sans-serif" },
  error: { width: "100%", background: "rgba(220,53,69,0.15)", border: "1px solid rgba(220,53,69,0.4)", borderRadius: "8px", padding: "10px 14px", color: "#ff8a8a", fontSize: "13px", fontFamily: "'Segoe UI', sans-serif" },
  btnRow: { display: "flex", gap: "12px", width: "100%", marginTop: "8px" },
  btnCol: { display: "flex", flexDirection: "column", gap: "10px", width: "100%", marginTop: "8px" },
  loginNote: { fontSize: "13px", color: "rgba(255,255,255,0.4)", fontFamily: "'Segoe UI', sans-serif", alignSelf: "flex-start" },
  acceptBtn:  { flex: 1, background: "linear-gradient(135deg,#00C2CC,#4A7FC1)", color: "#fff", border: "none", borderRadius: "10px", padding: "13px", fontSize: "15px", fontWeight: 600, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif" },
  declineBtn: { flex: 1, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "13px", fontSize: "15px", cursor: "pointer", fontFamily: "'Segoe UI', sans-serif" },
  btn: { marginTop: "8px", background: "linear-gradient(135deg,#00C2CC,#4A7FC1)", color: "#fff", border: "none", borderRadius: "10px", padding: "13px 28px", fontSize: "15px", fontWeight: 600, cursor: "pointer", textDecoration: "none", fontFamily: "'Segoe UI', sans-serif" },
  footer: { marginTop: "32px", fontSize: "11px", color: "rgba(255,255,255,0.2)", fontFamily: "'Segoe UI', sans-serif" },
};
