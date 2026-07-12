import React, { useState, useEffect } from "react";
import { Building2, Plus, Tags, X } from "lucide-react";
import { COLORS } from "../../constants/config";
import {
  getDepartments, createDepartment,
  getCategories, createCategory,
  getConfigs, saveConfigs
} from "../../constants/api";
import SectionTitle from "../common/SectionTitle";
import DataTable from "../common/DataTable";
import StatusPill from "../common/StatusPill";
import Pill from "../common/Pill";
import Toggle from "../common/Toggle";

export default function SettingsModule({ tab, onRefresh }) {
  const [departments, setDepartments] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [configs, setConfigs] = useState({
    autoEmission: "true", evidence: "true", badgeAuto: "true",
    notifIssue: "true", notifApproval: "true", notifPolicy: "false", notifBadge: "true",
    weight_env: "40", weight_social: "30", weight_gov: "30"
  });

  // Modals state
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);

  // Form states
  const [deptForm, setDeptForm] = useState({ name: "", code: "", head: "", employees: 1, status: "Active" });
  const [catForm, setCatForm] = useState({ name: "", type: "CSR Activity", status: "Active" });

  const loadAll = async () => {
    try {
      const depts = await getDepartments();
      setDepartments(depts);
      const cats = await getCategories();
      setCategoriesList(cats);
      const conf = await getConfigs();
      setConfigs((prev) => ({ ...prev, ...conf }));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAll();
  }, [tab]);

  const updateConfig = async (key, val) => {
    const nextConfigs = { ...configs, [key]: String(val) };
    setConfigs(nextConfigs);
    try {
      await saveConfigs({ [key]: String(val) });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDept = async (e) => {
    e.preventDefault();
    try {
      await createDepartment(deptForm);
      setShowDeptModal(false);
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateCat = async (e) => {
    e.preventDefault();
    try {
      await createCategory(catForm);
      setShowCatModal(false);
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="stack-lg">
      <SectionTitle eyebrow="Settings" title={tab} />

      {tab === "Departments" && (
        <div className="panel">
          <SectionTitle title="Departments" action={<button className="btn-ghost" onClick={() => setShowDeptModal(true)}><Plus size={14} /> Add department</button>} />
          <DataTable
            columns={["Department", "Code", "Head", "Employees", "Status"]}
            rows={departments}
            renderCell={(r, c) => {
              if (c === "Department") return <span className="cell-strong"><Building2 size={13} style={{ marginRight: 6, verticalAlign: -2 }} />{r.name}</span>;
              if (c === "Code") return <span className="mono">{r.code}</span>;
              if (c === "Head") return r.head;
              if (c === "Employees") return <span className="mono">{r.employees}</span>;
              if (c === "Status") return <StatusPill status={r.status} />;
              return null;
            }}
          />

          {showDeptModal && (
            <div className="modal-overlay" style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center",
              justifyContent: "center", zIndex: 1000
            }}>
              <div className="panel" style={{ width: "420px", padding: "24px", position: "relative" }}>
                <button style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", cursor: "pointer" }} onClick={() => setShowDeptModal(false)}>
                  <X size={18} />
                </button>
                <SectionTitle eyebrow="Settings" title="Add Department" />
                <form onSubmit={handleCreateDept} className="stack-md" style={{ marginTop: "16px" }}>
                  <label className="filter-field">
                    <span>Department Name</span>
                    <input type="text" required value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} />
                  </label>
                  <label className="filter-field">
                    <span>Code</span>
                    <input type="text" required placeholder="e.g. MFG, HR" value={deptForm.code} onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })} />
                  </label>
                  <label className="filter-field">
                    <span>Head of Department</span>
                    <input type="text" required value={deptForm.head} onChange={(e) => setDeptForm({ ...deptForm, head: e.target.value })} />
                  </label>
                  <label className="filter-field">
                    <span>Employee Count</span>
                    <input type="number" required value={deptForm.employees} onChange={(e) => setDeptForm({ ...deptForm, employees: Number(e.target.value) })} />
                  </label>
                  <button type="submit" className="btn-primary" style={{ background: COLORS.env, width: "100%", marginTop: "8px" }}>Save Department</button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "Categories" && (
        <div className="panel">
          <SectionTitle title="Categories" action={<button className="btn-ghost" onClick={() => setShowCatModal(true)}><Plus size={14} /> Add category</button>} />
          <DataTable
            columns={["Name", "Type"]}
            rows={categoriesList}
            renderCell={(r, c) => c === "Name" ? <span className="cell-strong"><Tags size={13} style={{ marginRight: 6, verticalAlign: -2 }} />{r.name}</span> : <Pill tone="neutral">{r.type}</Pill>}
          />

          {showCatModal && (
            <div className="modal-overlay" style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center",
              justifyContent: "center", zIndex: 1000
            }}>
              <div className="panel" style={{ width: "420px", padding: "24px", position: "relative" }}>
                <button style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", cursor: "pointer" }} onClick={() => setShowCatModal(false)}>
                  <X size={18} />
                </button>
                <SectionTitle eyebrow="Settings" title="Add Category" />
                <form onSubmit={handleCreateCat} className="stack-md" style={{ marginTop: "16px" }}>
                  <label className="filter-field">
                    <span>Category Name</span>
                    <input type="text" required value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} />
                  </label>
                  <label className="filter-field">
                    <span>Type</span>
                    <select value={catForm.type} onChange={(e) => setCatForm({ ...catForm, type: e.target.value })}>
                      <option>CSR Activity</option>
                      <option>Challenge</option>
                    </select>
                  </label>
                  <button type="submit" className="btn-primary" style={{ background: COLORS.env, width: "100%", marginTop: "8px" }}>Save Category</button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "ESG configuration" && (
        <div className="panel">
          <SectionTitle eyebrow="Score weighting" title="How the overall ESG score is calculated" />
          <p className="mini-note" style={{ marginBottom: 16 }}>The overall ESG score is a weighted average of each department’s Environmental, Social and Governance scores.</p>
          <div className="weight-grid">
            {[
              ["weight_env", "Environmental", COLORS.env],
              ["weight_social", "Social", COLORS.social],
              ["weight_gov", "Governance", COLORS.gov]
            ].map(([k, label, color]) => (
              <div className="weight-cell" key={k}>
                <div className="between-row"><span>{label}</span><span className="mono" style={{ color }}>{configs[k]}%</span></div>
                <input
                  type="range" min={0} max={100} value={configs[k] || 0}
                  onChange={(e) => updateConfig(k, e.target.value)}
                  className="range-input"
                />
              </div>
            ))}
          </div>
          <div className="divider-tick" />
          <div className="stack-sm">
            <Toggle on={configs.autoEmission === "true"} onClick={() => updateConfig("autoEmission", configs.autoEmission === "true" ? "false" : "true")} label="Auto emission calculation" desc="Carbon transactions are generated automatically from Purchase, Manufacturing, Expense and Fleet records." />
            <Toggle on={configs.evidence === "true"} onClick={() => updateConfig("evidence", configs.evidence === "true" ? "false" : "true")} label="Evidence requirement" desc="CSR activity participation cannot be approved without an attached proof file." />
            <Toggle on={configs.badgeAuto === "true"} onClick={() => updateConfig("badgeAuto", configs.badgeAuto === "true" ? "false" : "true")} label="Badge auto-award" desc="Badges are assigned automatically the moment an employee's XP or challenge count satisfies the unlock rule." />
          </div>
        </div>
      )}

      {tab === "Notification settings" && (
        <div className="panel">
          <SectionTitle eyebrow="Alerts" title="What triggers a notification" />
          <div className="stack-sm">
            <Toggle on={configs.notifIssue === "true"} onClick={() => updateConfig("notifIssue", configs.notifIssue === "true" ? "false" : "true")} label="New compliance issue raised" />
            <Toggle on={configs.notifApproval === "true"} onClick={() => updateConfig("notifApproval", configs.notifApproval === "true" ? "false" : "true")} label="CSR / challenge approval decisions" />
            <Toggle on={configs.notifPolicy === "true"} onClick={() => updateConfig("notifPolicy", configs.notifPolicy === "true" ? "false" : "true")} label="Policy acknowledgement reminders" />
            <Toggle on={configs.notifBadge === "true"} onClick={() => updateConfig("notifBadge", configs.notifBadge === "true" ? "false" : "true")} label="Badge unlocked" />
          </div>
        </div>
      )}
    </div>
  );
}
