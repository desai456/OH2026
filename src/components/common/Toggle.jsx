import React from "react";
import { COLORS } from "../../constants/config";

export default function Toggle({ on, onClick, label, desc }) {
  return (
    <div className="toggle-row">
      <div>
        <div className="toggle-label">{label}</div>
        {desc && <div className="toggle-desc">{desc}</div>}
      </div>
      <button className="toggle-switch" onClick={onClick} aria-pressed={on} style={{ background: on ? COLORS.env : "#D8D3C4" }}>
        <span className="toggle-knob" style={{ transform: on ? "translateX(18px)" : "translateX(2px)" }} />
      </button>
    </div>
  );
}
