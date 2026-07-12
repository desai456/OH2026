import React, { useState, useEffect } from "react";
import { Gavel, Plus, Download, Check, X } from "lucide-react";
import { COLORS } from "../../constants/config";
import {
  getPolicies, getPolicyAcknowledgements,
  getAudits, createAudit,
  getComplianceIssues, createComplianceIssue, resolveComplianceIssue
} from "../../constants/api";
import SectionTitle from "../common/SectionTitle";
import ProgressBar from "../common/ProgressBar";
import DataTable from "../common/DataTable";
import StatusPill from "../common/StatusPill";

export default function GovernanceModule({ tab, onRefresh }) {
  const [policies, setPolicies] = useState([]);
  const [policyAck, setPolicyAck] = useState([]);
  const [audits, setAudits] = useState([]);
  const [issues, setIssues] = useState([]);

  // Modals state
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);

  // Form states
  const [auditForm, setAuditForm] = useState({ title: "", dept: "Manufacturing", auditor: "", date: "12 Jul 2026", findings: "", status: "Completed" });
  const [issueForm, setIssueForm] = useState({ issue: "", severity: "High", dept: "Manufacturing", owner: "", due: "2026-07-25", status: "Open" });

  const loadAll = async () => {
    try {
      const pol = await getPolicies();
      setPolicies(pol);
      const ack = await getPolicyAcknowledgements();
      setPolicyAck(ack);
      const aud = await getAudits();
      setAudits(aud);
      const iss = await getComplianceIssues();
      setIssues(iss);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAll();
  }, [tab]);

  const handleCreateAudit = async (e) => {
    e.preventDefault();
    try {
      await createAudit(auditForm);
      setShowAuditModal(false);
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    try {
      await createComplianceIssue(issueForm);
      setShowIssueModal(false);
      loadAll();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleResolve = async (id) => {
    try {
      await resolveComplianceIssue(id);
      loadAll();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="stack-lg">
      <SectionTitle eyebrow="Governance" title={tab} />

      {tab === "Policies" && (
        <div className="card-grid">
          {policies.map((p) => (
            <div className="mini-card" key={p.id}>
              <span className="activity-icon" style={{ background: `${COLORS.gov}1A`, color: COLORS.gov, marginBottom: 10, display: "inline-flex", width: "30px", height: "30px", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}><Gavel size={18} /></span>
              <div className="mini-card-title">{p.name}</div>
              <div className="mini-card-row"><span>Owner</span><span>{p.owner}</span></div>
              <div className="mini-card-row"><span>Version</span><span className="mono">{p.version}</span></div>
              <div className="mini-card-row"><span>Updated</span><span>{p.updated}</span></div>
            </div>
          ))}
        </div>
      )}

      {tab === "Policy acknowledgements" && (
        <div className="panel">
          <SectionTitle title="Acknowledgement by department" />
          <div className="stack-md">
            {policyAck.map((d) => (
              <div key={d.id}>
                <div className="between-row"><span>{d.dept}</span><span className="mono">{d.acknowledged}%</span></div>
                <ProgressBar pct={d.acknowledged} tone="gov" />
              </div>
            ))}
          </div>
          <div className="mini-note" style={{ marginTop: 16 }}>Reminders are sent automatically to employees who haven’t acknowledged a policy — configurable in Settings → Notification settings.</div>
        </div>
      )}

      {tab === "Audits" && (
        <div className="panel">
          <div className="panel-toolbar">
            <button className="btn-primary" style={{ background: COLORS.gov }} onClick={() => setShowAuditModal(true)}><Plus size={14} /> New audit</button>
            <div className="spacer" />
            <button className="btn-ghost"><Download size={14} /> Export</button>
          </div>
          <DataTable
            columns={["Title", "Department", "Auditor", "Date", "Findings", "Status"]}
            rows={audits}
            renderCell={(r, c) => {
              if (c === "Title") return <span className="cell-strong">{r.title}</span>;
              if (c === "Department") return r.dept;
              if (c === "Auditor") return r.auditor;
              if (c === "Date") return r.date;
              if (c === "Findings") return r.findings;
              if (c === "Status") return <StatusPill status={r.status} />;
              return null;
            }}
          />

          {showAuditModal && (
            <div className="modal-overlay" style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center",
              justifyContent: "center", zIndex: 1000
            }}>
              <div className="panel" style={{ width: "420px", padding: "24px", position: "relative" }}>
                <button style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", cursor: "pointer" }} onClick={() => setShowAuditModal(false)}>
                  <X size={18} />
                </button>
                <SectionTitle eyebrow="Governance" title="Add Governance Audit" />
                <form onSubmit={handleCreateAudit} className="stack-md" style={{ marginTop: "16px" }}>
                  <label className="filter-field">
                    <span>Audit Title</span>
                    <input type="text" required value={auditForm.title} onChange={(e) => setAuditForm({ ...auditForm, title: e.target.value })} />
                  </label>
                  <label className="filter-field">
                    <span>Department</span>
                    <select value={auditForm.dept} onChange={(e) => setAuditForm({ ...auditForm, dept: e.target.value })}>
                      <option>Manufacturing</option>
                      <option>Sales</option>
                      <option>Logistics</option>
                      <option>Corporate</option>
                      <option>R&D</option>
                    </select>
                  </label>
                  <label className="filter-field">
                    <span>Auditor Name</span>
                    <input type="text" required value={auditForm.auditor} onChange={(e) => setAuditForm({ ...auditForm, auditor: e.target.value })} />
                  </label>
                  <label className="filter-field">
                    <span>Findings / Notes</span>
                    <input type="text" value={auditForm.findings} onChange={(e) => setAuditForm({ ...auditForm, findings: e.target.value })} />
                  </label>
                  <button type="submit" className="btn-primary" style={{ background: COLORS.gov, width: "100%", marginTop: "8px" }}>Save Audit</button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "Compliance issues" && (
        <div className="panel">
          <div className="panel-toolbar">
            <button className="btn-primary" style={{ background: COLORS.gov }} onClick={() => setShowIssueModal(true)}><Plus size={14} /> New compliance issue</button>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Issue</th><th>Severity</th><th>Department</th><th>Owner</th><th>Due</th><th>Status</th></tr>
              </thead>
              <tbody>
                {issues.map((r) => (
                  <tr key={r.id}>
                    <td className="cell-strong">{r.issue}</td>
                    <td><StatusPill status={r.severity} /></td>
                    <td>{r.dept}</td>
                    <td>{r.owner}</td>
                    <td className="mono">{r.due}</td>
                    <td>
                      {r.status === "Open" ? (
                        <button className="chip-btn chip-approve" onClick={() => handleResolve(r.id)}><Check size={13} /> Mark resolved</button>
                      ) : (
                        <StatusPill status={r.status} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showIssueModal && (
            <div className="modal-overlay" style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center",
              justifyContent: "center", zIndex: 1000
            }}>
              <div className="panel" style={{ width: "420px", padding: "24px", position: "relative" }}>
                <button style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", cursor: "pointer" }} onClick={() => setShowIssueModal(false)}>
                  <X size={18} />
                </button>
                <SectionTitle eyebrow="Governance" title="Add Compliance Issue" />
                <form onSubmit={handleCreateIssue} className="stack-md" style={{ marginTop: "16px" }}>
                  <label className="filter-field">
                    <span>Issue Description</span>
                    <input type="text" required value={issueForm.issue} onChange={(e) => setIssueForm({ ...issueForm, issue: e.target.value })} />
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <label className="filter-field">
                      <span>Severity</span>
                      <select value={issueForm.severity} onChange={(e) => setIssueForm({ ...issueForm, severity: e.target.value })}>
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                      </select>
                    </label>
                    <label className="filter-field">
                      <span>Department</span>
                      <select value={issueForm.dept} onChange={(e) => setIssueForm({ ...issueForm, dept: e.target.value })}>
                        <option>Manufacturing</option>
                        <option>Sales</option>
                        <option>Logistics</option>
                        <option>Corporate</option>
                        <option>R&D</option>
                      </select>
                    </label>
                  </div>
                  <label className="filter-field">
                    <span>Owner / Assignee</span>
                    <input type="text" required value={issueForm.owner} onChange={(e) => setIssueForm({ ...issueForm, owner: e.target.value })} />
                  </label>
                  <label className="filter-field">
                    <span>Due Date (YYYY-MM-DD)</span>
                    <input type="text" required value={issueForm.due} onChange={(e) => setIssueForm({ ...issueForm, due: e.target.value })} />
                  </label>
                  <button type="submit" className="btn-primary" style={{ background: COLORS.gov, width: "100%", marginTop: "8px" }}>Raise Issue</button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
