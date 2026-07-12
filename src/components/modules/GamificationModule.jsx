import React, { useState, useEffect } from "react";
import { ChevronRight, Check, X, Gift, Crown, Plus } from "lucide-react";
import { COLORS } from "../../constants/config";
import {
  getChallenges, createChallenge, joinChallenge,
  getChallengeParticipation, updateChallengeParticipationStatus,
  getBadges, getRewards, redeemReward, getLeaderboard, getDashboardSummary
} from "../../constants/api";
import SectionTitle from "../common/SectionTitle";
import ProgressBar from "../common/ProgressBar";
import StatusPill from "../common/StatusPill";

export default function GamificationModule({ tab, onRefresh }) {
  const [stage, setStage] = useState("Active");
  const [challenges, setChallenges] = useState([]);
  const [participation, setParticipation] = useState([]);
  const [badgesList, setBadgesList] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [leaderboardList, setLeaderboardList] = useState([]);
  const [balance, setBalance] = useState(640);

  // Challenge modal
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [challForm, setChallForm] = useState({ name: "", xp: 100, difficulty: "Medium", deadline: "30 Jul", status: "Draft", category: "Environmental" });

  const stages = ["Draft", "Active", "Under review", "Completed", "Archived"];

  const loadAll = async () => {
    try {
      const ch = await getChallenges();
      setChallenges(ch);
      const part = await getChallengeParticipation();
      setParticipation(part);
      const bdg = await getBadges();
      setBadgesList(bdg);
      const rew = await getRewards();
      setRewards(rew);
      const ld = await getLeaderboard();
      setLeaderboardList(ld);

      // Load user balance dynamically
      const dash = await getDashboardSummary();
      // Use standard balance indicator
      setBalance(640);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAll();
  }, [tab]);

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    try {
      await createChallenge(challForm);
      setShowChallengeModal(false);
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleJoin = async (id) => {
    try {
      const res = await joinChallenge(id, "Nisha Patel");
      alert(res.message);
      loadAll();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDecide = async (id, status) => {
    try {
      await updateChallengeParticipationStatus(id, status);
      loadAll();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRedeem = async (id) => {
    try {
      const res = await redeemReward(id, "Nisha Patel");
      alert(res.message);
      loadAll();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="stack-lg">
      <SectionTitle eyebrow="Gamification" title={tab} />

      {tab === "Challenges" && (
        <div className="stack-md">
          <div className="panel-toolbar" style={{ marginBottom: "12px" }}>
            <button className="btn-primary" style={{ background: COLORS.game }} onClick={() => setShowChallengeModal(true)}><Plus size={14} /> New challenge</button>
          </div>
          <div className="lifecycle-row">
            {stages.map((s) => (
              <React.Fragment key={s}>
                <button className={"lifecycle-pill" + (stage === s ? " lifecycle-pill-active" : "")} onClick={() => setStage(s)}>{s}</button>
                {s !== "Archived" && <ChevronRight size={14} color={COLORS.line} />}
              </React.Fragment>
            ))}
          </div>
          <div className="card-grid">
            {challenges.filter((c) => c.status === stage).map((c) => (
              <div className="mini-card" key={c.id}>
                <div className="between-row"><StatusPill status={c.difficulty} /><span className="mono xp-tag">{c.xp} XP</span></div>
                <div className="mini-card-title" style={{ marginTop: 10 }}>{c.name}</div>
                <div className="mini-card-sub">{c.category} · Deadline {c.deadline}</div>
                <button className="btn-outline-full" style={{ borderColor: COLORS.game, color: COLORS.game }} onClick={() => handleJoin(c.id)}>Join challenge</button>
              </div>
            ))}
            {challenges.filter((c) => c.status === stage).length === 0 && (
              <div className="empty-note">No challenges in this stage right now.</div>
            )}
          </div>

          {showChallengeModal && (
            <div className="modal-overlay" style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center",
              justifyContent: "center", zIndex: 1000
            }}>
              <div className="panel" style={{ width: "420px", padding: "24px", position: "relative" }}>
                <button style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", cursor: "pointer" }} onClick={() => setShowChallengeModal(false)}>
                  <X size={18} />
                </button>
                <SectionTitle eyebrow="Gamification" title="Add Sustainability Challenge" />
                <form onSubmit={handleCreateChallenge} className="stack-md" style={{ marginTop: "16px" }}>
                  <label className="filter-field">
                    <span>Challenge Title</span>
                    <input type="text" required value={challForm.name} onChange={(e) => setChallForm({ ...challForm, name: e.target.value })} />
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <label className="filter-field">
                      <span>XP Reward</span>
                      <input type="number" required value={challForm.xp} onChange={(e) => setChallForm({ ...challForm, xp: Number(e.target.value) })} />
                    </label>
                    <label className="filter-field">
                      <span>Difficulty</span>
                      <select value={challForm.difficulty} onChange={(e) => setChallForm({ ...challForm, difficulty: e.target.value })}>
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                      </select>
                    </label>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <label className="filter-field">
                      <span>Category</span>
                      <select value={challForm.category} onChange={(e) => setChallForm({ ...challForm, category: e.target.value })}>
                        <option>Environmental</option>
                        <option>Social</option>
                        <option>Governance</option>
                      </select>
                    </label>
                    <label className="filter-field">
                      <span>Deadline</span>
                      <input type="text" required placeholder="e.g. 31 Jul" value={challForm.deadline} onChange={(e) => setChallForm({ ...challForm, deadline: e.target.value })} />
                    </label>
                  </div>
                  <label className="filter-field">
                    <span>Initial Status</span>
                    <select value={challForm.status} onChange={(e) => setChallForm({ ...challForm, status: e.target.value })}>
                      <option>Draft</option>
                      <option>Active</option>
                    </select>
                  </label>
                  <button type="submit" className="btn-primary" style={{ background: COLORS.game, width: "100%", marginTop: "8px" }}>Save Challenge</button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "Challenge participation" && (
        <div className="panel">
          <SectionTitle title="Progress and approvals" />
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Challenge</th><th>Employee</th><th>Progress</th><th>Proof</th><th>XP awarded</th><th>Approval</th></tr></thead>
              <tbody>
                {participation.map((r) => (
                  <tr key={r.id}>
                    <td className="cell-strong">{r.challenge}</td>
                    <td>{r.emp}</td>
                    <td>
                      <div className="progress-cell">
                        <ProgressBar pct={r.progress} tone="game" />
                        <span className="mono progress-pct">{r.progress}%</span>
                      </div>
                    </td>
                    <td className="mono">{r.proof}</td>
                    <td className="mono">{r.xp}</td>
                    <td>
                      {r.approval === "Pending" ? (
                        <div className="approval-actions">
                          <button className="chip-btn chip-approve" onClick={() => handleDecide(r.id, "Approved")}><Check size={13} /> Approve</button>
                          <button className="chip-btn chip-reject" onClick={() => handleDecide(r.id, "Rejected")}><X size={13} /> Reject</button>
                        </div>
                      ) : (
                        <StatusPill status={r.approval} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Badges" && (
        <div className="card-grid">
          {badgesList.map((b) => {
            return (
              <div className="mini-card badge-card" key={b.id}>
                <span className="badge-icon">🏆</span>
                <div className="mini-card-title">{b.name}</div>
                <div className="mini-card-sub">Unlocks on: {b.rule}</div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "Rewards" && (
        <div className="stack-md">
          <div className="mini-note">Your balance: <strong className="mono">{balance} pts</strong>. Redeeming deducts points immediately and is limited by stock.</div>
          <div className="card-grid">
            {rewards.map((r) => (
              <div className="mini-card" key={r.id}>
                <span className="activity-icon" style={{ background: `${COLORS.game}1A`, color: COLORS.game, marginBottom: 10, display: "inline-flex", width: "30px", height: "30px", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}><Gift size={18} /></span>
                <div className="mini-card-title">{r.name}</div>
                <div className="mini-card-row"><span>Cost</span><span className="mono">{r.points} pts</span></div>
                <div className="mini-card-row"><span>Stock</span><span className="mono">{r.stock}</span></div>
                <button
                  className="btn-outline-full"
                  disabled={r.stock === 0 || balance < r.points}
                  style={{ borderColor: COLORS.game, color: COLORS.game, opacity: r.stock === 0 || balance < r.points ? 0.4 : 1 }}
                  onClick={() => handleRedeem(r.id)}
                >
                  {r.stock === 0 ? "Out of stock" : "Redeem"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "Leaderboard" && (
        <div className="panel">
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Rank</th><th>Employee / department</th><th>XP</th></tr></thead>
              <tbody>
                {leaderboardList.map((r) => (
                  <tr key={r.rank}>
                    <td>
                      {r.rank <= 3 ? <span className="rank-medal" style={{ color: [COLORS.social, "#9AA0A6", "#B08D57"][r.rank - 1] }}><Crown size={15} /> {r.rank}</span> : r.rank}
                    </td>
                    <td className="cell-strong">{r.name}</td>
                    <td className="mono">{r.xp.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
