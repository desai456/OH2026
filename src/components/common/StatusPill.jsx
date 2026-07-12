import React from "react";
import Pill from "./Pill";

export default function StatusPill({ status }) {
  const s = status.toLowerCase();
  let tone = "neutral";
  if (["active", "on track", "completed", "approved", "resolved", "good"].includes(s)) tone = "env";
  else if (["pending", "under review", "draft", "medium"].includes(s)) tone = "social";
  else if (["at risk", "open", "high", "rejected"].includes(s)) tone = "game";
  return <Pill tone={tone}>{status}</Pill>;
}
