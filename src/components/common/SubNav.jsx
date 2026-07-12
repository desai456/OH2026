import React from "react";
import { COLORS } from "../../constants/config";

export default function SubNav({ tabs, active, onChange, tone = "env" }) {
  const color = { env: COLORS.env, social: COLORS.social, gov: COLORS.gov, game: COLORS.game }[tone];
  return (
    <div className="subnav">
      {tabs.map((t) => (
        <button
          key={t}
          className={"subnav-btn" + (active === t ? " subnav-btn-active" : "")}
          style={active === t ? { borderColor: color, color } : {}}
          onClick={() => onChange(t)}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
