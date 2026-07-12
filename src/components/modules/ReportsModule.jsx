import React, { useState, useEffect } from "react";
import { Filter, Download } from "lucide-react";
import { COLORS, REPORT_TAB_KEY } from "../../constants/config";
import { reportCards } from "../../constants/mockData";
import { 
  generateCustomReport, 
  getDepartments, 
  getEmployees, 
  getChallengesList, 
  getCategories 
} from "../../constants/api";
import SectionTitle from "../common/SectionTitle";
import DataTable from "../common/DataTable";
import StatusPill from "../common/StatusPill";

export default function ReportsModule({ tab, goTo }) {
  const selectedKey = REPORT_TAB_KEY[tab] || "custom";
  
  const [filters, setFilters] = useState({
    department: "All departments",
    date_range: "This quarter",
    module: "All modules",
    employee: "All employees",
    challenge: "All challenges",
    category: "All categories"
  });

  const [deptOpts, setDeptOpts] = useState(["All departments"]);
  const [empOpts, setEmpOpts] = useState(["All employees"]);
  const [challengeOpts, setChallengeOpts] = useState(["All challenges"]);
  const [categoryOpts, setCategoryOpts] = useState(["All categories"]);

  const [reportResults, setReportResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load dropdown options dynamically from the DB
  useEffect(() => {
    async function loadOptions() {
      try {
        const [depts, emps, challenges, categories] = await Promise.all([
          getDepartments(),
          getEmployees(),
          getChallengesList(),
          getCategories()
        ]);
        
        // Filter unique names
        const uniqueDepts = Array.from(new Set(depts.map(d => d.name)));
        const uniqueCats = Array.from(new Set(categories.map(c => c.name)));

        setDeptOpts(["All departments", ...uniqueDepts]);
        setEmpOpts(["All employees", ...emps]);
        setChallengeOpts(["All challenges", ...challenges]);
        setCategoryOpts(["All categories", ...uniqueCats]);
      } catch (err) {
        console.error("Error loading report filter options:", err);
      }
    }
    loadOptions();
  }, []);

  // Update filters automatically when report tab changes
  useEffect(() => {
    let presetModule = "All modules";
    if (tab === "Environmental report") presetModule = "Environmental";
    else if (tab === "Social report") presetModule = "Social";
    else if (tab === "Governance report") presetModule = "Governance";
    
    setFilters(prev => ({
      ...prev,
      module: presetModule
    }));
    
    // Clear results on tab switch so user runs the fresh preset report
    setReportResults(null);
  }, [tab]);

  const runReport = async () => {
    setIsLoading(true);
    try {
      const data = await generateCustomReport(filters);
      setReportResults(data.records);
    } catch (e) {
      alert(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Run automatically when the tab changes or module changes (so they don't have to manually click Run for pre-packaged reports)
  useEffect(() => {
    runReport();
  }, [tab, filters.module]);

  // Export handlers
  const exportPDF = () => {
    if (!reportResults) return;
    const printWindow = window.open("", "_blank");
    const filterList = Object.entries(filters)
      .map(([key, val]) => `<li><strong>${key.replace("_", " ").toUpperCase()}:</strong> ${val}</li>`)
      .join("");

    const tableRows = reportResults
      .map(
        (r) => `
      <tr>
        <td>${r.module}</td>
        <td><strong>${r.metric}</strong></td>
        <td>${r.department || r.employee || "—"}</td>
        <td>${r.value}</td>
        <td>${r.status}</td>
      </tr>`
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>${tab} - EcoSphere ESG</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 40px; color: #1C231F; }
            h1 { color: #2F6B4F; margin-bottom: 5px; }
            .subtitle { color: #5B655D; margin-bottom: 20px; font-size: 14px; }
            .filters { background: #F6F4EE; padding: 15px; border-radius: 6px; margin-bottom: 30px; font-size: 13px; border: 1px solid #DFDACD; }
            .filters ul { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #DFDACD; padding: 12px; text-align: left; font-size: 13px; }
            th { background-color: #FBFAF5; font-weight: 600; color: #3D4A78; }
            tr:nth-child(even) { background-color: #FBFAF5; }
            .footer { margin-top: 40px; font-size: 11px; color: #5B655D; text-align: center; border-top: 1px solid #DFDACD; padding-top: 15px; }
          </style>
        </head>
        <body>
          <h1>${tab}</h1>
          <div class="subtitle">Generated on ${new Date().toLocaleDateString()} | EcoSphere ESG Management Platform</div>
          
          <div class="filters">
            <strong>Applied Filters:</strong>
            <ul>${filterList}</ul>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Module</th>
                <th>Metric</th>
                <th>Department / Employee</th>
                <th>Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows.length > 0 ? tableRows : '<tr><td colspan="5" style="text-align:center;">No records found</td></tr>'}
            </tbody>
          </table>
          
          <div class="footer">
            Confidential - Internal ESG Report
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const exportCSV = () => {
    if (!reportResults) return;
    const headers = ["Module", "Metric", "Department / Employee", "Value", "Status"];
    const rows = reportResults.map((r) => [
      r.module,
      r.metric,
      r.department || r.employee || "—",
      r.value,
      r.status,
    ]);

    const csvContent = [headers, ...rows]
      .map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${tab.toLowerCase().replace(/ /g, "_")}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExcel = () => {
    if (!reportResults) return;
    const tableRows = reportResults
      .map(
        (r) => `
      <tr>
        <td>${r.module}</td>
        <td>${r.metric}</td>
        <td>${r.department || r.employee || "—"}</td>
        <td>${r.value}</td>
        <td>${r.status}</td>
      </tr>`
      )
      .join("");

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>${tab.substring(0, 30)}</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th style="background-color: #2F6B4F; color: #ffffff; font-weight: bold;">Module</th>
              <th style="background-color: #2F6B4F; color: #ffffff; font-weight: bold;">Metric</th>
              <th style="background-color: #2F6B4F; color: #ffffff; font-weight: bold;">Department / Employee</th>
              <th style="background-color: #2F6B4F; color: #ffffff; font-weight: bold;">Value</th>
              <th style="background-color: #2F6B4F; color: #ffffff; font-weight: bold;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${tab.toLowerCase().replace(/ /g, "_")}_${new Date().toISOString().split("T")[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="stack-lg">
      <SectionTitle eyebrow="Reports" title={tab} />
      
      {/* Quick Select Cards */}
      <div className="card-grid">
        {reportCards.map((r) => {
          const Icon = r.icon;
          const color = { env: COLORS.env, social: COLORS.social, gov: COLORS.gov, game: COLORS.game }[r.tone];
          const isSelected = r.key === selectedKey;
          
          // Map card key back to the correct tab title in sidebar
          const tabTitle = Object.keys(REPORT_TAB_KEY).find(key => REPORT_TAB_KEY[key] === r.key) || "Custom report builder";

          return (
            <div 
              className="mini-card hover-lift" 
              key={r.key} 
              style={{
                borderColor: isSelected ? color : COLORS.line, 
                borderWidth: isSelected ? 2 : 1,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onClick={() => goTo("reports", tabTitle)}
            >
              <span className="activity-icon" style={{ background: `${color}1A`, color, marginBottom: 10, display: "inline-flex", width: "30px", height: "30px", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>
                ✦
              </span>
              <div className="mini-card-title">{r.title}</div>
              <div className="mini-card-sub">{r.desc}</div>
              <button 
                className="btn-outline-full" 
                style={{ 
                  borderColor: color, 
                  color: isSelected ? "#fff" : color,
                  backgroundColor: isSelected ? color : "transparent",
                  marginTop: 10 
                }}
              >
                {isSelected ? "Active" : "Select Report"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Filter and Report Builder Panel */}
      <div className="panel">
        <SectionTitle eyebrow="Report Filters" title="Customize parameters" />
        
        <div className="filter-grid">
          <label className="filter-field">
            <span>Department</span>
            <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })}>
              {deptOpts.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>

          <label className="filter-field">
            <span>Date range</span>
            <select value={filters.date_range} onChange={(e) => setFilters({ ...filters, date_range: e.target.value })}>
              <option value="This quarter">This quarter</option>
              <option value="This month">This month</option>
              <option value="Last 12 months">Last 12 months</option>
              <option value="All">All time</option>
            </select>
          </label>

          <label className="filter-field">
            <span>Module</span>
            <select 
              value={filters.module} 
              onChange={(e) => setFilters({ ...filters, module: e.target.value })}
              disabled={tab !== "Custom report builder" && tab !== "ESG summary"}
            >
              <option value="All modules">All modules</option>
              <option value="Environmental">Environmental</option>
              <option value="Social">Social</option>
              <option value="Governance">Governance</option>
              <option value="Gamification">Gamification</option>
            </select>
          </label>

          <label className="filter-field">
            <span>Employee</span>
            <select value={filters.employee} onChange={(e) => setFilters({ ...filters, employee: e.target.value })}>
              {empOpts.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>

          <label className="filter-field">
            <span>Challenge</span>
            <select value={filters.challenge} onChange={(e) => setFilters({ ...filters, challenge: e.target.value })}>
              {challengeOpts.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>

          <label className="filter-field">
            <span>ESG category</span>
            <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
              {categoryOpts.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
        </div>

        <div className="panel-toolbar" style={{ marginTop: 18 }}>
          <button className="btn-primary" style={{ background: COLORS.ink }} onClick={runReport} disabled={isLoading}>
             {isLoading ? "Running..." : "Run report"}
          </button>
          
          <div className="spacer" />
          
          {reportResults && reportResults.length > 0 && (
            <>
              <button className="btn-ghost" onClick={exportPDF}><Download size={14} /> PDF</button>
              <button className="btn-ghost" onClick={exportExcel}><Download size={14} /> Excel</button>
              <button className="btn-ghost" onClick={exportCSV}><Download size={14} /> CSV</button>
            </>
          )}
        </div>

        {reportResults && (
          <div style={{ marginTop: "24px" }}>
            <SectionTitle title={`${tab} Results`} />
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
