import React, { useState, useMemo } from "react";
import { Leaf, Search, Bell, ChevronDown } from "lucide-react";

// Config and constants
import { COLORS, NAV_TREE, DEFAULT_TABS } from "./constants/config";

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

  const currentTab = tabs[active];
  const goTo = (moduleId, tabName) => {
    setActive(moduleId);
    if (tabName) setTabs((t) => ({ ...t, [moduleId]: tabName }));
  };

  const content = useMemo(() => {
    switch (active) {
      case "dashboard": return <DashboardModule />;
      case "environmental": return <EnvironmentalModule tab={currentTab} />;
      case "social": return <SocialModule tab={currentTab} />;
      case "governance": return <GovernanceModule tab={currentTab} />;
      case "gamification": return <GamificationModule tab={currentTab} />;
      case "reports": return <ReportsModule tab={currentTab} />;
      case "settings": return <SettingsModule tab={currentTab} />;
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
        <div className="sidebar-foot">Overall ESG score<br /><span className="mono" style={{ fontSize: 18, color: COLORS.ink, fontWeight: 600 }}>81 / 100</span></div>
      </aside>

      <div className="main-col">
        <header className="topbar">
          <div className="topbar-title">{NAV_TREE.find((n) => n.id === active)?.label}</div>
          <div className="search-box"><Search size={13} /> Search departments, employees, reports…</div>
          <div className="topbar-right">
            <button className="icon-btn"><Bell size={16} /><span className="dot" /></button>
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
