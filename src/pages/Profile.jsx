/**
 * Profile.jsx
 * Destination: src/pages/Profile.jsx
 *
 * - 3 tabs: Profile, Security, Settings
 * - Avatar save persists to database (calls authAPI.updateProfile)
 * - Navigates to dashboard after save
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API = "https://webale-api.onrender.com/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

const EMOJI_AVATARS = ["😊","😎","🦁","🐯","🦊","🐺","🐻","🦝","🦄","🐙","🦋","🌟","🔥","💎","🎯","🚀"];

const COUNTRIES = [
  "Uganda","Kenya","Tanzania","Rwanda","Nigeria","Ghana","South Africa",
  "United Kingdom","United States","Canada","Australia","India","Germany",
  "France","Japan","China","Brazil","Mexico","Other"
];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("profile");

  // ── Profile tab state ──
  const [firstName, setFirstName] = useState(user?.first_name  || user?.firstName  || "");
  const [lastName,  setLastName]  = useState(user?.last_name   || user?.lastName   || "");
  const [country,   setCountry]   = useState(user?.country     || "");
  const [bio,       setBio]       = useState(user?.bio         || "");
  const [phone,     setPhone]     = useState(user?.phone       || "");
  const [saving,    setSaving]    = useState(false);
  const [saveMsg,   setSaveMsg]   = useState("");

  // ── Avatar state ──
  const [selectedEmoji, setSelectedEmoji] = useState(
    user?.avatar_type === "emoji" ? (user?.avatar_url || user?.avatarUrl || "") : ""
  );
  const [avatarSaving, setAvatarSaving] = useState(false);

  // ── Security tab state ──
  const [currentPw,  setCurrentPw]  = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [confirmPw,  setConfirmPw]  = useState("");
  const [pwSaving,   setPwSaving]   = useState(false);
  const [pwMsg,      setPwMsg]      = useState("");

  // ── Settings tab state ──
  const [profilePublic, setProfilePublic] = useState(user?.profile_public ?? true);
  const [settSaving,    setSettSaving]    = useState(false);

  // ── Save profile ──────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setSaving(true); setSaveMsg("");
    try {
      const res = await axios.put(
        `${API}/auth/profile`,
        { first_name: firstName, last_name: lastName, country, bio, phone },
        { headers: authHeaders() }
      );
      const updated = res.data?.data?.user || res.data?.user || {};
      updateUser({ ...updated, first_name: firstName, last_name: lastName, country, bio, phone });
      setSaveMsg("✓ Profile saved!");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      setSaveMsg(err.response?.data?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  // ── Save avatar — persists to DB ──────────────────────────────
  const handleAvatarSave = async () => {
    if (!selectedEmoji) return;
    setAvatarSaving(true);
    try {
      await axios.put(
        `${API}/auth/profile`,
        { avatar_url: selectedEmoji, avatar_type: "emoji" },
        { headers: authHeaders() }
      );
      updateUser({ avatar_url: selectedEmoji, avatarUrl: selectedEmoji, avatar_type: "emoji", avatarType: "emoji" });
      setSaveMsg("✓ Avatar saved!");
    } catch (err) {
      setSaveMsg("Failed to save avatar.");
    } finally {
      setAvatarSaving(false);
    }
  };

  // ── Change password ───────────────────────────────────────────
  const handleChangePassword = async () => {
    setPwMsg(""); setPwSaving(true);
    if (newPw !== confirmPw) { setPwMsg("Passwords do not match."); setPwSaving(false); return; }
    try {
      await axios.put(
        `${API}/auth/change-password`,
        { current_password: currentPw, new_password: newPw },
        { headers: authHeaders() }
      );
      setPwMsg("✓ Password updated!");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err) {
      setPwMsg(err.response?.data?.message || "Failed to update password.");
    } finally {
      setPwSaving(false);
    }
  };

  // ── Save settings ─────────────────────────────────────────────
  const handleSaveSettings = async () => {
    setSettSaving(true);
    try {
      await axios.put(`${API}/auth/profile`, { profile_public: profilePublic }, { headers: authHeaders() });
      updateUser({ profile_public: profilePublic });
    } catch { /* silent */ }
    setSettSaving(false);
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.pageTitle}>My Profile</h1>

      {/* Tabs */}
      <div style={styles.tabs}>
        {["profile","security","settings"].map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setSaveMsg(""); setPwMsg(""); }}
            style={{ ...styles.tabBtn, ...(tab === t ? styles.tabActive : {}) }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.card}>

        {/* ══ PROFILE TAB ══ */}
        {tab === "profile" && (
          <>
            {/* Avatar picker */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Avatar</h3>
              <div style={styles.emojiGrid}>
                {EMOJI_AVATARS.map(e => (
                  <button
                    key={e}
                    onClick={() => setSelectedEmoji(e)}
                    style={{ ...styles.emojiBtn, ...(selectedEmoji === e ? styles.emojiBtnActive : {}) }}
                  >
                    {e}
                  </button>
                ))}
              </div>
              {selectedEmoji && (
                <button
                  onClick={handleAvatarSave}
                  disabled={avatarSaving}
                  style={{ ...styles.btn, marginTop: "12px", maxWidth: "160px" }}
                >
                  {avatarSaving ? "Saving…" : "Save Avatar"}
                </button>
              )}
            </div>

            <div style={styles.divider}/>

            {/* Profile fields */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Personal Info</h3>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>First Name</label>
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} style={styles.input} placeholder="First name"/>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Last Name</label>
                  <input value={lastName} onChange={e => setLastName(e.target.value)} style={styles.input} placeholder="Last name"/>
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Country</label>
                <select value={country} onChange={e => setCountry(e.target.value)} style={styles.input}>
                  <option value="">Select country…</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Phone (optional)</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} style={styles.input} placeholder="+256..."/>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Bio (optional)</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} style={{ ...styles.input, height: "80px", resize: "vertical" }} placeholder="A short bio…"/>
              </div>

              {saveMsg && <p style={saveMsg.startsWith("✓") ? styles.successMsg : styles.errorMsg}>{saveMsg}</p>}

              <button onClick={handleSaveProfile} disabled={saving} style={styles.btn}>
                {saving ? "Saving…" : "Save Profile"}
              </button>
            </div>
          </>
        )}

        {/* ══ SECURITY TAB ══ */}
        {tab === "security" && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Change Password</h3>
            <div style={styles.field}>
              <label style={styles.label}>Current Password</label>
              <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} style={styles.input} placeholder="Current password"/>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>New Password</label>
              <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} style={styles.input} placeholder="New password"/>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Confirm New Password</label>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} style={styles.input} placeholder="Repeat new password"/>
            </div>
            {pwMsg && <p style={pwMsg.startsWith("✓") ? styles.successMsg : styles.errorMsg}>{pwMsg}</p>}
            <button onClick={handleChangePassword} disabled={pwSaving} style={styles.btn}>
              {pwSaving ? "Updating…" : "Update Password"}
            </button>
          </div>
        )}

        {/* ══ SETTINGS TAB ══ */}
        {tab === "settings" && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Privacy</h3>
            <label style={styles.toggleRow}>
              <input
                type="checkbox"
                checked={profilePublic}
                onChange={e => setProfilePublic(e.target.checked)}
                style={{ marginRight: "10px", width: "16px", height: "16px" }}
              />
              <span style={styles.toggleLabel}>Make my profile public</span>
            </label>
            <button onClick={handleSaveSettings} disabled={settSaving} style={{ ...styles.btn, marginTop: "16px" }}>
              {settSaving ? "Saving…" : "Save Settings"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  page:       { maxWidth: "680px", margin: "0 auto" },
  pageTitle:  { fontSize: "22px", fontWeight: 700, color: "#1B2D4F", marginBottom: "20px", fontFamily: "'Segoe UI', sans-serif" },
  tabs:       { display: "flex", gap: "4px", marginBottom: "20px" },
  tabBtn:     { padding: "9px 20px", borderRadius: "8px", border: "1px solid #D8E3EE", background: "#fff", fontSize: "14px", fontWeight: 500, color: "#5A6A7E", cursor: "pointer", fontFamily: "'Segoe UI', sans-serif" },
  tabActive:  { background: "#1B2D4F", color: "#fff", borderColor: "#1B2D4F" },
  card:       { background: "#fff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 16px rgba(27,45,79,0.07)" },
  section:    { display: "flex", flexDirection: "column", gap: "14px" },
  sectionTitle:{ fontSize: "15px", fontWeight: 700, color: "#1B2D4F", marginBottom: "4px", fontFamily: "'Segoe UI', sans-serif" },
  divider:    { height: "1px", background: "#E8EEF5", margin: "8px 0" },
  emojiGrid:  { display: "flex", flexWrap: "wrap", gap: "8px" },
  emojiBtn:   { width: "44px", height: "44px", fontSize: "22px", background: "#F0F4F9", border: "2px solid transparent", borderRadius: "10px", cursor: "pointer" },
  emojiBtnActive: { borderColor: "#00C2CC", background: "#E6FAFB" },
  row:        { display: "flex", gap: "12px" },
  field:      { flex: 1, display: "flex", flexDirection: "column", gap: "5px" },
  label:      { fontSize: "11px", fontWeight: 600, color: "#8899AA", letterSpacing: "0.5px", textTransform: "uppercase", fontFamily: "'Segoe UI', sans-serif" },
  input:      { background: "#F8FAFC", border: "1px solid #D8E3EE", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", color: "#1B2D4F", outline: "none", fontFamily: "'Segoe UI', sans-serif", width: "100%" },
  btn:        { background: "linear-gradient(135deg,#1B2D4F,#4A7FC1)", color: "#fff", border: "none", borderRadius: "10px", padding: "12px 24px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif", alignSelf: "flex-start" },
  successMsg: { fontSize: "13px", color: "#00A36C", fontFamily: "'Segoe UI', sans-serif" },
  errorMsg:   { fontSize: "13px", color: "#E53E3E", fontFamily: "'Segoe UI', sans-serif" },
  toggleRow:  { display: "flex", alignItems: "center", cursor: "pointer" },
  toggleLabel:{ fontSize: "14px", color: "#1B2D4F", fontFamily: "'Segoe UI', sans-serif" },
};
