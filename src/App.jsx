import React, { useState, useEffect, useMemo } from "react";
import { Leaf, Search, Bell, ChevronDown } from "lucide-react";

// Config and constants
import { COLORS, NAV_TREE, DEFAULT_TABS } from "./constants/config";

// API
import { getDashboardSummary, getNotifications } from "./constants/api";

// Styles
import "./styles/App.css";

// Modules
import DashboardModule from "./components/modules/DashboardModule";
import EnvironmentalModule from "./components/modules/EnvironmentalModule";
import SocialModule from "./components/modules/SocialModule";
import GovernanceModule from "./components/modules/GovernanceModule";
import GamificationModule from "./components/modules/GamificationModule";
import ReportsModule from "./components/modules/ReportsModule";
import SettingsModule from "./components/modules/SettingsModule";

export default function EcoSphereApp() {
  const [active, setActive] = useState("dashboard");
  const [tabs, setTabs] = useState(DEFAULT_TABS);
  const [overallScore, setOverallScore] = useState(81);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const loadGlobalMetrics = async () => {
    try {
      const summary = await getDashboardSummary();
      setOverallScore(summary.overallScore);
      const notifs = await getNotifications();
      setNotifications(notifs);
    } catch (err) {
      console.error("Error loading dashboard metrics:", err);
    }
  };

  useEffect(() => {
    loadGlobalMetrics();
    // Poll every 10s for new notifications/score updates
    const interval = setInterval(loadGlobalMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  const currentTab = tabs[active];
  const goTo = (moduleId, tabName) => {
    setActive(moduleId);
    if (tabName) setTabs((t) => ({ ...t, [moduleId]: tabName }));
  };

  const content = useMemo(() => {
    switch (active) {
      case "dashboard": return <DashboardModule onRefresh={loadGlobalMetrics} />;
      case "environmental": return <EnvironmentalModule tab={currentTab} onRefresh={loadGlobalMetrics} />;
      case "social": return <SocialModule tab={currentTab} onRefresh={loadGlobalMetrics} />;
      case "governance": return <GovernanceModule tab={currentTab} onRefresh={loadGlobalMetrics} />;
      case "gamification": return <GamificationModule tab={currentTab} onRefresh={loadGlobalMetrics} />;
      case "reports": return <ReportsModule tab={currentTab} onRefresh={loadGlobalMetrics} />;
      case "settings": return <SettingsModule tab={currentTab} onRefresh={loadGlobalMetrics} />;
      default: return null;
    }
  }, [active, currentTab]);

  return (
    <div className="ecosphere-app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark"><Leaf size={15} /></span>
          <div>
            <div className="brand-word">EcoSphere</div>
            <div className="brand-tag">ESG platform</div>
          </div>
        </div>
        <nav className="nav-list">
          {NAV_TREE.map((n) => {
            const Icon = n.icon;
            const color = { ink: COLORS.ink, env: COLORS.env, social: COLORS.social, gov: COLORS.gov, game: COLORS.game }[n.tone];
            const isModuleActive = active === n.id;
            return (
              <div className="nav-section" key={n.id}>
                <button
                   className={"nav-item" + (isModuleActive && n.tabs.length === 0 ? " nav-item-active" : "")}
                  style={{ color: isModuleActive ? (n.tabs.length === 0 ? "#fff" : color) : color, fontWeight: 600 }}
                  onClick={() => goTo(n.id, DEFAULT_TABS[n.id])}
                >
                  <Icon size={16} /> {n.label}
                </button>
                {n.tabs.length > 0 && (
                  <div className="nav-subitems">
                    {n.tabs.map((t) => {
                      const isLeafActive = isModuleActive && currentTab === t;
                      return (
                        <button
                          key={t}
                          className={"nav-subitem" + (isLeafActive ? " nav-subitem-active" : "")}
                          style={isLeafActive ? { color, background: `${color}14` } : {}}
                          onClick={() => goTo(n.id, t)}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="sidebar-foot">Overall ESG score<br /><span className="mono" style={{ fontSize: 18, color: COLORS.ink, fontWeight: 600 }}>{overallScore} / 100</span></div>
      </aside>

      <div className="main-col">
        <header className="topbar">
          <div className="topbar-title">{NAV_TREE.find((n) => n.id === active)?.label}</div>
          <div className="search-box"><Search size={13} /> Search departments, employees, reports…</div>
          <div className="topbar-right" style={{ position: "relative" }}>
            <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={16} />
              {notifications.some(n => !n.is_read) && <span className="dot" />}
            </button>

            {showNotifications && (
              <div className="notifications-popup" style={{
                position: "absolute",
                top: "45px",
                right: "0",
                background: COLORS.surface,
                border: `1px solid ${COLORS.line}`,
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                width: "320px",
                maxHeight: "400px",
                overflowY: "auto",
                zIndex: 100,
                padding: "12px"
              }}>
                <div style={{ fontWeight: 600, marginBottom: "8px", borderBottom: `1px solid ${COLORS.line}`, paddingBottom: "4px" }}>Recent Notifications</div>
                {notifications.length === 0 ? (
                  <div style={{ fontSize: "12px", color: COLORS.inkSoft, padding: "8px 0" }}>No notifications yet.</div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} style={{ fontSize: "12px", padding: "8px 0", borderBottom: `1px solid ${COLORS.surface2}` }}>
                      <div style={{ fontWeight: 600, color: COLORS.ink }}>{notif.title}</div>
                      <div style={{ color: COLORS.inkSoft }}>{notif.message}</div>
                      <div style={{ fontSize: "10px", color: COLORS.inkSoft, marginTop: "2px" }}>{notif.time}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="user-chip">
              <span className="user-avatar">NP</span>
              <span className="user-name">Nisha Patel</span>
              <ChevronDown size={13} color={COLORS.inkSoft} />
            </div>
          </div>
        </header>
        <main className="content-area">{content}</main>
      </div>
    </div>
  );
}
