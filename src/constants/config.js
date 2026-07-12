import {
  LayoutDashboard, Leaf, Users, ShieldCheck, Trophy, FileBarChart2, Settings as SettingsIcon
} from "lucide-react";

export const COLORS = {
  env: "#2F6B4F", envSoft: "#E4EEE3", envDark: "#1E4735",
  social: "#B8752E", socialSoft: "#F4E9D7", socialDark: "#7C4E1D",
  gov: "#3D4A78", govSoft: "#E5E7F1", govDark: "#272E4B",
  game: "#A13350", gameSoft: "#F3E1E7", gameDark: "#6C2136",
  ink: "#1C231F", inkSoft: "#5B655D", line: "#DFDACD",
  bg: "#F6F4EE", surface: "#FFFFFF", surface2: "#FBFAF5",
  good: "#2F6B4F", warn: "#B8752E", bad: "#A13350",
};

export const NAV_TREE = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, tone: "ink", tabs: [] },
  { id: "environmental", label: "Environmental", icon: Leaf, tone: "env", tabs: ["Emission factors", "Product ESG profiles", "Carbon transactions", "Environmental goals", "Emissions forecast (ML)"] },
  { id: "social", label: "Social", icon: Users, tone: "social", tabs: ["CSR activities", "Employee participation", "Diversity dashboard"] },
  { id: "governance", label: "Governance", icon: ShieldCheck, tone: "gov", tabs: ["Policies", "Policy acknowledgements", "Audits", "Compliance issues"] },
  { id: "gamification", label: "Gamification", icon: Trophy, tone: "game", tabs: ["Challenges", "Challenge participation", "Badges", "Rewards", "Leaderboard"] },
  { id: "reports", label: "Reports", icon: FileBarChart2, tone: "gov", tabs: ["Environmental report", "Social report", "Governance report", "ESG summary", "Custom report builder", "Predictive Analytics (ML)"] },
  { id: "settings", label: "Settings", icon: SettingsIcon, tone: "env", tabs: ["Departments", "Categories", "ESG configuration", "Notification settings"] },
];

export const DEFAULT_TABS = {
  environmental: "Environmental goals", social: "CSR activities", governance: "Compliance issues",
  gamification: "Challenges", reports: "ESG summary", settings: "Departments",
};

export const REPORT_TAB_KEY = {
  "Environmental report": "environmental", "Social report": "social",
  "Governance report": "governance", "ESG summary": "summary",
};
