import React, { useState, useEffect } from "react";
import { UserPlus, Shield, Clock, X, Save, RefreshCw } from "lucide-react";
import { COLORS } from "../../constants/config";
import { getUsers, createUser, updateUser, deleteUser, getRoles, getPermissions, updateRolePermissions, getLoginHistory } from "../../constants/api";
import SectionTitle from "../common/SectionTitle";
import DataTable from "../common/DataTable";
import StatusPill from "../common/StatusPill";

export default function UserManagementModule({ tab }) {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [allPerms, setAllPerms] = useState([]);
  const [history, setHistory] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [createForm, setCreateForm] = useState({
    email: "", password: "", full_name: "", phone: "", department: "", designation: "", role_id: 4,
  });

  const load = async () => {
    setLoading(true);
    try {
      const [u, r, p] = await Promise.all([getUsers(), getRoles(), getPermissions()]);
      setUsers(u); setRoles(r); setAllPerms(p);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const loadHistory = async () => {
    try { setHistory(await getLoginHistory()); } catch (err) { console.error(err); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (tab === "Login history") loadHistory(); }, [tab]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createUser(createForm);
      setShowCreate(false);
      setCreateForm({ email: "", password: "", full_name: "", phone: "", department: "", designation: "", role_id: 4 });
      load();
    } catch (err) { alert("Error: " + err.message); }
  };

  const handleToggleActive = async (u) => {
    try {
      await updateUser(u.id, { is_active: !u.is_active });
      load();
    } catch (err) { alert("Error: " + err.message); }
  };

  const handleRoleChange = async (userId, newRoleId) => {
    try {
      await updateUser(userId, { role_id: newRoleId });
      load();
    } catch (err) { alert("Error: " + err.message); }
  };

  const handlePermToggle = async (roleId, permId, currentPerms) => {
    const ids = currentPerms.map(p => p.id);
    const newIds = ids.includes(permId) ? ids.filter(id => id !== permId) : [...ids, permId];
    try {
      await updateRolePermissions(roleId, newIds);
      load();
    } catch (err) { alert("Error: " + err.message); }
  };

  if (tab === "Role management") {
    return (
      <div className="stack-lg">
        <SectionTitle eyebrow="Admin" title="Role & Permission Management" />
        {roles.map(role => (
          <div key={role.id} className="panel" style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: COLORS.ink }}><Shield size={14} /> {role.name}</div>
                <div style={{ fontSize: "12px", color: COLORS.inkSoft }}>{role.description}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {allPerms.map(perm => {
                const has = role.permissions.some(rp => rp.id === perm.id);
                return (
                  <button key={perm.id} onClick={() => handlePermToggle(role.id, perm.id, role.permissions)}
                    style={{
                      padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: "600",
                      border: `1px solid ${has ? COLORS.env : COLORS.line}`,
                      background: has ? COLORS.envSoft : COLORS.surface2,
                      color: has ? COLORS.env : COLORS.inkSoft,
                      cursor: "pointer", transition: "all 0.2s",
                    }}>
                    {perm.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tab === "Login history") {
    return (
      <div className="stack-lg">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <SectionTitle eyebrow="Audit" title="Login History" />
          <button className="btn-ghost" onClick={loadHistory}><RefreshCw size={13} /> Refresh</button>
        </div>
        <DataTable
          columns={["User", "Email", "IP", "Time", "Status"]}
          rows={history}
          renderCell={(r, c) => {
            if (c === "User") return r.user_name;
            if (c === "Email") return r.user_email;
            if (c === "IP") return <span className="mono">{r.ip_address}</span>;
            if (c === "Time") return r.login_at ? new Date(r.login_at).toLocaleString() : "—";
            if (c === "Status") return <StatusPill status={r.success ? "Active" : "Failed"} />;
            return null;
          }}
        />
      </div>
    );
  }

  // Default: User Management
  return (
    <div className="stack-lg">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <SectionTitle eyebrow="Admin" title="User Management" />
        <button className="btn-primary" style={{ background: COLORS.env, margin: 0 }} onClick={() => setShowCreate(true)}>
          <UserPlus size={14} /> Create User
        </button>
      </div>

      {/* Create User Modal */}
      {showCreate && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000,
        }} onClick={() => setShowCreate(false)}>
          <div style={{
            background: COLORS.surface, borderRadius: "14px", padding: "32px", width: "480px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, color: COLORS.ink }}>Create New User</h3>
              <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.inkSoft }}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="filter-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <label className="filter-field"><span>Full Name *</span>
                <input value={createForm.full_name} onChange={(e) => setCreateForm({...createForm, full_name: e.target.value})} required />
              </label>
              <label className="filter-field"><span>Email *</span>
                <input type="email" value={createForm.email} onChange={(e) => setCreateForm({...createForm, email: e.target.value})} required />
              </label>
              <label className="filter-field"><span>Password *</span>
                <input type="password" value={createForm.password} onChange={(e) => setCreateForm({...createForm, password: e.target.value})} required minLength={6} />
              </label>
              <label className="filter-field"><span>Phone</span>
                <input value={createForm.phone} onChange={(e) => setCreateForm({...createForm, phone: e.target.value})} />
              </label>
              <label className="filter-field"><span>Department</span>
                <input value={createForm.department} onChange={(e) => setCreateForm({...createForm, department: e.target.value})} />
              </label>
              <label className="filter-field"><span>Designation</span>
                <input value={createForm.designation} onChange={(e) => setCreateForm({...createForm, designation: e.target.value})} />
              </label>
              <label className="filter-field" style={{ gridColumn: "span 2" }}><span>Role *</span>
                <select value={createForm.role_id} onChange={(e) => setCreateForm({...createForm, role_id: parseInt(e.target.value)})}>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </label>
              <div style={{ gridColumn: "span 2", marginTop: "8px" }}>
                <button type="submit" className="btn-primary" style={{ background: COLORS.env, margin: 0, width: "100%" }}>
                  <Save size={14} /> Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <DataTable
        columns={["Name", "Email", "Department", "Role", "Status", "Last Login", "Actions"]}
        rows={users}
        renderCell={(r, c) => {
          if (c === "Name") return <span className="cell-strong">{r.full_name}</span>;
          if (c === "Email") return r.email;
          if (c === "Department") return r.department || "—";
          if (c === "Role") return (
            <select value={r.role_id} onChange={(e) => handleRoleChange(r.id, parseInt(e.target.value))}
              style={{ padding: "4px 8px", borderRadius: "6px", border: `1px solid ${COLORS.line}`, fontSize: "12px", background: COLORS.surface2 }}>
              {roles.map(rl => <option key={rl.id} value={rl.id}>{rl.name}</option>)}
            </select>
          );
          if (c === "Status") return <StatusPill status={r.is_active ? "Active" : "Inactive"} />;
          if (c === "Last Login") return r.last_login ? new Date(r.last_login).toLocaleDateString() : "Never";
          if (c === "Actions") return (
            <button className="btn-ghost" onClick={() => handleToggleActive(r)}
              style={{ fontSize: "11px", color: r.is_active ? COLORS.bad : COLORS.good }}>
              {r.is_active ? "Deactivate" : "Activate"}
            </button>
          );
          return null;
        }}
      />
    </div>
  );
}
