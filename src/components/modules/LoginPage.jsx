import React, { useState } from "react";
import { Leaf, Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { COLORS } from "../../constants/config";
import { useAuth } from "../../constants/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setLoading(true);
    try {
      await login(email, password, rememberMe);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: `linear-gradient(135deg, ${COLORS.bg} 0%, ${COLORS.envSoft} 50%, ${COLORS.socialSoft} 100%)`,
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      <div style={{
        width: "420px", background: COLORS.surface, borderRadius: "16px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)",
        padding: "48px 40px", border: `1px solid ${COLORS.line}`,
      }}>
        {/* Branding */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "14px", background: COLORS.env,
            display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "16px",
          }}>
            <Leaf size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: COLORS.ink, margin: "0 0 4px" }}>
            EcoSphere
          </h1>
          <p style={{ fontSize: "13px", color: COLORS.inkSoft, margin: 0 }}>
            ESG Management Platform
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: "10px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: "500",
            background: COLORS.gameSoft, color: COLORS.game, border: `1px solid ${COLORS.game}30`,
            marginBottom: "20px",
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", marginBottom: "16px" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: COLORS.ink, display: "block", marginBottom: "6px" }}>Email Address</span>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ecosphere.com"
              style={{
                width: "100%", padding: "10px 14px", borderRadius: "8px", fontSize: "14px",
                border: `1px solid ${COLORS.line}`, outline: "none", background: COLORS.surface2,
                color: COLORS.ink, boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = COLORS.env}
              onBlur={(e) => e.target.style.borderColor = COLORS.line}
            />
          </label>

          <label style={{ display: "block", marginBottom: "16px" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: COLORS.ink, display: "block", marginBottom: "6px" }}>Password</span>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: "100%", padding: "10px 40px 10px 14px", borderRadius: "8px",
                  fontSize: "14px", border: `1px solid ${COLORS.line}`, outline: "none",
                  background: COLORS.surface2, color: COLORS.ink, boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => e.target.style.borderColor = COLORS.env}
                onBlur={(e) => e.target.style.borderColor = COLORS.line}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: COLORS.inkSoft,
                  display: "flex", alignItems: "center",
                }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <label style={{
            display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px",
            fontSize: "13px", color: COLORS.inkSoft, cursor: "pointer",
          }}>
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
              style={{ accentColor: COLORS.env }} />
            Remember me for 7 days
          </label>

          <button type="submit" disabled={loading}
            style={{
              width: "100%", padding: "12px", borderRadius: "10px", border: "none",
              background: loading ? COLORS.inkSoft : COLORS.env, color: "#fff",
              fontSize: "14px", fontWeight: "600", cursor: loading ? "wait" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              transition: "background 0.2s, transform 0.1s",
            }}
            onMouseDown={(e) => { if (!loading) e.target.style.transform = "scale(0.98)"; }}
            onMouseUp={(e) => e.target.style.transform = "scale(1)"}
          >
            {loading ? <Loader2 size={16} className="spin" /> : <LogIn size={16} />}
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "11px", color: COLORS.inkSoft, marginTop: "24px" }}>
          Contact your Super Admin if you need an account.
        </p>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
    </div>
  );
}
