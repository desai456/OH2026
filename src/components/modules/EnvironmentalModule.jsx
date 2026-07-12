import React, { useState, useEffect } from "react";
import { Plus, Download, X } from "lucide-react";
import { COLORS } from "../../constants/config";
import {
  getEnvironmentalGoals, createEnvironmentalGoal,
  getEmissionFactors, createEmissionFactor,
  getCarbonTransactions, createCarbonTransaction,
  getProductProfiles
} from "../../constants/api";
import SectionTitle from "../common/SectionTitle";
import DataTable from "../common/DataTable";
import ProgressBar from "../common/ProgressBar";
import StatusPill from "../common/StatusPill";
import Pill from "../common/Pill";

export default function EnvironmentalModule({ tab, onRefresh }) {
  const [goals, setGoals] = useState([]);
  const [factors, setFactors] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);

  // Modals state
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showFactorModal, setShowFactorModal] = useState(false);

  // Form states
  const [goalForm, setGoalForm] = useState({ name: "", dept: "Manufacturing", target: 100, current: 0, unit: "t CO₂e", deadline: "31 Dec 2026" });
  const [factorForm, setFactorForm] = useState({ category: "", unit: "litre", factor: "", source: "", status: "Active" });

  const loadAll = async () => {
    try {
      const g = await getEnvironmentalGoals();
      setGoals(g);
      const f = await getEmissionFactors();
      setFactors(f);
      const t = await getCarbonTransactions();
      setTransactions(t);
      const p = await getProductProfiles();
      setProducts(p);
    } catch (e) {
      console.error("Error loading environmental data:", e);
    }
  };

  useEffect(() => {
    loadAll();
  }, [tab]);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      await createEnvironmentalGoal(goalForm);
      setShowGoalModal(false);
      loadAll();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddFactor = async (e) => {
    e.preventDefault();
    try {
      await createEmissionFactor(factorForm);
      setShowFactorModal(false);
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExportCSV = () => {
    if (!goals || goals.length === 0) return;
    const headers = ["Goal", "Department", "Target", "Current Progress", "Unit", "Deadline", "Status"];
    const rows = goals.map(g => [
      g.name,
      g.dept,
      g.target,
      g.current,
      g.unit,
      g.deadline,
      g.status
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map(row => 
        row.map(val => {
          let cleanVal = val === null || val === undefined ? '' : String(val);
          cleanVal = cleanVal.replace(/"/g, '""');
          if (cleanVal.includes(",") || cleanVal.includes('"') || cleanVal.includes("\n")) {
            cleanVal = `"${cleanVal}"`;
          }
          return cleanVal;
        }).join(",")
      )
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "environmental_goals.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="stack-lg">
      <SectionTitle eyebrow="Environmental" title={tab} />

      {tab === "Environmental goals" && (
        <div className="panel">
          <div className="panel-toolbar">
            <button className="btn-primary" style={{ background: COLORS.env }} onClick={() => setShowGoalModal(true)}><Plus size={14} /> New goal</button>
            <div className="spacer" />
            <button className="btn-ghost" onClick={handleExportCSV}><Download size={14} /> Export</button>
          </div>
          <DataTable
            columns={["Goal", "Department", "Target", "Progress", "Deadline", "Status"]}
            rows={goals}
            renderCell={(r, c) => {
              if (c === "Goal") return <span className="cell-strong">{r.name}</span>;
              if (c === "Department") return r.dept;
              if (c === "Target") return <span className="mono">{r.current} / {r.target} {r.unit}</span>;
              if (c === "Progress") return (
                <div className="progress-cell">
                  <ProgressBar pct={(r.current / r.target) * 100} tone="env" />
                  <span className="mono progress-pct">{Math.round((r.current / r.target) * 100)}%</span>
                </div>
              );
              if (c === "Deadline") return r.deadline;
              if (c === "Status") return <StatusPill status={r.status} />;
              return null;
            }}
          />

          {showGoalModal && (
            <div className="modal-overlay" style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center",
              justifyContent: "center", zIndex: 1000
            }}>
              <div className="panel" style={{ width: "420px", padding: "24px", position: "relative" }}>
                <button style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", cursor: "pointer" }} onClick={() => setShowGoalModal(false)}>
                  <X size={18} />
                </button>
                <SectionTitle eyebrow="Environmental" title="Add Sustainability Goal" />
                <form onSubmit={handleAddGoal} className="stack-md" style={{ marginTop: "16px" }}>
                  <label className="filter-field">
                    <span>Goal Name</span>
                    <input type="text" required value={goalForm.name} onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })} />
                  </label>
                  <label className="filter-field">
                    <span>Department</span>
                    <select value={goalForm.dept} onChange={(e) => setGoalForm({ ...goalForm, dept: e.target.value })}>
                      <option>Manufacturing</option>
                      <option>Sales</option>
                      <option>Logistics</option>
                      <option>Corporate</option>
                      <option>R&D</option>
                    </select>
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <label className="filter-field">
                      <span>Target Value</span>
                      <input type="number" required value={goalForm.target} onChange={(e) => setGoalForm({ ...goalForm, target: Number(e.target.value) })} />
                    </label>
                    <label className="filter-field">
                      <span>Current Progress</span>
                      <input type="number" required value={goalForm.current} onChange={(e) => setGoalForm({ ...goalForm, current: Number(e.target.value) })} />
                    </label>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <label className="filter-field">
                      <span>Unit (e.g. t CO₂e)</span>
                      <input type="text" required value={goalForm.unit} onChange={(e) => setGoalForm({ ...goalForm, unit: e.target.value })} />
                    </label>
                    <label className="filter-field">
                      <span>Deadline</span>
                      <input type="text" required value={goalForm.deadline} onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })} />
                    </label>
                  </div>
                  <button type="submit" className="btn-primary" style={{ background: COLORS.env, width: "100%", marginTop: "8px" }}>Save Goal</button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "Emission factors" && (
        <div className="panel">
          <div className="panel-toolbar">
            <button className="btn-primary" style={{ background: COLORS.env }} onClick={() => setShowFactorModal(true)}><Plus size={14} /> New factor</button>
          </div>
          <DataTable
            columns={["Category", "Unit", "Emission factor", "Source", "Status"]}
            rows={factors}
            renderCell={(r, c) => {
              if (c === "Category") return <span className="cell-strong">{r.category}</span>;
              if (c === "Emission factor") return <span className="mono">{r.factor}</span>;
              if (c === "Status") return <StatusPill status={r.status} />;
              return r[c === "Unit" ? "unit" : "source"];
            }}
          />

          {showFactorModal && (
            <div className="modal-overlay" style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center",
              justifyContent: "center", zIndex: 1000
            }}>
              <div className="panel" style={{ width: "420px", padding: "24px", position: "relative" }}>
                <button style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", cursor: "pointer" }} onClick={() => setShowFactorModal(false)}>
                  <X size={18} />
                </button>
                <SectionTitle eyebrow="Environmental" title="Add Emission Factor" />
                <form onSubmit={handleAddFactor} className="stack-md" style={{ marginTop: "16px" }}>
                  <label className="filter-field">
                    <span>Category</span>
                    <input type="text" required placeholder="e.g. Diesel (fleet)" value={factorForm.category} onChange={(e) => setFactorForm({ ...factorForm, category: e.target.value })} />
                  </label>
                  <label className="filter-field">
                    <span>Unit</span>
                    <input type="text" required placeholder="e.g. litre, kWh" value={factorForm.unit} onChange={(e) => setFactorForm({ ...factorForm, unit: e.target.value })} />
                  </label>
                  <label className="filter-field">
                    <span>Factor Value (e.g. 2.68 kg CO₂e)</span>
                    <input type="text" required value={factorForm.factor} onChange={(e) => setFactorForm({ ...factorForm, factor: e.target.value })} />
                  </label>
                  <label className="filter-field">
                    <span>Source</span>
                    <input type="text" required placeholder="e.g. DEFRA 2026" value={factorForm.source} onChange={(e) => setFactorForm({ ...factorForm, source: e.target.value })} />
                  </label>
                  <button type="submit" className="btn-primary" style={{ background: COLORS.env, width: "100%", marginTop: "8px" }}>Save Factor</button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "Carbon transactions" && (
        <div className="panel">
          <div className="mini-note" style={{ marginBottom: 12 }}>Auto emission calculation is active. Transactions marked <strong>Auto</strong> were generated from linked Purchase, Manufacturing, Expense and Fleet records.</div>
          <DataTable
            columns={["Date", "Department", "Source", "Quantity", "CO₂e", "Entry"]}
            rows={transactions}
            renderCell={(r, c) => {
              if (c === "Date") return r.date;
              if (c === "Department") return r.dept;
              if (c === "Source") return <Pill tone="env">{r.source}</Pill>;
              if (c === "Quantity") return <span className="mono">{r.qty}</span>;
              if (c === "CO₂e") return <span className="mono cell-strong">{r.co2e}</span>;
              if (c === "Entry") return <Pill tone={r.mode === "Auto" ? "env" : "neutral"}>{r.mode}</Pill>;
              return null;
            }}
          />
        </div>
      )}

      {tab === "Product ESG profiles" && (
        <div className="card-grid">
          {products.map((p) => (
            <div className="mini-card" key={p.product}>
              <div className="mini-card-title">{p.product}</div>
              <div className="mini-card-row"><span>Carbon footprint</span><span className="mono">{p.footprint}</span></div>
              <div className="mini-card-row"><span>Recyclable content</span><span className="mono">{p.recyclable}</span></div>
              <div className="mini-card-row"><span>Certification</span><span>{p.cert}</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
