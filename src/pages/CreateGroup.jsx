/**
 * CreateGroup.jsx
 * Destination: src/pages/CreateGroup.jsx
 *
 * - Currency defaults to profile country (not IP-based)
 * - Template labels show "(optional)"
 * - Close ✕ button navigates back
 * - Placeholder clears when template is selected/filled
 */

import { useState } from "react";
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
  { label: "Wedding Fundraiser (optional)", name: "Wedding Fundraiser", description: "Help us celebrate our special day by contributing to our wedding fund." },
  { label: "Medical Emergency (optional)",  name: "Medical Emergency",  description: "Support needed for urgent medical treatment and hospital expenses." },
  { label: "School Fees (optional)",        name: "School Fees",        description: "Help fund education costs for the upcoming term or semester." },
  { label: "Business Startup (optional)",   name: "Business Startup",   description: "Join us in funding a new business venture and sharing in its success." },
  { label: "Community Project (optional)",  name: "Community Project",  description: "Contribute to a local community improvement initiative." },
];

export default function CreateGroup() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const defaultCurrency = getCurrencyForCountry(user?.country || user?.profile?.country || "");

  const [form, setForm] = useState({
    name        : "",
    description : "",
    goal_amount : "",
    currency    : defaultCurrency,
    deadline    : "",
  });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const applyTemplate = (template) => {
    setForm(f => ({
      ...f,
      name       : template.name,
      description: template.description,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await axios.post(
        `${API}/groups`,
        {
          name        : form.name,
          description : form.description,
          goal_amount : parseFloat(form.goal_amount),
          currency    : form.currency,
          deadline    : form.deadline || null,
        },
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
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Create New Group</h1>
          <button onClick={() => navigate("/dashboard")} style={styles.closeBtn} aria-label="Close">✕</button>
        </div>

        {/* Templates */}
        <div style={styles.section}>
          <p style={styles.sectionLabel}>Quick Templates <span style={styles.opt}>(optional)</span></p>
          <div style={styles.templateRow}>
            {TEMPLATES.map(t => (
              <button key={t.name} onClick={() => applyTemplate(t)} style={styles.templateBtn}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>

          <div style={styles.field}>
            <label style={styles.label}>Group Name</label>
            <input
              name="name" value={form.name} onChange={handleChange} required
              placeholder="e.g. Kampala Wedding 2026" style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <textarea
              name="description" value={form.description} onChange={handleChange}
              placeholder="What is this group fundraising for?" required
              style={{ ...styles.input, height: "90px", resize: "vertical" }}
            />
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Currency</label>
              <select name="currency" value={form.currency} onChange={handleChange} style={styles.input}>
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Target / Goal Amount</label>
              <input
                name="goal_amount" type="number" min="1" value={form.goal_amount}
                onChange={handleChange} required
                placeholder="0.00" style={styles.input}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Deadline <span style={styles.opt}>(optional)</span></label>
            <input name="deadline" type="date" value={form.deadline} onChange={handleChange} style={styles.input}/>
          </div>

          <div style={styles.btnRow}>
            <button type="button" onClick={() => navigate("/dashboard")} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? "Creating…" : "Create Group"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: "640px", margin: "0 auto" },
  card: { background: "#fff", borderRadius: "16px", padding: "28px 32px", boxShadow: "0 2px 16px rgba(27,45,79,0.07)" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" },
  title: { fontSize: "20px", fontWeight: 700, color: "#1B2D4F", fontFamily: "'Segoe UI', sans-serif" },
  closeBtn: { background: "transparent", border: "none", fontSize: "18px", color: "#8899AA", cursor: "pointer", padding: "4px" },
  section: { marginBottom: "20px" },
  sectionLabel: { fontSize: "12px", fontWeight: 600, color: "#8899AA", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px", fontFamily: "'Segoe UI', sans-serif" },
  opt: { fontWeight: 400, textTransform: "none", color: "#AAB8C8" },
  templateRow: { display: "flex", flexWrap: "wrap", gap: "8px" },
  templateBtn: { background: "#F0F4F9", border: "1px solid #D8E3EE", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", color: "#1B2D4F", cursor: "pointer", fontFamily: "'Segoe UI', sans-serif" },
  error: { background: "rgba(220,53,69,0.08)", border: "1px solid rgba(220,53,69,0.3)", borderRadius: "8px", padding: "10px 14px", color: "#C0392B", fontSize: "13px", marginBottom: "16px", fontFamily: "'Segoe UI', sans-serif" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  row: { display: "flex", gap: "12px" },
  field: { flex: 1, display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontSize: "11px", fontWeight: 600, color: "#8899AA", textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: "'Segoe UI', sans-serif" },
  input: { background: "#F8FAFC", border: "1px solid #D8E3EE", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", color: "#1B2D4F", outline: "none", fontFamily: "'Segoe UI', sans-serif", width: "100%" },
  btnRow: { display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "4px" },
  cancelBtn: { background: "transparent", border: "1px solid #D8E3EE", borderRadius: "10px", padding: "11px 24px", fontSize: "14px", color: "#5A6A7E", cursor: "pointer", fontFamily: "'Segoe UI', sans-serif" },
  submitBtn: { background: "linear-gradient(135deg,#00C2CC,#4A7FC1)", color: "#fff", border: "none", borderRadius: "10px", padding: "11px 28px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif" },
};
