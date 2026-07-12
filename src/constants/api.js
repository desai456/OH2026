const API_BASE_URL = "http://localhost:8000/api";

export async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to fetch: ${response.statusText}`);
  }
  return response.json();
}

// Dashboard
export const getDashboardSummary = () => fetchAPI("/dashboard");

// Environmental
export const getEnvironmentalGoals = () => fetchAPI("/environmental/goals");
export const createEnvironmentalGoal = (data) => fetchAPI("/environmental/goals", { method: "POST", body: JSON.stringify(data) });
export const getEmissionFactors = () => fetchAPI("/environmental/factors");
export const createEmissionFactor = (data) => fetchAPI("/environmental/factors", { method: "POST", body: JSON.stringify(data) });
export const getCarbonTransactions = () => fetchAPI("/environmental/transactions");
export const createCarbonTransaction = (data) => fetchAPI("/environmental/transactions", { method: "POST", body: JSON.stringify(data) });
export const getProductProfiles = () => fetchAPI("/environmental/products");

// Social
export const getCSRActivities = () => fetchAPI("/social/activities");
export const joinCSRActivity = (id, employeeName) => fetchAPI(`/social/activities/${id}/join?employee_name=${encodeURIComponent(employeeName)}`, { method: "POST" });
export const getParticipationQueue = () => fetchAPI("/social/participation");
export const updateParticipationStatus = (id, status) => fetchAPI(`/social/participation/${id}?status=${status}`, { method: "PUT" });
export const getDiversityDashboard = () => fetchAPI("/social/diversity");
export const getTrainingCompletion = () => fetchAPI("/social/training");

// Governance
export const getPolicies = () => fetchAPI("/governance/policies");
export const getPolicyAcknowledgements = () => fetchAPI("/governance/acknowledgements");
export const getAudits = () => fetchAPI("/governance/audits");
export const createAudit = (data) => fetchAPI("/governance/audits", { method: "POST", body: JSON.stringify(data) });
export const getComplianceIssues = () => fetchAPI("/governance/issues");
export const createComplianceIssue = (data) => fetchAPI("/governance/issues", { method: "POST", body: JSON.stringify(data) });
export const resolveComplianceIssue = (id) => fetchAPI(`/governance/issues/${id}`, { method: "PUT" });

// Gamification
export const getChallenges = () => fetchAPI("/gamification/challenges");
export const createChallenge = (data) => fetchAPI("/gamification/challenges", { method: "POST", body: JSON.stringify(data) });
export const joinChallenge = (id, employeeName) => fetchAPI(`/gamification/challenges/${id}/join?employee_name=${encodeURIComponent(employeeName)}`, { method: "POST" });
export const getChallengeParticipation = () => fetchAPI("/gamification/participation");
export const updateChallengeParticipationStatus = (id, status) => fetchAPI(`/gamification/participation/${id}?status=${status}`, { method: "PUT" });
export const getBadges = () => fetchAPI("/gamification/badges");
export const getRewards = () => fetchAPI("/gamification/rewards");
export const redeemReward = (rewardId, employeeName) => fetchAPI(`/gamification/redeem?reward_id=${rewardId}&employee_name=${encodeURIComponent(employeeName)}`, { method: "POST" });
export const getLeaderboard = () => fetchAPI("/gamification/leaderboard");

// Settings & Configs
export const getDepartments = () => fetchAPI("/settings/departments");
export const createDepartment = (data) => fetchAPI("/settings/departments", { method: "POST", body: JSON.stringify(data) });
export const getCategories = () => fetchAPI("/settings/categories");
export const createCategory = (data) => fetchAPI("/settings/categories", { method: "POST", body: JSON.stringify(data) });
export const getConfigs = () => fetchAPI("/settings/configs");
export const saveConfigs = (data) => fetchAPI("/settings/configs", { method: "POST", body: JSON.stringify(data) });
export const getEmployees = () => fetchAPI("/settings/employees");
export const getChallengesList = () => fetchAPI("/settings/challenges");

// Notifications
export const getNotifications = () => fetchAPI("/notifications");

// Custom Reports
export const generateCustomReport = (params) => {
  const query = new URLSearchParams(params).toString();
  return fetchAPI(`/reports/custom?${query}`);
};

// Global Search
export const getSearchResults = (q) => fetchAPI(`/search?q=${encodeURIComponent(q)}`);

// ML Forecasting
export const getEmissionsForecast = () => fetchAPI("/environmental/forecast");
export const trainEmissionsModel = () => fetchAPI("/environmental/forecast/train", { method: "POST" });

// Advanced ML Models
export const getMLInsights = () => fetchAPI("/reports/ml-insights");
export const predictParticipation = (payload) => fetchAPI("/reports/ml-insights/predict-participation", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
});
export const trainAdvancedModels = () => fetchAPI("/reports/ml-insights/train", { method: "POST" });



