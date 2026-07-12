import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Building2, Briefcase, Lock, Save, Check } from "lucide-react";
import { COLORS } from "../../constants/config";
import { useAuth } from "../../constants/AuthContext";
import { updateProfile, changePassword } from "../../constants/api";
import SectionTitle from "../common/SectionTitle";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    full_name: "", phone: "", department: "", designation: "", bio: "",
  });
  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [msg, setMsg] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || "",
        phone: user.phone || "",
        department: user.department || "",
        designation: user.designation || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg("");
    try {
      await updateProfile(form);
      updateUser(form);
      setMsg("Profile updated successfully!");
    } catch (err) {
      setMsg("Error: " + err.message);
    } finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg("");
    if (pwForm.new_password !== pwForm.confirm_password) { setPwMsg("Passwords do not match"); return; }
    if (pwForm.new_password.length < 6) { setPwMsg("Password must be at least 6 characters"); return; }
    setChangingPw(true);
    try {
      await changePassword({ current_password: pwForm.current_password, new_password: pwForm.new_password });
      setPwMsg("Password changed successfully!");
      setPwForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      setPwMsg("Error: " + err.message);
    } finally { setChangingPw(false); }
  };

  if (!user) return null;

  return (
    <div className="stack-lg">
      <SectionTitle eyebrow="Account" title="My Profile" />

      <div className="grid-2">
        {/* Profile Info Card */}
        <div className="panel">
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
            <div style={{
              width: "64px", height: "64px", borderRadius: "50%", background: COLORS.env,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: "22px", fontWeight: "700",
            }}>
              {user.full_name?.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: COLORS.ink }}>{user.full_name}</div>
              <div style={{ fontSize: "13px", color: COLORS.inkSoft }}>{user.role_name} • {user.department || "—"}</div>
              <div style={{ fontSize: "11px", color: COLORS.inkSoft, marginTop: "2px" }}>
                Last login: {user.last_login ? new Date(user.last_login).toLocaleString() : "—"}
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="filter-grid">
            <label className="filter-field"><span>Full Name</span>
              <input value={form.full_name} onChange={(e) => setForm({...form, full_name: e.target.value})} required />
            </label>
            <label className="filter-field"><span>Email (read-only)</span>
              <input value={user.email} disabled style={{ opacity: 0.6 }} />
            </label>
            <label className="filter-field"><span>Phone</span>
              <input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
            </label>
            <label className="filter-field"><span>Department</span>
              <input value={form.department} onChange={(e) => setForm({...form, department: e.target.value})} />
            </label>
            <label className="filter-field"><span>Designation</span>
              <input value={form.designation} onChange={(e) => setForm({...form, designation: e.target.value})} />
            </label>
            <label className="filter-field"><span>Role (read-only)</span>
              <input value={user.role_name} disabled style={{ opacity: 0.6 }} />
            </label>
            <div style={{ gridColumn: "span 2" }}>
              <label className="filter-field"><span>Bio</span>
                <textarea value={form.bio} onChange={(e) => setForm({...form, bio: e.target.value})}
                  rows={3} style={{ width: "100%", borderRadius: "8px", border: `1px solid ${COLORS.line}`, padding: "8px 12px", fontSize: "13px", resize: "vertical", fontFamily: "inherit" }} />
              </label>
            </div>
            <div style={{ gridColumn: "span 2", display: "flex", alignItems: "center", gap: "12px" }}>
              <button type="submit" className="btn-primary" style={{ background: COLORS.env, margin: 0 }} disabled={saving}>
                <Save size={14} /> {saving ? "Saving..." : "Save Profile"}
              </button>
              {msg && <span style={{ fontSize: "13px", color: msg.startsWith("Error") ? COLORS.bad : COLORS.good }}>{msg}</span>}
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="panel">
          <SectionTitle eyebrow="Security" title="Change Password" />
          <form onSubmit={handleChangePassword} className="stack-sm" style={{ marginTop: "16px" }}>
            <label className="filter-field"><span>Current Password</span>
              <input type="password" value={pwForm.current_password} onChange={(e) => setPwForm({...pwForm, current_password: e.target.value})} required />
            </label>
            <label className="filter-field"><span>New Password</span>
              <input type="password" value={pwForm.new_password} onChange={(e) => setPwForm({...pwForm, new_password: e.target.value})} required />
            </label>
            <label className="filter-field"><span>Confirm New Password</span>
              <input type="password" value={pwForm.confirm_password} onChange={(e) => setPwForm({...pwForm, confirm_password: e.target.value})} required />
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button type="submit" className="btn-primary" style={{ background: COLORS.gov, margin: 0 }} disabled={changingPw}>
                <Lock size={14} /> {changingPw ? "Changing..." : "Change Password"}
              </button>
              {pwMsg && <span style={{ fontSize: "13px", color: pwMsg.startsWith("Error") ? COLORS.bad : COLORS.good }}>{pwMsg}</span>}
            </div>
          </form>

          <div style={{ marginTop: "32px", padding: "16px", background: COLORS.surface2, borderRadius: "10px", border: `1px solid ${COLORS.line}` }}>
            <SectionTitle eyebrow="Account Details" title="Information" />
            <div style={{ fontSize: "13px", color: COLORS.inkSoft, display: "grid", gap: "8px", marginTop: "12px" }}>
              <div><strong>Employee ID:</strong> {user.employee_id || "—"}</div>
              <div><strong>Account Status:</strong> <span style={{ color: user.is_active ? COLORS.good : COLORS.bad }}>{user.is_active ? "Active" : "Inactive"}</span></div>
              <div><strong>Created:</strong> {user.created_at ? new Date(user.created_at).toLocaleString() : "—"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
