import {
  Check, AlertTriangle, Factory, FileCheck2, Award,
  TreePine, HeartPulse, Waves, GraduationCap,
  Sparkles, Leaf, Crown, Medal, Users, ShieldCheck, FileBarChart2
} from "lucide-react";

export const emissionsTrend = [
  { m: "Aug", t: 612 }, { m: "Sep", t: 588 }, { m: "Oct", t: 601 },
  { m: "Nov", t: 549 }, { m: "Dec", t: 502 }, { m: "Jan", t: 470 },
  { m: "Feb", t: 455 }, { m: "Mar", t: 481 }, { m: "Apr", t: 468 },
  { m: "May", t: 440 }, { m: "Jun", t: 418 }, { m: "Jul", t: 399 },
];

export const deptScores = [
  { dept: "Sales", score: 68 }, { dept: "Mfg", score: 79 },
  { dept: "Logistics", score: 71 }, { dept: "Corp", score: 88 },
  { dept: "R&D", score: 74 }, { dept: "Procurement", score: 65 },
];

export const recentActivity = [
  { icon: Check, text: "Priya completed ‘Zero Waste Week’", tone: "env", time: "2h ago" },
  { icon: AlertTriangle, text: "New compliance issue raised in Logistics", tone: "gov", time: "4h ago" },
  { icon: Factory, text: "42 new Carbon Transactions logged (auto)", tone: "env", time: "6h ago" },
  { icon: FileCheck2, text: "R&D acknowledged Anti-Corruption Policy", tone: "gov", time: "1d ago" },
  { icon: Award, text: "Karan Shah unlocked ‘Carbon Saver’ badge", tone: "game", time: "1d ago" },
];

export const environmentalGoals = [
  { name: "Reduce fleet emissions", dept: "Logistics", target: 500, current: 390, unit: "t CO₂e", deadline: "31 Dec 2026", status: "Active" },
  { name: "Cut packaging waste", dept: "Manufacturing", target: 120, current: 98, unit: "t", deadline: "30 Sep 2026", status: "On track" },
  { name: "Office energy cut", dept: "Corporate", target: 80, current: 80, unit: "MWh", deadline: "30 Jun 2026", status: "Completed" },
  { name: "Water usage reduction", dept: "R&D", target: 40, current: 22, unit: "kL", deadline: "31 Oct 2026", status: "Active" },
  { name: "Renewable energy adoption", dept: "Corporate", target: 60, current: 34, unit: "%", deadline: "31 Mar 2027", status: "At risk" },
];

export const emissionFactors = [
  { category: "Diesel (fleet)", unit: "litre", factor: "2.68 kg CO₂e", source: "DEFRA 2026", status: "Active" },
  { category: "Grid electricity", unit: "kWh", factor: "0.71 kg CO₂e", source: "CEA India", status: "Active" },
  { category: "Air travel (domestic)", unit: "passenger-km", factor: "0.15 kg CO₂e", source: "DEFRA 2026", status: "Active" },
  { category: "Packaging (cardboard)", unit: "kg", factor: "0.94 kg CO₂e", source: "Internal LCA", status: "Draft" },
  { category: "Natural gas", unit: "m³", factor: "2.03 kg CO₂e", source: "DEFRA 2026", status: "Active" },
];

export const carbonTransactions = [
  { date: "10 Jul", dept: "Logistics", source: "Fleet", qty: "1,240 L", co2e: "3.32 t", mode: "Auto" },
  { date: "10 Jul", dept: "Manufacturing", source: "Purchase", qty: "3,800 kg", co2e: "3.57 t", mode: "Auto" },
  { date: "09 Jul", dept: "Corporate", source: "Expense", qty: "6,120 kWh", co2e: "4.35 t", mode: "Auto" },
  { date: "08 Jul", dept: "R&D", source: "Manufacturing", qty: "410 m³", co2e: "0.83 t", mode: "Manual" },
  { date: "07 Jul", dept: "Sales", source: "Fleet", qty: "860 L", co2e: "2.30 t", mode: "Auto" },
];

export const productProfiles = [
  { product: "EcoLine Packaging A2", footprint: "0.42 kg CO₂e / unit", recyclable: "92%", cert: "FSC Certified" },
  { product: "Industrial Component X9", footprint: "3.1 kg CO₂e / unit", recyclable: "48%", cert: "—" },
  { product: "Retail Bag – Kraft", footprint: "0.08 kg CO₂e / unit", recyclable: "100%", cert: "Compostable" },
];

export const csrActivities = [
  { name: "Tree plantation", icon: TreePine, joined: 24, evidence: true, tone: "env" },
  { name: "Blood donation drive", icon: HeartPulse, joined: 18, evidence: true, tone: "social" },
  { name: "Beach cleanup", icon: Waves, joined: 31, evidence: false, tone: "env" },
  { name: "ESG workshop", icon: GraduationCap, joined: 52, evidence: false, tone: "social" },
];

export const participationQueueSeed = [
  { emp: "Aditi Rao", activity: "Tree plantation", proof: "photo.jpg", points: 50, status: "Pending" },
  { emp: "Karan Shah", activity: "ESG workshop", proof: "cert.pdf", points: 30, status: "Approved" },
  { emp: "Rohan Verma", activity: "Blood donation drive", proof: "receipt.pdf", points: 40, status: "Pending" },
  { emp: "Priya Menon", activity: "Beach cleanup", proof: "—", points: 25, status: "Approved" },
];

export const diversityData = [
  { name: "Women", value: 41 }, { name: "Men", value: 57 }, { name: "Other / undisclosed", value: 2 },
];

export const trainingCompletion = [
  { dept: "Sales", pct: 82 }, { dept: "Mfg", pct: 95 }, { dept: "Logistics", pct: 74 },
  { dept: "Corp", pct: 99 }, { dept: "R&D", pct: 88 },
];

export const policies = [
  { name: "Anti-Corruption Policy", owner: "Legal", version: "v3.2", updated: "12 Mar 2026" },
  { name: "Data Privacy Policy", owner: "IT Governance", version: "v2.0", updated: "01 Feb 2026" },
  { name: "Code of Conduct", owner: "HR", version: "v4.1", updated: "18 May 2026" },
  { name: "Whistleblower Policy", owner: "Legal", version: "v1.4", updated: "22 Jan 2026" },
];

export const policyAck = [
  { dept: "Manufacturing", acknowledged: 96 }, { dept: "Sales", acknowledged: 88 },
  { dept: "Logistics", acknowledged: 79 }, { dept: "Corporate", acknowledged: 100 },
  { dept: "R&D", acknowledged: 91 },
];

export const audits = [
  { title: "Q2 waste audit", dept: "Manufacturing", auditor: "S. Nair", date: "12 Jun 2026", findings: "3 minor issues", status: "Completed" },
  { title: "Vendor compliance check", dept: "Procurement", auditor: "R. Iyer", date: "01 Jul 2026", findings: "1 open issue", status: "Under review" },
  { title: "Data handling review", dept: "IT", auditor: "M. Fernandes", date: "22 Jun 2026", findings: "No issues", status: "Completed" },
];

export const complianceIssuesSeed = [
  { issue: "Missing MSDS sheets", severity: "High", dept: "Manufacturing", owner: "S. Nair", due: "20 Jul 2026", status: "Open" },
  { issue: "Late vendor disclosure", severity: "Medium", dept: "Procurement", owner: "R. Iyer", due: "05 Jul 2026", status: "Resolved" },
  { issue: "Incomplete audit trail", severity: "Low", dept: "IT", owner: "M. Fernandes", due: "30 Jul 2026", status: "Open" },
];

export const challengesSeed = [
  { name: "Sustainability Sprint", xp: 200, difficulty: "Hard", deadline: "20 Jul", status: "Active", category: "Environmental" },
  { name: "Recycle Challenge", xp: 80, difficulty: "Easy", deadline: "15 Jul", status: "Active", category: "Environmental" },
  { name: "Commute Green Week", xp: 120, difficulty: "Medium", deadline: "25 Jul", status: "Draft", category: "Social" },
  { name: "Paperless July", xp: 60, difficulty: "Easy", deadline: "31 Jul", status: "Under review", category: "Governance" },
  { name: "Energy Watch Q2", xp: 150, difficulty: "Medium", deadline: "30 Jun", status: "Completed", category: "Environmental" },
];

export const badges = [
  { name: "Green Beginner", rule: "Earn 100 XP", icon: Sparkles },
  { name: "Carbon Saver", rule: "Complete 3 environmental challenges", icon: Leaf },
  { name: "Sustainability Champion", rule: "Earn 2,000 XP", icon: Crown },
  { name: "Team Player", rule: "Join 5 CSR activities", icon: Medal },
];

export const rewardsSeed = [
  { name: "Eco tumbler", points: 150, stock: 34 },
  { name: "Extra WFH day", points: 300, stock: 12 },
  { name: "Plant-a-tree donation", points: 100, stock: 999 },
  { name: "Amazon voucher ₹1,000", points: 800, stock: 6 },
];

export const challengeParticipationSeed = [
  { challenge: "Sustainability Sprint", emp: "Aditi Rao", progress: 80, proof: "log.pdf", approval: "Pending", xp: 0 },
  { challenge: "Recycle Challenge", emp: "Karan Shah", progress: 100, proof: "photo.jpg", approval: "Approved", xp: 80 },
  { challenge: "Recycle Challenge", emp: "Rohan Verma", progress: 60, proof: "—", approval: "Pending", xp: 0 },
  { challenge: "Energy Watch Q2", emp: "Priya Menon", progress: 100, proof: "report.pdf", approval: "Approved", xp: 150 },
];

export const leaderboard = [
  { rank: 1, name: "Manufacturing Dept", xp: 4820 },
  { rank: 2, name: "Aditi Rao", xp: 3910 },
  { rank: 3, name: "Corporate Dept", xp: 3505 },
  { rank: 4, name: "Karan Shah", xp: 3120 },
  { rank: 5, name: "R&D Dept", xp: 2870 },
];

export const reportCards = [
  { key: "environmental", title: "Environmental report", desc: "Emissions, goals, vendor and product breakdown", icon: Leaf, tone: "env" },
  { key: "social", title: "Social report", desc: "Diversity, CSR participation, training completion", icon: Users, tone: "social" },
  { key: "governance", title: "Governance report", desc: "Policies, audits, compliance and risk summary", icon: ShieldCheck, tone: "gov" },
  { key: "summary", title: "ESG summary report", desc: "Executive overview: all four scores and department comparison", icon: FileBarChart2, tone: "game" },
];

export const departmentsSeed = [
  { name: "Manufacturing", code: "MFG", head: "S. Nair", employees: 214, status: "Active" },
  { name: "Sales", code: "SLS", head: "V. Kapoor", employees: 96, status: "Active" },
  { name: "Logistics", code: "LOG", head: "A. Roy", employees: 58, status: "Active" },
  { name: "Corporate", code: "COR", head: "N. Desai", employees: 41, status: "Active" },
  { name: "R&D", code: "RND", head: "P. Menon", employees: 73, status: "Active" },
];

export const categories = [
  { name: "Tree Plantation", type: "CSR Activity" }, { name: "Blood Donation", type: "CSR Activity" },
  { name: "Recycling", type: "Challenge" }, { name: "Commute", type: "Challenge" },
];
