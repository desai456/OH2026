const API_BASE_URL = "http://localhost:8000/api";

export async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem("access_token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  let response = await fetch(url, { ...options, headers });

  // On 401, try refreshing the token once
  if (response.status === 401 && token) {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        localStorage.setItem("user_data", JSON.stringify(data.user));
        headers["Authorization"] = `Bearer ${data.access_token}`;
        response = await fetch(url, { ...options, headers });
      } else {
        // Refresh failed - clear auth and redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_data");
        window.location.reload();
        throw new Error("Session expired. Please login again.");
      }
    }
  }

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






// Auth & Profile APIs
export const getProfile = () => fetchAPI("/auth/me");
export const updateProfile = (data) => fetchAPI("/auth/me", { method: "PUT", body: JSON.stringify(data) });
export const changePassword = (data) => fetchAPI("/auth/change-password", { method: "PUT", body: JSON.stringify(data) });

// Admin APIs (Super Admin only)
export const getUsers = () => fetchAPI("/admin/users");
export const createUser = (data) => fetchAPI("/admin/users", { method: "POST", body: JSON.stringify(data) });
export const updateUser = (id, data) => fetchAPI(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteUser = (id) => fetchAPI(`/admin/users/${id}`, { method: "DELETE" });
export const getRoles = () => fetchAPI("/admin/roles");
export const getPermissions = () => fetchAPI("/admin/permissions");
export const updateRolePermissions = (roleId, permissionIds) => fetchAPI(`/admin/roles/${roleId}/permissions`, { method: "PUT", body: JSON.stringify({ permission_ids: permissionIds }) });
export const getLoginHistory = () => fetchAPI("/admin/login-history");


// Enhanced Rewards APIs
export const getEmployeeBalance = (name) => fetchAPI(`/gamification/employee-balance?employee_name=${encodeURIComponent(name)}`);
export const getRedemptionHistory = (name) => fetchAPI(`/gamification/redemption-history?employee_name=${encodeURIComponent(name)}`);
export const redeemRewardV2 = (rewardId, employeeName) => fetchAPI(`/gamification/redeem-v2?reward_id=${rewardId}&employee_name=${encodeURIComponent(employeeName)}`, { method: "POST" });
export const getRewardsEnhanced = (name) => fetchAPI(`/gamification/rewards-enhanced?employee_name=${encodeURIComponent(name)}`);
