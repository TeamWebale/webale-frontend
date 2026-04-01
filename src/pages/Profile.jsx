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

import { COUNTRIES } from '../constants/countries';

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
    user?.avatar_url || user?.avatarUrl || "😊"
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

  const [showDeleteSection, setShowDeleteSection] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [pendingPledgesList, setPendingPledgesList] = useState([]);
  const [adminGroupsList, setAdminGroupsList] = useState([]);

  // ── Save profile ──────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setSaving(true); setSaveMsg("");
    try {
      const res = await axios.put(
        `${API}/auth/profile`,
        { firstName, lastName, country, bio, phone },
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
        { avatarUrl: selectedEmoji, avatarType: "emoji" },
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

              {/* Current avatar display with pencil */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <div style={{
                    width: "72px", height: "72px", borderRadius: "50%",
                    background: "linear-gradient(135deg,#667eea,#764ba2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "38px", boxShadow: "0 4px 12px rgba(102,126,234,0.3)"
                  }}>
                    {selectedEmoji || user?.avatar_url || "😊"}
                  </div>
                  {/* Pencil badge */}
                  <div style={{
                    position: "absolute", bottom: "0", right: "0",
                    width: "22px", height: "22px", borderRadius: "50%",
                    background: "#667eea", border: "2px solid white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "11px", cursor: "pointer"
                  }} title="Click an emoji below to change your avatar">
                    ✏️
                  </div>
                </div>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 600, color: "#1B2D4F" }}>
                    Your avatar
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#8899AA" }}>
                    Pick an emoji below to change it
                  </p>
                </div>
              </div>

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

        {/* ── Delete Account ── */}
        <div style={{ marginTop: '32px', borderTop: '2px solid #fed7d7', paddingTop: '20px' }}>
          {!showDeleteSection ? (
            <button onClick={() => setShowDeleteSection(true)} style={{
              background: 'none', border: 'none', color: '#e53e3e', fontSize: '14px',
              fontWeight: 500, cursor: 'pointer', fontFamily: "'Segoe UI', sans-serif",
              padding: 0, textDecoration: 'underline',
            }}>
              Delete my account
            </button>
          ) : (
            <div style={{ background: '#fff5f5', borderRadius: '12px', padding: '20px', border: '1px solid #fed7d7' }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: '#e53e3e', fontWeight: 700 }}>Delete Account</h3>
              <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#4a5568', lineHeight: 1.6 }}>
                This action is <strong>permanent and cannot be undone</strong>. Your profile, group memberships, and messages will be deleted.
              </p>

              {deleteError && (
                <div style={{ background: '#fff', border: '1px solid #fed7d7', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#e53e3e', fontWeight: 600 }}>{deleteError}</p>
                  {pendingPledgesList.length > 0 && (
                    <div style={{ fontSize: '13px', color: '#4a5568' }}>
                      <p style={{ margin: '0 0 4px', fontWeight: 600 }}>Pending pledges to resolve:</p>
                      {pendingPledgesList.map((p, i) => (
                        <p key={i} style={{ margin: '2px 0 2px 12px' }}>
                          • {p.group_name}: {p.pledge_currency || ''} {parseFloat(p.amount).toLocaleString()}
                          <span style={{ color: '#718096', fontSize: '12px' }}> — Go to this group → Actions Menu → Revise/Delete Pledge</span>
                        </p>
                      ))}
                    </div>
                  )}
                  {adminGroupsList.length > 0 && (
                    <div style={{ fontSize: '13px', color: '#4a5568', marginTop: '8px' }}>
                      <p style={{ margin: '0 0 4px', fontWeight: 600 }}>Groups where you must transfer ownership:</p>
                      {adminGroupsList.map((g, i) => (
                        <p key={i} style={{ margin: '2px 0 2px 12px' }}>
                          • {g.name}
                          <span style={{ color: '#718096', fontSize: '12px' }}> — Go to this group → Admin tab → Transfer Ownership</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={styles.label}>Enter your password to confirm</label>
                  <input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} placeholder="Your current password" style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Type DELETE to confirm</label>
                  <input type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="Type DELETE" style={styles.input} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  disabled={deleting || deleteConfirm !== 'DELETE' || !deletePassword}
                  onClick={async () => {
                    setDeleting(true); setDeleteError(""); setPendingPledgesList([]); setAdminGroupsList([]);
                    try {
                      await axios.delete(`${API}/auth/account`, { headers: authHeaders(), data: { password: deletePassword } });
                      localStorage.clear();
                      window.location.href = '/login';
                    } catch (err) {
                      const data = err.response?.data;
                      setDeleteError(data?.message || 'Failed to delete account');
                      if (data?.data?.pendingPledges) setPendingPledgesList(data.data.pendingPledges);
                      if (data?.data?.adminGroups) setAdminGroupsList(data.data.adminGroups);
                    } finally { setDeleting(false); }
                  }}
                  style={{
                    background: deleteConfirm === 'DELETE' && deletePassword ? '#e53e3e' : '#e2e8f0',
                    color: deleteConfirm === 'DELETE' && deletePassword ? '#fff' : '#a0aec0',
                    border: 'none', borderRadius: '10px', padding: '10px 20px',
                    fontSize: '14px', fontWeight: 600,
                    cursor: deleteConfirm === 'DELETE' && deletePassword ? 'pointer' : 'not-allowed',
                    fontFamily: "'Segoe UI', sans-serif",
                  }}
                >
                  {deleting ? 'Deleting...' : 'Permanently Delete Account'}
                </button>
                <button onClick={() => { setShowDeleteSection(false); setDeleteError(""); setDeletePassword(""); setDeleteConfirm(""); setPendingPledgesList([]); setAdminGroupsList([]); }} style={{
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
                  padding: '10px 20px', fontSize: '14px', color: '#4a5568', cursor: 'pointer', fontFamily: "'Segoe UI', sans-serif",
                }}>Cancel</button>
              </div>
            </div>
          )}
        </div>

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
