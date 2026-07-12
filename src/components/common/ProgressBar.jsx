import React from "react";
import { COLORS } from "../../constants/config";

export default function ProgressBar({ pct, tone = "env" }) {
  const color = { env: COLORS.env, social: COLORS.social, gov: COLORS.gov, game: COLORS.game }[tone];
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
    </div>
  );
}
