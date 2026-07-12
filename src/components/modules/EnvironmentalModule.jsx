import React, { useState, useEffect, useMemo } from "react";
import { Plus, Download, X, BrainCircuit, RefreshCw, Gauge, BarChart } from "lucide-react";
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from "recharts";
import { COLORS } from "../../constants/config";
import {
  getEnvironmentalGoals, createEnvironmentalGoal,
  getEmissionFactors, createEmissionFactor,
  getCarbonTransactions, createCarbonTransaction,
  getProductProfiles, getEmissionsForecast, trainEmissionsModel
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

  // ML Forecasting state
  const [forecastData, setForecastData] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [trainingModel, setTrainingModel] = useState(false);

  const loadForecast = async () => {
    setLoadingForecast(true);
    try {
      const data = await getEmissionsForecast();
      setForecastData(data);
    } catch (err) {
      console.error("Error loading emissions forecast:", err);
    } finally {
      setLoadingForecast(false);
    }
  };

  const handleRetrain = async () => {
    setTrainingModel(true);
    try {
      const res = await trainEmissionsModel();
      alert(`Model trained successfully!\nBest Model: ${res.modelName}\nMAE: ${res.metrics.mae} t CO₂e\nMAPE: ${res.metrics.mape}%`);
      loadForecast();
    } catch (err) {
      alert("Error training model: " + err.message);
    } finally {
      setTrainingModel(false);
    }
  };

  useEffect(() => {
    loadAll();
    if (tab === "Emissions forecast (ML)") {
      loadForecast();
    }
  }, [tab]);

  const chartData = useMemo(() => {
    if (!forecastData) return [];
    const historyToDisplay = forecastData.history.slice(-12);
    const formattedHistory = historyToDisplay.map(item => ({
      month: item.month,
      actual: item.value,
      forecast: null
    }));
    const bridgePoint = forecastData.bridge ? {
      month: forecastData.bridge.month,
      actual: forecastData.bridge.value,
      forecast: forecastData.bridge.value
    } : null;
    const formattedForecast = forecastData.forecast.map(item => ({
      month: item.month,
      actual: null,
      forecast: item.value
    }));
    if (bridgePoint && formattedHistory.length > 0) {
      formattedHistory[formattedHistory.length - 1] = bridgePoint;
    }
    return [...formattedHistory, ...formattedForecast];
  }, [forecastData]);

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

      {tab === "Emissions forecast (ML)" && (
        <div className="stack-lg">
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .spin {
              animation: spin 1.2s linear infinite;
            }
          `}</style>
          
          {loadingForecast || !forecastData ? (
            <div className="empty-note">Loading emissions forecast model data...</div>
          ) : (
            <>
              {/* Metrics Grid */}
              <div className="grid-2" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: "18px" }}>
                <div className="panel" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: "6px" }}><Gauge size={12} color={COLORS.social} /> Mean Absolute Error (MAE)</div>
                  <div className="mono" style={{ fontSize: "24px", fontWeight: "600", color: COLORS.social }}>{forecastData.metrics.mae} t CO₂e</div>
                  <div className="mini-note">Average prediction error margin on validation datasets. Lower is better.</div>
                </div>
                <div className="panel" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: "6px" }}><BarChart size={12} color={COLORS.env} /> MAPE Error Percentage</div>
                  <div className="mono" style={{ fontSize: "24px", fontWeight: "600", color: COLORS.env }}>{forecastData.metrics.mape}%</div>
                  <div className="mini-note">Average percentage deviation of the forecast from the actual values.</div>
                </div>
                <div className="panel" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: "6px" }}><BrainCircuit size={12} color={COLORS.game} /> Active Algorithm</div>
                  <div style={{ fontSize: "16px", fontWeight: "600", color: COLORS.game, textTransform: "capitalize", margin: "4px 0" }}>{forecastData.modelName.replace("_", " ")}</div>
                  <div className="mini-note">Chosen automatically during model evaluation as the best performer.</div>
                </div>
              </div>

              {/* Chart Panel */}
              <div className="panel">
                <div className="section-title-row">
                  <div>
                    <div className="eyebrow">ML Carbon Forecasting</div>
                    <div className="section-title">Actual vs. Forecasted Emissions (Company-wide)</div>
                  </div>
                  <button 
                    className="btn-ghost" 
                    onClick={handleRetrain} 
                    disabled={trainingModel}
                    style={{ opacity: trainingModel ? 0.6 : 1, display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    <RefreshCw size={13} className={trainingModel ? "spin" : ""} /> {trainingModel ? "Training..." : "Retrain Model"}
                  </button>
                </div>
                <div style={{ height: "300px", marginTop: "20px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} />
                      <XAxis dataKey="month" stroke={COLORS.inkSoft} style={{ fontSize: 11 }} />
                      <YAxis stroke={COLORS.inkSoft} style={{ fontSize: 11 }} label={{ value: "t CO₂e", angle: -90, position: "insideLeft", style: { fontSize: 11 } }} />
                      <Tooltip contentStyle={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 8 }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line type="monotone" dataKey="actual" name="Historical Actual" stroke={COLORS.env} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls={false} />
                      <Line type="monotone" dataKey="forecast" name="ML Predicted Forecast" stroke={COLORS.social} strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Per-Department Forecast Table */}
              <div className="panel">
                <div className="section-title-row">
                  <div>
                    <div className="eyebrow">Detailed Output</div>
                    <div className="section-title">Emissions Forecast per Department (Next 6 Months)</div>
                  </div>
                </div>
                <DataTable
                  columns={["Month", "Department", "Forecasted Carbon (t CO₂e)"]}
                  rows={forecastData.details}
                  renderCell={(r, c) => {
                    if (c === "Month") return r.month;
                    if (c === "Department") return r.department;
                    if (c === "Forecasted Carbon (t CO₂e)") return <span className="mono cell-strong">{r.value} t</span>;
                    return null;
                  }}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
