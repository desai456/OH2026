import React from "react";
import { COLORS } from "../../constants/config";

export default function ScoreRing({ label, value, tone, size = 132 }) {
  const color = { env: COLORS.env, social: COLORS.social, gov: COLORS.gov, game: COLORS.ink }[tone];
  const soft = { env: COLORS.envSoft, social: COLORS.socialSoft, gov: COLORS.govSoft, game: "#EDEAE0" }[tone];
  const r = 52;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  const ticks = Array.from({ length: 24 });
  return (
    <div className="ring-card">
      <svg viewBox="0 0 140 140" width={size} height={size}>
        <g transform="translate(70,70)">
          {ticks.map((_, i) => {
            const a = (i / 24) * 360;
            const major = i % 6 === 0;
            return (
              <line
                key={i}
                x1={0} y1={-62} x2={0} y2={major ? -56 : -59}
                stroke={major ? COLORS.inkSoft : COLORS.line}
                strokeWidth={major ? 1.4 : 1}
                transform={`rotate(${a})`}
              />
            );
          })}
          <circle r={r} fill="none" stroke={soft} strokeWidth={9} />
          <circle
            r={r} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round"
            strokeDasharray={`${dash} ${c - dash}`}
            transform="rotate(-90)"
          />
          <text textAnchor="middle" y={2} className="ring-value" fill={COLORS.ink}>{value}</text>
          <text textAnchor="middle" y={20} className="ring-max" fill={COLORS.inkSoft}>/ 100</text>
        </g>
      </svg>
      <div className="ring-label" style={{ color }}>{label}</div>
    </div>
  );
}
