import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPlatformOverview,
  getPlatformTimeseries,
} from "../../api/superAnalytics.api";
import { getPendingRequests } from "../../api/superRequests.api";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const OwnerOverview = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [timeseries, setTimeseries] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);

        // ✅ Robust Loading Strategy
        // We load Analytics separate from Requests so one failure doesn't kill the page
        
        // 1. Load Main Analytics (Critical)
        try {
          const [overviewRes, tsRes] = await Promise.all([
            getPlatformOverview({ range: 30 }),
            getPlatformTimeseries({ range: 30 })
          ]);
          setOverview(overviewRes.data);
          setTimeseries(Array.isArray(tsRes.data) ? tsRes.data : []);
        } catch (err) {
          console.error("❌ Analytics Load Failed:", err);
        }

        // 2. Load Pending Requests (Non-Critical)
        try {
          const reqRes = await getPendingRequests();
          setPendingCount(reqRes.data ? reqRes.data.length : 0);
        } catch (err) {
          console.warn("⚠️ Requests Load Failed (Check backend router):", err);
          setPendingCount(0); // Default to 0 if fails
        }

      } catch (err) {
        console.error("❌ Fatal Dashboard Error", err);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  if (loading) {
    return <div className="text-gray-400">Loading platform overview...</div>;
  }

  if (!overview) {
    return <div className="text-red-400">Failed to load overview data. Check server logs.</div>;
  }

  const { tenants = {}, players = {}, financials = {} } = overview;

  return (
    <div className="space-y-8">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl font-bold">Platform Overview</h1>
        <p className="text-sm text-gray-400">Consolidated metrics across all tenants</p>
      </div>

      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* ✅ Access Requests Widget */}
        <div 
          onClick={() => navigate("/owner/requests")}
          className="bg-gray-900 border border-red-500/50 p-6 rounded-xl cursor-pointer hover:bg-gray-800 transition shadow-lg shadow-red-900/10 group relative overflow-hidden"
        >
          <div className="text-sm text-red-400 mb-1 group-hover:text-red-300 font-bold flex items-center gap-2">
            📢 Access Requests
            {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
          </div>
          <div className="text-3xl font-bold text-white">{pendingCount}</div>
          <p className="text-xs text-gray-500 mt-2">Tenants waiting for contracts</p>
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-red-500/10 blur-2xl rounded-full"></div>
        </div>

        <KpiCard title="Total Tenants" value={tenants.total ?? 0} />
        <KpiCard title="Active Tenants" value={tenants.active ?? 0} />
        <KpiCard title="Total Players" value={players.total_players ?? 0} />
      </div>

      {/* ================= FINANCIALS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="Total Bets" value={`₹ ${(financials.total_bets ?? 0).toLocaleString()}`} />
        <KpiCard title="Total Wins" value={`₹ ${(financials.total_wins ?? 0).toLocaleString()}`} />
        <KpiCard 
          title="RTP %" 
          value={financials.rtp_percentage !== undefined ? `${financials.rtp_percentage}%` : "N/A"} 
        />
      </div>

      {/* ================= CHART ================= */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-yellow-400 mb-4">GGR Trend (Last 30 Days)</h2>
        {timeseries.length === 0 ? (
          <div className="text-gray-500 text-sm">No timeseries data available</div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeseries}>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#111827", borderColor: "#374151" }} 
                  itemStyle={{ color: "#fbbf24" }}
                />
                <Line type="monotone" dataKey="ggr" stroke="#facc15" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Component
const KpiCard = ({ title, value }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
    <div className="text-sm text-gray-400 mb-1">{title}</div>
    <div className="text-2xl font-bold text-yellow-400">{value}</div>
  </div>
);

export default OwnerOverview;