import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Leaf, Search, Bell, ChevronDown, Trophy, ShieldCheck, Users, 
  FileText, ClipboardCheck, AlertTriangle, Package, Heart, 
  Building2, User, Zap, Target, X 
} from "lucide-react";


import { COLORS, NAV_TREE, DEFAULT_TABS } from "./constants/config";


import { getDashboardSummary, getNotifications, getSearchResults } from "./constants/api";


import "./styles/App.css";

// Modules
import DashboardModule from "./components/modules/DashboardModule";
import EnvironmentalModule from "./components/modules/EnvironmentalModule";
import SocialModule from "./components/modules/SocialModule";
import GovernanceModule from "./components/modules/GovernanceModule";
import GamificationModule from "./components/modules/GamificationModule";
import ReportsModule from "./components/modules/ReportsModule";
import SettingsModule from "./components/modules/SettingsModule";

const typeIcons = {
  department: <Building2 size={14} />,
  employee: <User size={14} />,
  goal: <Target size={14} />,
  emission_factor: <Zap size={14} />,
  product: <Package size={14} />,
  csr_activity: <Heart size={14} />,
  policy: <FileText size={14} />,
  audit: <ClipboardCheck size={14} />,
  compliance_issue: <AlertTriangle size={14} />,
  challenge: <Trophy size={14} />,
};

export default function EcoSphereApp() {
  const [active, setActive] = useState("dashboard");
  const [tabs, setTabs] = useState(DEFAULT_TABS);
  const [overallScore, setOverallScore] = useState(81);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef(null);


  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      try {
        const data = await getSearchResults(searchQuery);
        setSearchResults(data);
        setSelectedIndex(0);
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 200); // 200ms debounce
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Global key listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowSearch((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Keyboard navigation within search modal
  const handleSearchKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prevIndex) => 
        searchResults.length > 0 ? (prevIndex + 1) % searchResults.length : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prevIndex) => 
        searchResults.length > 0 ? (prevIndex - 1 + searchResults.length) % searchResults.length : 0
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        handleSelectResult(searchResults[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeSearch();
    }
  };

  const handleSelectResult = (result) => {
    goTo(result.link.module, result.link.tab);
    closeSearch();
  };

  const closeSearch = () => {
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Focus input when search modal opens
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);


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
      case "reports": return <ReportsModule tab={currentTab} onRefresh={loadGlobalMetrics} goTo={goTo} />;
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
          <button 
            className="search-box" 
            style={{ cursor: "pointer", textAlign: "left", width: "260px", background: "none", border: `1px solid ${COLORS.line}` }} 
            onClick={() => setShowSearch(true)}
          >
            <Search size={13} />
            <span style={{ flex: 1, color: COLORS.inkSoft }}>Search platform...</span>
            <span style={{ fontSize: "10px", opacity: 0.6, background: COLORS.bg, padding: "2px 4px", borderRadius: "4px" }} className="mono">Ctrl+K</span>
          </button>
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
                zIndex: 1000,
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

      {showSearch && (
        <div className="search-overlay" onClick={closeSearch}>
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="search-input-container">
              <Search size={16} color={COLORS.inkSoft} />
              <input
                ref={searchInputRef}
                type="text"
                className="search-input-field"
                placeholder="Search departments, employees, goals, policies, audits, challenges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              <button onClick={closeSearch} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.inkSoft, display: "flex", alignItems: "center" }}>
                <X size={16} />
              </button>
            </div>
            
            <div className="search-results-list">
              {searchQuery.trim() === "" ? (
                <div className="search-results-empty">
                  Type something to search across the ESG platform...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="search-results-empty">
                  No results found for "{searchQuery}"
                </div>
              ) : (
                searchResults.map((result, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={`${result.type}-${result.id}`}
                      className={`search-result-item ${isSelected ? "selected" : ""}`}
                      onClick={() => handleSelectResult(result)}
                    >
                      <div className="search-result-icon-wrap" style={{ 
                        background: result.type === "compliance_issue" ? "#FDF2F2" : `${COLORS.env}14`,
                        color: result.type === "compliance_issue" ? COLORS.bad : COLORS.env
                      }}>
                        {typeIcons[result.type] || <FileText size={14} />}
                      </div>
                      <div className="search-result-details">
                        <div className="search-result-title">{result.title}</div>
                        <div className="search-result-subtitle">{result.subtitle}</div>
                      </div>
                      <span className="search-result-type-tag" style={{
                        background: result.type === "compliance_issue" ? "#FDF2F2" : `${COLORS.env}14`,
                        color: result.type === "compliance_issue" ? COLORS.bad : COLORS.env
                      }}>
                        {result.type.replace("_", " ")}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="search-modal-footer">
              <div className="search-modal-shortcuts">
                <span><span className="search-shortcut-key">↑↓</span> Navigate</span>
                <span><span className="search-shortcut-key">Enter</span> Select</span>
                <span><span className="search-shortcut-key">Esc</span> Close</span>
              </div>
              <div style={{ opacity: 0.8 }}>EcoSphere ESG Search</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

