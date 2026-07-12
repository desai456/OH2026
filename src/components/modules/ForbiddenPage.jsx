import React from "react";
import { ShieldX } from "lucide-react";
import { COLORS } from "../../constants/config";

export default function ForbiddenPage({ onGoBack }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      minHeight: "60vh", textAlign: "center", padding: "40px",
    }}>
      <div style={{
        width: "80px", height: "80px", borderRadius: "50%", background: COLORS.gameSoft,
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px",
      }}>
        <ShieldX size={36} color={COLORS.game} />
      </div>
      <h1 style={{ fontSize: "28px", fontWeight: "700", color: COLORS.ink, margin: "0 0 8px" }}>
        403 — Access Denied
      </h1>
      <p style={{ fontSize: "14px", color: COLORS.inkSoft, maxWidth: "400px", lineHeight: "1.6" }}>
        You do not have permission to access this page.
        Contact your administrator if you believe this is an error.
      </p>
      {onGoBack && (
        <button onClick={onGoBack} className="btn-primary"
          style={{ background: COLORS.env, marginTop: "24px" }}>
          Go to Dashboard
        </button>
      )}
    </div>
  );
}
