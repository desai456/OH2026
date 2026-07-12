import React from "react";
import { COLORS } from "../../constants/config";

export default function Pill({ tone = "env", children }) {
  const map = {
    env: [COLORS.envSoft, COLORS.envDark],
    social: [COLORS.socialSoft, COLORS.socialDark],
    gov: [COLORS.govSoft, COLORS.govDark],
    game: [COLORS.gameSoft, COLORS.gameDark],
    neutral: ["#EDEAE0", COLORS.inkSoft],
  };
  const [bg, fg] = map[tone] || map.neutral;
  return <span className="pill" style={{ background: bg, color: fg }}>{children}</span>;
}
