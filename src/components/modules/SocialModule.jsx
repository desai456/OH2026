import React, { useState, useEffect } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Check, X } from "lucide-react";
import { COLORS } from "../../constants/config";
import {
  getCSRActivities, joinCSRActivity,
  getParticipationQueue, updateParticipationStatus,
  getDiversityDashboard, getTrainingCompletion
} from "../../constants/api";
import SectionTitle from "../common/SectionTitle";
import ProgressBar from "../common/ProgressBar";
import StatusPill from "../common/StatusPill";

export default function SocialModule({ tab, onRefresh }) {
  const [activities, setActivities] = useState([]);
  const [queue, setQueue] = useState([]);
  const [diversityData, setDiversityData] = useState([]);
  const [trainingCompletion, setTrainingCompletion] = useState([]);

  const loadAll = async () => {
    try {
      const act = await getCSRActivities();
      setActivities(act);
      const q = await getParticipationQueue();
      setQueue(q);
      const div = await getDiversityDashboard();
      setDiversityData(div);
      const tr = await getTrainingCompletion();
      setTrainingCompletion(tr);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAll();
  }, [tab]);

  const handleJoin = async (id) => {
    try {
      const res = await joinCSRActivity(id, "Nisha Patel");
      alert(res.message);
      loadAll();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDecide = async (id, status) => {
    try {
      await updateParticipationStatus(id, status);
      loadAll();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="stack-lg">
      <SectionTitle eyebrow="Social" title={tab} />

      {tab === "CSR activities" && (
        <div className="card-grid">
          {activities.map((a) => {
            const color = { env: COLORS.env, social: COLORS.social }[a.tone] || COLORS.social;
            return (
              <div className="mini-card" key={a.id}>
                <span className="activity-icon" style={{ background: `${color}1A`, color, marginBottom: 10, display: "inline-flex", width: "30px", height: "30px", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>✦</span>
                <div className="mini-card-title">{a.name}</div>
                <div className="mini-card-sub">{a.joined} joined · {a.evidence ? "Evidence required" : "Open"}</div>
                <button className="btn-outline-full" style={{ borderColor: color, color }} onClick={() => handleJoin(a.id)}>Join activity</button>
              </div>
            );
          })}
        </div>
      )}

      {tab === "Employee participation" && (
        <div className="panel">
          <SectionTitle title="Approval queue" />
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Employee</th><th>Activity</th><th>Proof</th><th>Points</th><th>Approval</th></tr></thead>
              <tbody>
                {queue.map((r) => (
                  <tr key={r.id}>
                    <td className="cell-strong">{r.emp}</td>
                    <td>{r.activity}</td>
                    <td className="mono">{r.proof}</td>
                    <td className="mono">{r.points}</td>
                    <td>
                      {r.status === "Pending" ? (
                        <div className="approval-actions">
                          <button className="chip-btn chip-approve" onClick={() => handleDecide(r.id, "Approved")}><Check size={13} /> Approve</button>
                          <button className="chip-btn chip-reject" onClick={() => handleDecide(r.id, "Rejected")}><X size={13} /> Reject</button>
                        </div>
                      ) : (
                        <StatusPill status={r.status} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Diversity dashboard" && (
        <div className="grid-2">
          <div className="panel">
            <SectionTitle title="Workforce composition" />
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie data={diversityData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={82} paddingAngle={2}>
                  {diversityData.map((_, i) => (
                    <Cell key={i} fill={[COLORS.social, COLORS.gov, COLORS.line][i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${COLORS.line}`, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="legend-row">
              {diversityData.map((d, i) => (
                <span className="legend-item" key={d.name}>
                  <span className="legend-dot" style={{ background: [COLORS.social, COLORS.gov, COLORS.line][i] }} />
                  {d.name} · {d.value}%
                </span>
              ))}
            </div>
          </div>
          <div className="panel">
            <SectionTitle title="Training completion by department" />
            <div className="stack-md">
              {trainingCompletion.map((d) => (
                <div key={d.dept}>
                  <div className="between-row"><span>{d.dept}</span><span className="mono">{d.pct}%</span></div>
                  <ProgressBar pct={d.pct} tone="social" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
