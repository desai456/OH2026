import React, { useState, useEffect, useCallback } from "react";
import { ChevronRight, Check, X, Gift, Crown, Plus, Wallet, Star, ShoppingBag, Clock, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { COLORS } from "../../constants/config";
import {
  getChallenges, createChallenge, joinChallenge,
  getChallengeParticipation, updateChallengeParticipationStatus,
  getBadges, getRewards, redeemReward, getLeaderboard, getDashboardSummary,
  getEmployeeBalance, getRedemptionHistory, redeemRewardV2, getRewardsEnhanced
} from "../../constants/api";
import SectionTitle from "../common/SectionTitle";
import ProgressBar from "../common/ProgressBar";
import StatusPill from "../common/StatusPill";

// ─── Toast Notification ────────────────────────────────────────────────────
function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [toast, onClose]);
  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <div style={{
      position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
      background: isError ? "#FEF2F2" : "#F0FDF4",
      border: `1px solid ${isError ? "#FCA5A5" : "#86EFAC"}`,
      borderRadius: "12px", padding: "14px 18px", maxWidth: "360px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
      display: "flex", alignItems: "flex-start", gap: "10px",
      animation: "slideUp 0.2s ease",
    }}>
      {isError
        ? <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: "1px" }} />
        : <CheckCircle2 size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: "1px" }} />}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: isError ? "#991B1B" : "#166534" }}>{toast.title}</div>
        <div style={{ fontSize: "12px", color: isError ? "#B91C1C" : "#15803D", marginTop: "2px" }}>{toast.message}</div>
      </div>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: isError ? "#DC2626" : "#16A34A", padding: 0 }}><X size={14} /></button>
      <style>{`@keyframes slideUp { from { transform: translateY(12px); opacity:0; } to { transform: translateY(0); opacity:1; } }`}</style>
    </div>
  );
}

// ─── Confirm Modal ─────────────────────────────────────────────────────────
function ConfirmModal({ reward, balance, onConfirm, onCancel, loading }) {
  if (!reward) return null;
  const canAfford = balance >= reward.points;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 2000, backdropFilter: "blur(2px)",
    }} onClick={onCancel}>
      <div style={{
        background: COLORS.surface, borderRadius: "16px", padding: "32px",
        width: "380px", boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
        border: `1px solid ${COLORS.line}`,
      }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "50%", margin: "0 auto 14px",
            background: `${COLORS.game}18`, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Gift size={26} color={COLORS.game} />
          </div>
          <div style={{ fontSize: "17px", fontWeight: "700", color: COLORS.ink }}>{reward.name}</div>
          <div style={{ fontSize: "13px", color: COLORS.inkSoft, marginTop: "6px" }}>
            This will deduct <strong style={{ color: COLORS.game }}>{reward.points} pts</strong> from your balance.
          </div>
        </div>

        <div style={{
          background: COLORS.surface2, borderRadius: "10px", padding: "14px 16px",
          border: `1px solid ${COLORS.line}`, marginBottom: "20px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: COLORS.inkSoft }}>
            <span>Current balance</span><span style={{ fontWeight: "700", color: COLORS.ink }}>{balance} pts</span>
          </div>
          <div style={{ height: "1px", background: COLORS.line, margin: "10px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: COLORS.inkSoft }}>
            <span>Cost</span><span style={{ fontWeight: "700", color: COLORS.game }}>-{reward.points} pts</span>
          </div>
          <div style={{ height: "1px", background: COLORS.line, margin: "10px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
            <span style={{ fontWeight: "600", color: COLORS.ink }}>Remaining</span>
            <span style={{ fontWeight: "700", color: balance - reward.points >= 0 ? COLORS.good : COLORS.bad }}>
              {balance - reward.points} pts
            </span>
          </div>
        </div>

        {reward.stock <= 3 && reward.stock > 0 && (
          <div style={{
            fontSize: "12px", color: COLORS.warn, fontWeight: "500", textAlign: "center",
            marginBottom: "16px",
          }}>
            ⚠ Only {reward.stock} left in stock!
          </div>
        )}

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onCancel} disabled={loading}
            style={{
              flex: 1, padding: "11px", borderRadius: "9px", border: `1px solid ${COLORS.line}`,
              background: COLORS.surface2, color: COLORS.ink, fontSize: "13px", fontWeight: "600", cursor: "pointer",
            }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading || !canAfford}
            style={{
              flex: 1, padding: "11px", borderRadius: "9px", border: "none",
              background: loading || !canAfford ? COLORS.inkSoft : COLORS.game,
              color: "#fff", fontSize: "13px", fontWeight: "600",
              cursor: loading || !canAfford ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            }}>
            {loading ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Redeeming...</> : "✓ Confirm Redeem"}
          </button>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

// ─── Reward Card ───────────────────────────────────────────────────────────
function RewardCard({ reward, balance, onRedeem }) {
  const canAfford = balance >= reward.points;
  const isOOS = reward.stock === 0;
  const lowStock = !isOOS && reward.stock <= 5;

  return (
    <div style={{
      background: COLORS.surface, borderRadius: "14px",
      border: `1px solid ${isOOS ? COLORS.line : canAfford ? `${COLORS.game}30` : COLORS.line}`,
      padding: "20px", display: "flex", flexDirection: "column", gap: "12px",
      boxShadow: canAfford && !isOOS ? `0 4px 16px ${COLORS.game}14` : "0 1px 4px rgba(0,0,0,0.04)",
      transition: "box-shadow 0.2s, transform 0.2s",
      opacity: isOOS ? 0.6 : 1,
      position: "relative", overflow: "hidden",
    }}
      onMouseEnter={e => { if (!isOOS) e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
    >
      {/* Popular badge for affordable rewards */}
      {canAfford && !isOOS && (
        <div style={{
          position: "absolute", top: "12px", right: "12px",
          background: `${COLORS.game}18`, color: COLORS.game,
          fontSize: "10px", fontWeight: "700", padding: "3px 8px", borderRadius: "20px",
        }}>
          ✦ Affordable
        </div>
      )}

      {/* Icon */}
      <div style={{
        width: "44px", height: "44px", borderRadius: "12px",
        background: isOOS ? COLORS.surface2 : `${COLORS.game}18`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: isOOS ? COLORS.inkSoft : COLORS.game,
      }}>
        <Gift size={22} />
      </div>

      {/* Name */}
      <div style={{ fontSize: "15px", fontWeight: "700", color: COLORS.ink, lineHeight: "1.3" }}>
        {reward.name}
      </div>

      {/* Cost */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "12px", color: COLORS.inkSoft, fontWeight: "500" }}>Cost</span>
        <span style={{
          fontSize: "15px", fontWeight: "800", color: canAfford ? COLORS.game : COLORS.ink,
          fontFamily: "monospace",
        }}>
          {reward.points} pts
        </span>
      </div>

      {/* Progress bar showing how close user is */}
      {!canAfford && !isOOS && (
        <div style={{ marginBottom: "2px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: COLORS.inkSoft, marginBottom: "5px" }}>
            <span>{balance} / {reward.points} pts</span>
            <span>Need {reward.points - balance} more</span>
          </div>
          <div style={{ height: "5px", borderRadius: "3px", background: COLORS.line, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: "3px",
              background: `linear-gradient(90deg, ${COLORS.game}88, ${COLORS.game})`,
              width: `${Math.min(100, (balance / reward.points) * 100)}%`,
              transition: "width 0.3s ease",
            }} />
          </div>
        </div>
      )}

      {/* Stock */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "12px", color: COLORS.inkSoft }}>Stock</span>
        <span style={{
          fontSize: "12px", fontWeight: "700",
          color: isOOS ? COLORS.bad : lowStock ? COLORS.warn : COLORS.good,
          fontFamily: "monospace",
        }}>
          {isOOS ? "Out of stock" : lowStock ? `⚠ ${reward.stock} left` : reward.stock}
        </span>
      </div>

      {/* Times redeemed */}
      {reward.times_redeemed > 0 && (
        <div style={{ fontSize: "11px", color: COLORS.inkSoft, fontStyle: "italic" }}>
          You've redeemed this {reward.times_redeemed}× before
        </div>
      )}

      {/* Redeem button */}
      <button
        disabled={isOOS || !canAfford}
        onClick={() => !isOOS && canAfford && onRedeem(reward)}
        style={{
          width: "100%", padding: "11px", borderRadius: "9px",
          border: `1.5px solid ${isOOS || !canAfford ? COLORS.line : COLORS.game}`,
          background: isOOS || !canAfford ? "transparent" : `${COLORS.game}10`,
          color: isOOS || !canAfford ? COLORS.inkSoft : COLORS.game,
          fontSize: "13px", fontWeight: "700", cursor: isOOS || !canAfford ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          marginTop: "auto",
        }}
        onMouseEnter={e => { if (!isOOS && canAfford) e.currentTarget.style.background = COLORS.game, e.currentTarget.style.color = "#fff"; }}
        onMouseLeave={e => { if (!isOOS && canAfford) e.currentTarget.style.background = `${COLORS.game}10`, e.currentTarget.style.color = COLORS.game; }}
      >
        {isOOS ? "Out of Stock" : !canAfford ? `Need ${reward.points - balance} more pts` : "Redeem →"}
      </button>
    </div>
  );
}

// ─── Main Module ───────────────────────────────────────────────────────────
export default function GamificationModule({ tab, onRefresh }) {
  const EMPLOYEE_NAME = "Nisha Patel";

  const [stage, setStage] = useState("Active");
  const [challenges, setChallenges] = useState([]);
  const [participation, setParticipation] = useState([]);
  const [badgesList, setBadgesList] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [leaderboardList, setLeaderboardList] = useState([]);
  const [balance, setBalance] = useState(0);
  const [xp, setXp] = useState(0);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Confirm modal state
  const [confirmReward, setConfirmReward] = useState(null);
  const [redeemLoading, setRedeemLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState(null);

  // Challenge modal
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [challForm, setChallForm] = useState({ name: "", xp: 100, difficulty: "Medium", deadline: "30 Jul", status: "Draft", category: "Environmental" });

  const stages = ["Draft", "Active", "Under review", "Completed", "Archived"];

  const showToast = (type, title, message) => setToast({ type, title, message });

  const loadBalance = useCallback(async () => {
    try {
      const data = await getEmployeeBalance(EMPLOYEE_NAME);
      setBalance(data.points);
      setXp(data.xp);
    } catch {}
  }, []);

  const loadRewards = useCallback(async () => {
    try {
      const data = await getRewardsEnhanced(EMPLOYEE_NAME);
      setRewards(data);
    } catch {}
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const data = await getRedemptionHistory(EMPLOYEE_NAME);
      setHistory(data);
    } catch {}
  }, []);

  const loadAll = useCallback(async () => {
    try {
      const [ch, part, bdg, ld] = await Promise.all([
        getChallenges(), getChallengeParticipation(), getBadges(), getLeaderboard()
      ]);
      setChallenges(ch); setParticipation(part); setBadgesList(bdg); setLeaderboardList(ld);
    } catch (e) { console.error(e); }
    await loadBalance();
    await loadRewards();
    await loadHistory();
  }, [loadBalance, loadRewards, loadHistory]);

  useEffect(() => { loadAll(); }, [tab]);

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    try {
      await createChallenge(challForm);
      setShowChallengeModal(false);
      loadAll();
    } catch (err) { showToast("error", "Error", err.message); }
  };

  const handleJoin = async (id) => {
    try {
      const res = await joinChallenge(id, EMPLOYEE_NAME);
      showToast("success", "Joined! 🎯", res.message);
      loadAll();
      if (onRefresh) onRefresh();
    } catch (err) { showToast("error", "Could not join", err.message); }
  };

  const handleDecide = async (id, status) => {
    try {
      await updateChallengeParticipationStatus(id, status);
      loadAll();
      if (onRefresh) onRefresh();
    } catch (err) { showToast("error", "Error", err.message); }
  };

  // Step 1: open confirm modal
  const handleRedeemClick = (reward) => setConfirmReward(reward);

  // Step 2: confirmed → call API
  const handleConfirmRedeem = async () => {
    if (!confirmReward) return;
    setRedeemLoading(true);
    try {
      const res = await redeemRewardV2(confirmReward.id, EMPLOYEE_NAME);
      setConfirmReward(null);
      showToast("success", "Redeemed! 🎁", res.message + ` New balance: ${res.new_balance} pts`);
      await loadBalance();
      await loadRewards();
      await loadHistory();
      if (onRefresh) onRefresh();
    } catch (err) {
      setConfirmReward(null);
      showToast("error", "Redemption Failed", err.message);
    } finally { setRedeemLoading(false); }
  };

  return (
    <div className="stack-lg">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmModal
        reward={confirmReward} balance={balance}
        onConfirm={handleConfirmRedeem} onCancel={() => setConfirmReward(null)}
        loading={redeemLoading}
      />

      <SectionTitle eyebrow="Gamification" title={tab} />

      {/* ─── CHALLENGES ─────────────────────────────── */}
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
            {challenges.filter((c) => c.status === stage && !participation.some(p => p.challenge === c.name && p.emp === EMPLOYEE_NAME)).map((c) => (
              <div className="mini-card" key={c.id}>
                <div className="between-row"><StatusPill status={c.difficulty} /><span className="mono xp-tag">{c.xp} XP</span></div>
                <div className="mini-card-title" style={{ marginTop: 10 }}>{c.name}</div>
                <div className="mini-card-sub">{c.category} · Deadline {c.deadline}</div>
                <button className="btn-outline-full" style={{ borderColor: COLORS.game, color: COLORS.game }} onClick={() => handleJoin(c.id)}>Join challenge</button>
              </div>
            ))}
          </div>
          {showChallengeModal && (
            <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
              <div className="panel" style={{ width: "420px", padding: "24px", position: "relative" }}>
                <button style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", cursor: "pointer" }} onClick={() => setShowChallengeModal(false)}><X size={18} /></button>
                <SectionTitle eyebrow="Gamification" title="Add Sustainability Challenge" />
                <form onSubmit={handleCreateChallenge} className="stack-md" style={{ marginTop: "16px" }}>
                  <label className="filter-field"><span>Challenge Title</span><input type="text" required value={challForm.name} onChange={(e) => setChallForm({ ...challForm, name: e.target.value })} /></label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <label className="filter-field"><span>XP Reward</span><input type="number" required value={challForm.xp} onChange={(e) => setChallForm({ ...challForm, xp: Number(e.target.value) })} /></label>
                    <label className="filter-field"><span>Difficulty</span><select value={challForm.difficulty} onChange={(e) => setChallForm({ ...challForm, difficulty: e.target.value })}><option>Easy</option><option>Medium</option><option>Hard</option></select></label>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <label className="filter-field"><span>Category</span><select value={challForm.category} onChange={(e) => setChallForm({ ...challForm, category: e.target.value })}><option>Environmental</option><option>Social</option><option>Governance</option></select></label>
                    <label className="filter-field"><span>Deadline</span><input type="text" required placeholder="e.g. 31 Jul" value={challForm.deadline} onChange={(e) => setChallForm({ ...challForm, deadline: e.target.value })} /></label>
                  </div>
                  <label className="filter-field"><span>Initial Status</span><select value={challForm.status} onChange={(e) => setChallForm({ ...challForm, status: e.target.value })}><option>Draft</option><option>Active</option></select></label>
                  <button type="submit" className="btn-primary" style={{ background: COLORS.game, width: "100%", marginTop: "8px" }}>Save Challenge</button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── CHALLENGE PARTICIPATION ─────────────────── */}
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
                    <td><div className="progress-cell"><ProgressBar pct={r.progress} tone="game" /><span className="mono progress-pct">{r.progress}%</span></div></td>
                    <td className="mono">{r.proof}</td>
                    <td className="mono">{r.xp}</td>
                    <td>
                      {r.approval === "Pending" ? (
                        <div className="approval-actions">
                          <button className="chip-btn chip-approve" onClick={() => handleDecide(r.id, "Approved")}><Check size={13} /> Approve</button>
                          <button className="chip-btn chip-reject" onClick={() => handleDecide(r.id, "Rejected")}><X size={13} /> Reject</button>
                        </div>
                      ) : <StatusPill status={r.approval} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── BADGES ─────────────────────────────────── */}
      {tab === "Badges" && (
        <div className="card-grid">
          {badgesList.map((b) => (
            <div className="mini-card badge-card" key={b.id}>
              <span className="badge-icon">🏆</span>
              <div className="mini-card-title">{b.name}</div>
              <div className="mini-card-sub">Unlocks on: {b.rule}</div>
            </div>
          ))}
        </div>
      )}

      {/* ─── REWARDS ─────────────────────────────────── */}
      {tab === "Rewards" && (
        <div className="stack-md">
          {/* Balance Header */}
          <div style={{
            background: `linear-gradient(135deg, ${COLORS.game}, ${COLORS.gameDark})`,
            borderRadius: "14px", padding: "20px 24px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            color: "#fff",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "12px",
                background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Wallet size={24} />
              </div>
              <div>
                <div style={{ fontSize: "12px", opacity: 0.8, fontWeight: "500", letterSpacing: "0.5px" }}>YOUR POINTS BALANCE</div>
                <div style={{ fontSize: "28px", fontWeight: "800", fontFamily: "monospace", lineHeight: 1.1 }}>
                  {balance.toLocaleString()} <span style={{ fontSize: "16px", opacity: 0.8 }}>pts</span>
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", opacity: 0.8 }}>XP Earned</div>
              <div style={{ fontSize: "20px", fontWeight: "700", fontFamily: "monospace" }}>{xp.toLocaleString()}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "6px", fontSize: "11px", opacity: 0.7 }}>
                <Star size={12} /> {EMPLOYEE_NAME}
              </div>
            </div>
          </div>

          {/* Filter + History Toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: "13px", color: COLORS.inkSoft }}>
              <strong style={{ color: COLORS.ink }}>{rewards.filter(r => r.can_afford && r.stock > 0).length}</strong> rewards you can redeem now
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "7px 14px", borderRadius: "8px", border: `1px solid ${COLORS.line}`,
                background: showHistory ? COLORS.game + "12" : COLORS.surface2,
                color: showHistory ? COLORS.game : COLORS.inkSoft,
                fontSize: "12px", fontWeight: "600", cursor: "pointer",
              }}>
              <Clock size={13} /> Redemption History
            </button>
          </div>

          {/* Redemption History Panel */}
          {showHistory && (
            <div className="panel" style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: "14px", fontWeight: "700", color: COLORS.ink, marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                <ShoppingBag size={15} /> Your Redemption History
              </div>
              {history.length === 0 ? (
                <div style={{ fontSize: "13px", color: COLORS.inkSoft, textAlign: "center", padding: "20px" }}>
                  No redemptions yet. Redeem your first reward below!
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead><tr><th>Reward</th><th>Points Spent</th><th>Date</th></tr></thead>
                    <tbody>
                      {history.map(h => (
                        <tr key={h.id}>
                          <td className="cell-strong"><Gift size={13} style={{ marginRight: "6px", color: COLORS.game }} />{h.reward_name}</td>
                          <td className="mono" style={{ color: COLORS.bad }}>-{h.points_spent} pts</td>
                          <td style={{ color: COLORS.inkSoft, fontSize: "12px" }}>{h.redeemed_at ? new Date(h.redeemed_at).toLocaleString() : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Reward Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
            {rewards.map((r) => (
              <RewardCard key={r.id} reward={r} balance={balance} onRedeem={handleRedeemClick} />
            ))}
          </div>

          <div style={{ fontSize: "12px", color: COLORS.inkSoft, textAlign: "center" }}>
            Points are earned by completing challenges and CSR activities. Redeemed points cannot be refunded.
          </div>
        </div>
      )}

      {/* ─── LEADERBOARD ─────────────────────────────── */}
      {tab === "Leaderboard" && (
        <div className="panel">
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Rank</th><th>Employee / department</th><th>XP</th></tr></thead>
              <tbody>
                {leaderboardList.map((r) => (
                  <tr key={r.rank}>
                    <td>{r.rank <= 3 ? <span className="rank-medal" style={{ color: [COLORS.social, "#9AA0A6", "#B08D57"][r.rank - 1] }}><Crown size={15} /> {r.rank}</span> : r.rank}</td>
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
