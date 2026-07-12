import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar
} from "recharts";
import { ArrowDownRight, Flame, Trophy, FileBarChart2 } from "lucide-react";
import { COLORS } from "../../constants/config";
import { getDashboardSummary } from "../../constants/api";
import ScoreRing from "../common/ScoreRing";
import SectionTitle from "../common/SectionTitle";

export default function DashboardModule({ onRefresh }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await getDashboardSummary();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !data) {
    return <div className="empty-note">Loading ESG Dashboard...</div>;
  }

  return (
    <div className="stack-xl">
      <section className="hero-panel">
        <div className="hero-copy">
          <div className="eyebrow">Executive overview — fiscal week 28</div>
          <h1 className="hero-title">Every metric your organization<br />measures, in one instrument panel.</h1>
          <p className="hero-sub">Environmental, social and governance performance read together, updated as operations happen.</p>
        </div>
        <div className="ring-row">
          <ScoreRing label="Environmental" value={Math.round(data.envScore)} tone="env" />
          <ScoreRing label="Social" value={Math.round(data.socialScore)} tone="social" />
          <ScoreRing label="Governance" value={Math.round(data.govScore)} tone="gov" />
          <ScoreRing label="Overall ESG" value={Math.round(data.overallScore)} tone="game" size={148} />
          <ScoreRing label="Predicted Next Month (ML)" value={Math.round(data.predictedScore || 80)} tone="social" size={148} />
        </div>
      </section>

      <div className="grid-2">
        <div className="panel">
          <SectionTitle eyebrow="12-month trend" title="Emissions (t CO₂e)" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.emissionsTrend} margin={{ left: -18, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="envGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.env} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={COLORS.env} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={COLORS.line} vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize: 11, fill: COLORS.inkSoft }} axisLine={{ stroke: COLORS.line }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: COLORS.inkSoft }} axisLine={false} tickLine={false} width={36} />
              <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${COLORS.line}`, fontSize: 12, fontFamily: "IBM Plex Mono, monospace" }} />
              <Area type="monotone" dataKey="t" stroke={COLORS.env} strokeWidth={2} fill="url(#envGrad)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="trend-flag"><ArrowDownRight size={14} /> 12.6% lower than the same week last year</div>
        </div>

        <div className="panel">
          <SectionTitle eyebrow="This quarter" title="Department ESG ranking" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.deptScores} margin={{ left: -18, right: 8, top: 8 }}>
              <CartesianGrid stroke={COLORS.line} vertical={false} />
              <XAxis dataKey="dept" tick={{ fontSize: 11, fill: COLORS.inkSoft }} axisLine={{ stroke: COLORS.line }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: COLORS.inkSoft }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${COLORS.line}`, fontSize: 12, fontFamily: "IBM Plex Mono, monospace" }} />
              <Bar dataKey="score" fill={COLORS.gov} radius={[4, 4, 0, 0]} maxBarSize={34} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <SectionTitle title="Recent activity" />
          <ul className="activity-list">
            {data.recentActivity.map((a, i) => {
              const color = { env: COLORS.env, social: COLORS.social, gov: COLORS.gov, game: COLORS.game }[a.tone] || COLORS.ink;
              return (
                <li key={i} className="activity-row">
                  <span className="activity-icon" style={{ background: `${color}1A`, color, width: "24px", height: "24px", display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", marginRight: "8px" }}>✦</span>
                  <span className="activity-text">{a.title} - {a.message}</span>
                  <span className="activity-time">{a.time}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="panel">
          <SectionTitle title="Quick actions" />
          <div className="stack-sm">
            <button className="action-btn" style={{ background: COLORS.env }} onClick={loadData}><Flame size={16} /> Log carbon data</button>
            <button className="action-btn" style={{ background: COLORS.social }} onClick={loadData}><Trophy size={16} /> Start a challenge</button>
            <button className="action-btn action-btn-outline"><FileBarChart2 size={16} /> View reports</button>
          </div>
          <div className="divider-tick" />
          <div className="mini-note">Auto emission calculation is active — transactions are auto-generated from linked operations records.</div>
        </div>
      </div>
    </div>
  );
}
