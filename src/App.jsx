import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Leaf, Search, Bell, ChevronDown, Trophy, ShieldCheck, Users, 
  FileText, ClipboardCheck, AlertTriangle, Package, Heart, 
  Building2, User, Zap, Target, X, LogOut, UserCog, Shield
} from "lucide-react";

import { COLORS, NAV_TREE, DEFAULT_TABS, ROLE_MODULE_ACCESS } from "./constants/config";
import { useAuth } from "./constants/AuthContext";
import { getDashboardSummary, getNotifications, getSearchResults } from "./constants/api";
import "./styles/App.css";

// Modules (existing)
import DashboardModule from "./components/modules/DashboardModule";
import EnvironmentalModule from "./components/modules/EnvironmentalModule";
import SocialModule from "./components/modules/SocialModule";
import GovernanceModule from "./components/modules/GovernanceModule";
import GamificationModule from "./components/modules/GamificationModule";
import ReportsModule from "./components/modules/ReportsModule";
import SettingsModule from "./components/modules/SettingsModule";

// Auth modules (new)
import LoginPage from "./components/modules/LoginPage";
import ProfilePage from "./components/modules/ProfilePage";
import UserManagementModule from "./components/modules/UserManagementModule";
import ForbiddenPage from "./components/modules/ForbiddenPage";

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

// Admin nav items (only visible to Super Admin)
const ADMIN_NAV = { id: "admin", label: "User Management", icon: UserCog, tone: "gov", tabs: ["Users", "Role management", "Login history"] };
const PROFILE_NAV = { id: "profile", label: "My Profile", icon: User, tone: "env", tabs: [] };

export default function EcoSphereApp() {
  const { user, isAuthenticated, loading, logout, hasModuleAccess } = useAuth();

  const [active, setActive] = useState("dashboard");
  const [tabs, setTabs] = useState({ ...DEFAULT_TABS, admin: "Users" });
  const [overallScore, setOverallScore] = useState(81);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Search state
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const delayDebounceFn = setTimeout(async () => {
      try {
        const data = await getSearchResults(searchQuery);
        setSearchResults(data);
        setSelectedIndex(0);
      } catch (err) { console.error("Search error:", err); }
    }, 200);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

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

  const handleSearchKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((prev) => searchResults.length > 0 ? (prev + 1) % searchResults.length : 0); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((prev) => searchResults.length > 0 ? (prev - 1 + searchResults.length) % searchResults.length : 0); }
    else if (e.key === "Enter") { e.preventDefault(); if (searchResults[selectedIndex]) handleSelectResult(searchResults[selectedIndex]); }
    else if (e.key === "Escape") { e.preventDefault(); closeSearch(); }
  };

  const handleSelectResult = (result) => { goTo(result.link.module, result.link.tab); closeSearch(); };
  const closeSearch = () => { setShowSearch(false); setSearchQuery(""); setSearchResults([]); };

  useEffect(() => { if (showSearch && searchInputRef.current) searchInputRef.current.focus(); }, [showSearch]);

  const loadGlobalMetrics = async () => {
    try {
      const summary = await getDashboardSummary();
      setOverallScore(summary.overallScore);
      const notifs = await getNotifications();
      setNotifications(notifs);
    } catch (err) { console.error("Error loading dashboard metrics:", err); }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadGlobalMetrics();
      const interval = setInterval(loadGlobalMetrics, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const currentTab = tabs[active];
  const goTo = (moduleId, tabName) => {
    // Check access before navigating
    if (!hasModuleAccess(moduleId) && moduleId !== "profile" && moduleId !== "dashboard") {
      setActive("forbidden");
      return;
    }
    setActive(moduleId);
    if (tabName) setTabs((t) => ({ ...t, [moduleId]: tabName }));
  };

  // Build filtered nav tree based on user role
  const filteredNavTree = useMemo(() => {
    if (!user) return [];
    const allowedModules = ROLE_MODULE_ACCESS[user.role_name] || [];
    const base = NAV_TREE.filter(n => allowedModules.includes(n.id) || allowedModules.includes("*") || n.id === "dashboard");
    // Add admin nav for Super Admin
    if (user.role_name === "Super Admin") base.push(ADMIN_NAV);
    // Add profile nav for everyone
    base.push(PROFILE_NAV);
    return base;
  }, [user]);

  const content = useMemo(() => {
    if (active === "forbidden") return <ForbiddenPage onGoBack={() => setActive("dashboard")} />;
    if (active === "profile") return <ProfilePage />;
    if (active === "admin") return <UserManagementModule tab={currentTab} />;

    // Check access for existing modules
    if (active !== "dashboard" && !hasModuleAccess(active)) {
      return <ForbiddenPage onGoBack={() => setActive("dashboard")} />;
    }

    switch (active) {
      case "dashboard": return <DashboardModule onRefresh={loadGlobalMetrics} goTo={goTo} />;
      case "environmental": return <EnvironmentalModule tab={currentTab} onRefresh={loadGlobalMetrics} />;
      case "social": return <SocialModule tab={currentTab} onRefresh={loadGlobalMetrics} />;
      case "governance": return <GovernanceModule tab={currentTab} onRefresh={loadGlobalMetrics} />;
      case "gamification": return <GamificationModule tab={currentTab} onRefresh={loadGlobalMetrics} />;
      case "reports": return <ReportsModule tab={currentTab} onRefresh={loadGlobalMetrics} goTo={goTo} />;
      case "settings": return <SettingsModule tab={currentTab} onRefresh={loadGlobalMetrics} />;
      default: return null;
    }
  }, [active, currentTab, user]);

  // Show loading spinner while auth is initializing
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: COLORS.bg }}>
        <div style={{ textAlign: "center" }}>
          <Leaf size={32} color={COLORS.env} />
          <div style={{ marginTop: "12px", color: COLORS.inkSoft, fontSize: "14px" }}>Loading EcoSphere...</div>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) return <LoginPage />;

  // User initials for avatar
  const userInitials = user?.full_name?.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "U";

  return (
    <div className="ecosphere-app">
      <aside className="sidebar">
        <div className="brand" onClick={() => goTo("dashboard")} style={{ cursor: "pointer" }}>
          <span className="brand-mark"><Leaf size={15} /></span>
          <div>
            <div className="brand-word">EcoSphere</div>
            <div className="brand-tag">ESG platform</div>
          </div>
        </div>
        <nav className="nav-list">
          {filteredNavTree.map((n) => {
            const Icon = n.icon;
            const color = { ink: COLORS.ink, env: COLORS.env, social: COLORS.social, gov: COLORS.gov, game: COLORS.game }[n.tone];
            const isModuleActive = active === n.id;
            return (
              <div className="nav-section" key={n.id}>
                <button
                   className={"nav-item" + (isModuleActive && n.tabs.length === 0 ? " nav-item-active" : "")}
                  style={{ color: isModuleActive ? (n.tabs.length === 0 ? "#fff" : color) : color, fontWeight: 600 }}
                  onClick={() => goTo(n.id, DEFAULT_TABS[n.id] || (n.tabs.length > 0 ? n.tabs[0] : undefined))}
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
          <div className="topbar-title">{filteredNavTree.find((n) => n.id === active)?.label || "Dashboard"}</div>
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
                position: "absolute", top: "45px", right: "0", background: COLORS.surface,
                border: `1px solid ${COLORS.line}`, borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)", width: "320px",
                maxHeight: "400px", overflowY: "auto", zIndex: 1000, padding: "12px"
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

            {/* User chip with dropdown */}
            <div style={{ position: "relative" }}>
              <div className="user-chip" onClick={() => setShowUserMenu(!showUserMenu)} style={{ cursor: "pointer" }}>
                <span className="user-avatar">{userInitials}</span>
                <span className="user-name">{user?.full_name || "User"}</span>
                <ChevronDown size={13} color={COLORS.inkSoft} />
              </div>
              {showUserMenu && (
                <div style={{
                  position: "absolute", top: "42px", right: "0", background: COLORS.surface,
                  border: `1px solid ${COLORS.line}`, borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)", width: "200px",
                  zIndex: 1001, overflow: "hidden",
                }}>
                  <div style={{ padding: "12px 14px", borderBottom: `1px solid ${COLORS.line}` }}>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: COLORS.ink }}>{user?.full_name}</div>
                    <div style={{ fontSize: "11px", color: COLORS.inkSoft }}>{user?.role_name}</div>
                  </div>
                  <button onClick={() => { setShowUserMenu(false); goTo("profile"); }}
                    style={{ width: "100%", padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: COLORS.ink, textAlign: "left" }}
                    onMouseEnter={(e) => e.target.style.background = COLORS.surface2}
                    onMouseLeave={(e) => e.target.style.background = "none"}>
                    <User size={14} /> My Profile
                  </button>
                  <button onClick={async () => { setShowUserMenu(false); await logout(); }}
                    style={{ width: "100%", padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: COLORS.bad, textAlign: "left", borderTop: `1px solid ${COLORS.line}` }}
                    onMouseEnter={(e) => e.target.style.background = COLORS.gameSoft}
                    onMouseLeave={(e) => e.target.style.background = "none"}>
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="content-area">{content}</main>
      </div>

      {/* Search Modal (preserved from original) */}
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
                <div className="search-results-empty">Type something to search across the ESG platform...</div>
              ) : searchResults.length === 0 ? (
                <div className="search-results-empty">No results found for "{searchQuery}"</div>
              ) : (
                searchResults.map((result, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div key={`${result.type}-${result.id}`}
                      className={`search-result-item ${isSelected ? "selected" : ""}`}
                      onClick={() => handleSelectResult(result)}>
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
