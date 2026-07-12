import React, { useState } from "react";
import { Filter, Download } from "lucide-react";
import { COLORS, REPORT_TAB_KEY } from "../../constants/config";
import { reportCards } from "../../constants/mockData";
import { generateCustomReport } from "../../constants/api";
import SectionTitle from "../common/SectionTitle";
import DataTable from "../common/DataTable";

export default function ReportsModule({ tab }) {
  const selectedKey = REPORT_TAB_KEY[tab];
  const [filters, setFilters] = useState({
    department: "All departments",
    date_range: "This quarter",
    module: "All modules",
    employee: "All employees",
    challenge: "All challenges",
    category: "All categories"
  });

  const [reportResults, setReportResults] = useState(null);

  const runReport = async () => {
    try {
      const data = await generateCustomReport(filters);
      setReportResults(data.records);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="stack-lg">
      <SectionTitle eyebrow="Reports" title={tab} />
      <div className="card-grid">
        {reportCards.map((r) => {
          const Icon = r.icon;
          const color = { env: COLORS.env, social: COLORS.social, gov: COLORS.gov, game: COLORS.game }[r.tone];
          const isSelected = r.key === selectedKey;
          return (
            <div className="mini-card" key={r.key} style={isSelected ? { borderColor: color, borderWidth: 2 } : {}}>
              <span className="activity-icon" style={{ background: `${color}1A`, color, marginBottom: 10, display: "inline-flex", width: "30px", height: "30px", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>✦</span>
              <div className="mini-card-title">{r.title}</div>
              <div className="mini-card-sub">{r.desc}</div>
              <button className="btn-outline-full" style={{ borderColor: color, color }}>Generate</button>
            </div>
          );
        })}
      </div>

      <div className="panel">
        <SectionTitle eyebrow="Build your own" title="Custom report builder" />
        <div className="filter-grid">
          {[
            ["Department", "department", ["All departments", "Manufacturing", "Sales", "Logistics", "Corporate", "R&D"]],
            ["Date range", "date_range", ["This quarter", "This month", "Last 12 months", "Custom"]],
            ["Module", "module", ["All modules", "Environmental", "Social", "Governance", "Gamification"]],
            ["Employee", "employee", ["All employees", "Aditi Rao", "Karan Shah", "Priya Menon"]],
            ["Challenge", "challenge", ["All challenges", "Sustainability Sprint", "Recycle Challenge"]],
            ["ESG category", "category", ["All categories", "Emissions", "CSR", "Compliance"]],
          ].map(([label, key, opts]) => (
            <label className="filter-field" key={label}>
              <span>{label}</span>
              <select value={filters[key]} onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}>
                {opts.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
          ))}
        </div>
        <div className="panel-toolbar" style={{ marginTop: 18 }}>
          <button className="btn-primary" style={{ background: COLORS.ink }} onClick={runReport}><Filter size={14} /> Run report</button>
          <div className="spacer" />
          <button className="btn-ghost"><Download size={14} /> PDF</button>
          <button className="btn-ghost"><Download size={14} /> Excel</button>
          <button className="btn-ghost"><Download size={14} /> CSV</button>
        </div>

        {reportResults && (
          <div style={{ marginTop: "24px" }}>
            <SectionTitle title="Report Results" />
            {reportResults.length === 0 ? (
              <div className="empty-note">No matching records found for these filters.</div>
            ) : (
              <DataTable
                columns={["Module", "Metric", "Department / Employee", "Value", "Status"]}
                rows={reportResults}
                renderCell={(r, c) => {
                  if (c === "Module") return r.module;
                  if (c === "Metric") return <span className="cell-strong">{r.metric}</span>;
                  if (c === "Department / Employee") return r.department || r.employee || "—";
                  if (c === "Value") return <span className="mono">{r.value}</span>;
                  if (c === "Status") return <StatusPill status={r.status} />;
                  return null;
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
