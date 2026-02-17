import axios from "./axios";

// 1. Overview (Dashboard)
export const getTenantDashboard = () => 
  axios.get("/admin/analytics/overview");

// 2. Run Snapshot Manually
export const runSnapshot = (date) => 
  axios.post(`/admin/analytics/snapshot/run`, null, {
    params: { snapshot_date: date }
  });

// 3. List Games (Latest Snapshot)
export const getGamesAnalytics = () => 
  axios.get("/admin/analytics/games");

// 4. List Games (Predefined Range: 7d, 30d)
export const getGamesAnalyticsRange = (range) => 
  axios.get("/admin/analytics/games/range", { params: { range } });

// 5. List Games (Custom Date)
export const getGamesAnalyticsCustom = (startDate, endDate) => 
  axios.get("/admin/analytics/games/custom", { 
    params: { start_date: startDate, end_date: endDate } 
  });

// 6. Single Game Details
export const getGameAnalyticsDetails = (gameId) => 
  axios.get(`/admin/analytics/games/${gameId}`);


export const getTenantOperatingCountries = () => 
  axios.get("/admin/analytics/operating-countries");


export const getLiveDashboard = (countryCode) => 
  axios.get("/admin/analytics/live-dashboard", { 
    params: { country_code: countryCode } 
  });

