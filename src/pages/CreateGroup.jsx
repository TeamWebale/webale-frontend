/**
 * CreateGroup.jsx — src/pages/CreateGroup.jsx
 * - All field labels in sentence case
 * - Quick Templates hidden under hamburger dropdown
 * - Deadline calendar auto-clears after date is selected
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { CURRENCIES, getCurrencyForCountry } from "../utils/currencyConverter";

const API = "https://webale-api.onrender.com/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

const TEMPLATES = [
  { label: "Wedding fundraiser",  name: "Wedding Fundraiser", description: "Help us celebrate our special day by contributing to our wedding fund." },
  { label: "Medical emergency",   name: "Medical Emergency",  description: "Support needed for urgent medical treatment and hospital expenses." },
  { label: "School fees",         name: "School Fees",        description: "Help fund education costs for the upcoming term or semester." },
  { label: "Business startup",    name: "Business Startup",   description: "Join us in funding a new business venture and sharing in its success." },
  { label: "Community project",   name: "Community Project",  description: "Contribute to a local community improvement initiative." },
];

export default function CreateGroup() {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const defaultCurrency = getCurrencyForCountry(user?.country || user?.profile?.country || "");

  const [form, setForm] = useState({
    name        : "",
    description : "",
    goal_amount : "",
    currency    : defaultCurrency,
    deadline    : "",
  });
  const [error,         setError]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const templateRef = useRef(null);
  const [deadlineLabel, setDeadlineLabel] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleDeadlineChange = (e) => {
    const val = e.target.value;
    if (!val) { setForm(f => ({ ...f, deadline: "" })); setDeadlineLabel(""); return; }
    const d = new Date(val + "T00:00:00");
    const label = d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    setDeadlineLabel(label);
    setForm(f => ({ ...f, deadline: val }));
    setTimeout(() => { e.target.value = ""; }, 0);
  };

  const applyTemplate = (template) => {
    setForm(f => ({ ...f, name: template.name, description: template.description }));
    setTemplatesOpen(false);
  };

  // Close templates dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (templateRef.current && !templateRef.current.contains(e.target)) {
        setTemplatesOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await axios.post(
        `${API}/groups`,
        { name: form.name, description: form.description, goal_amount: form.goal_amount ? parseFloat(form.goal_amount) : null, currency: form.currency, deadline: form.deadline || null },
        { headers: authHeaders() }
      );
      const groupId = res.data?.data?.id || res.data?.id;
      navigate(groupId ? `/groups/${groupId}` : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create group.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>

        <div style={s.header}>
          <h1 style={s.title}>Create Group</h1>
          <button onClick={() => navigate("/dashboard")} style={s.closeBtn}>✕</button>
        </div>

        {/* Quick Templates hamburger dropdown */}
        <div ref={templateRef} style={{ marginBottom: "20px" }}>
          <button onClick={() => setTemplatesOpen(o => !o)} style={s.templateToggle}>
            <span>☰ Quick templates <span style={s.opt}>(optional)</span></span>
            <span style={{ fontSize: "10px", color: "#8899AA" }}>{templatesOpen ? "▲" : "▼"}</span>
          </button>
          {templatesOpen && (
            <div style={s.templateDropdown}>
              {TEMPLATES.map(t => (
                <button key={t.name} onClick={() => applyTemplate(t)} style={s.templateItem}
                  onMouseEnter={e => e.currentTarget.style.background = "#F0F4F9"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}>
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={s.form}>

          <div style={s.field}>
            <label style={s.label}>Group name</label>
            <input name="name" value={form.name} onChange={handleChange} required
              placeholder="e.g. Kampala Wedding 2026" style={s.input} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Description <span style={s.opt}>(optional)</span></label>
            <textarea name="description" value={form.description} onChange={handleChange}
              placeholder="What is this group fundraising for?"
              style={{ ...s.input, height: "90px", resize: "vertical" }} />
          </div>

          <div style={s.row}>
            <div style={s.field}>
              <label style={s.label}>Currency</label>
              <select name="currency" value={form.currency} onChange={handleChange} style={s.input}>
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
                ))}
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Target / goal amount <span style={s.opt}>(optional)</span></label>
              <input name="goal_amount" type="number" min="1" value={form.goal_amount}
                onChange={handleChange} placeholder="0.00" style={s.input} />
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Deadline <span style={s.opt}>(optional)</span></label>
            <input name="deadline" type="date" onChange={handleDeadlineChange} style={s.input} />
            {deadlineLabel && (
              <div style={s.deadlinePill}>
                <span>📅 {deadlineLabel}</span>
                <button type="button" onClick={() => { setDeadlineLabel(""); setForm(f => ({ ...f, deadline: "" })); }}
                  style={{ background: "none", border: "none", color: "#718096", cursor: "pointer", fontSize: "14px" }}>✕</button>
              </div>
            )}
          </div>

          <div style={s.btnRow}>
            <button type="button" onClick={() => navigate("/dashboard")} style={s.cancelBtn}>Cancel</button>
            <button type="submit" disabled={loading} style={s.submitBtn}>
              {loading ? "Creating…" : "Create group"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

const s = {
  page:             { maxWidth: "640px", margin: "0 auto" },
  card:             { background: "#fff", borderRadius: "16px", padding: "28px 32px", boxShadow: "0 2px 16px rgba(27,45,79,0.07)" },
  header:           { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" },
  title:            { fontSize: "20px", fontWeight: 700, color: "#1B2D4F", fontFamily: "'Segoe UI', sans-serif" },
  closeBtn:         { background: "#fee2e2", border: "none", fontSize: "18px", color: "#e53e3e", cursor: "pointer", padding: "6px 10px", borderRadius: "8px", fontWeight: 700 },
  opt:              { fontWeight: 400, color: "#AAB8C8" },
  templateToggle:   { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "#F8FAFC", border: "1px solid #D8E3EE", borderRadius: "10px", padding: "9px 14px", fontSize: "13px", fontWeight: 600, color: "#1B2D4F", cursor: "pointer", fontFamily: "'Segoe UI', sans-serif", boxSizing: "border-box" },
  templateDropdown: { border: "1px solid #D8E3EE", borderTop: "none", borderRadius: "0 0 10px 10px", background: "#fff", overflow: "hidden" },
  templateItem:     { display: "block", width: "100%", textAlign: "left", padding: "10px 14px", background: "none", border: "none", borderBottom: "1px solid #F0F4F9", fontSize: "13px", color: "#1B2D4F", cursor: "pointer", fontFamily: "'Segoe UI', sans-serif" },
  error:            { background: "rgba(220,53,69,0.08)", border: "1px solid rgba(220,53,69,0.3)", borderRadius: "8px", padding: "10px 14px", color: "#C0392B", fontSize: "13px", marginBottom: "16px" },
  form:             { display: "flex", flexDirection: "column", gap: "16px" },
  row:              { display: "flex", gap: "12px" },
  field:            { flex: 1, display: "flex", flexDirection: "column", gap: "5px" },
  label:            { fontSize: "12px", fontWeight: 600, color: "#8899AA", fontFamily: "'Segoe UI', sans-serif" },
  input:            { background: "#F8FAFC", border: "1px solid #D8E3EE", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", color: "#1B2D4F", outline: "none", fontFamily: "'Segoe UI', sans-serif", width: "100%", boxSizing: "border-box" },
  deadlinePill:     { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#EBF8FF", border: "1px solid #BEE3F8", borderRadius: "8px", padding: "6px 12px", marginTop: "4px", fontSize: "13px", color: "#2C5282", fontWeight: 600 },
  btnRow:           { display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "4px" },
  cancelBtn:        { background: "transparent", border: "1px solid #D8E3EE", borderRadius: "10px", padding: "11px 24px", fontSize: "14px", color: "#5A6A7E", cursor: "pointer", fontFamily: "'Segoe UI', sans-serif" },
  submitBtn:        { background: "linear-gradient(135deg,#00C2CC,#4A7FC1)", color: "#fff", border: "none", borderRadius: "10px", padding: "11px 28px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif" },
};
