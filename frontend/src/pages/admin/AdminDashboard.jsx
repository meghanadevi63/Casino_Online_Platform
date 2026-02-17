import { useEffect, useState } from "react";
import { getTenantDashboard, runSnapshot } from "../../api/adminAnalytics.api"; // Import new API
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Snapshot Tool State
  const [snapDate, setSnapDate] = useState(new Date().toISOString().split('T')[0]);
  const [processing, setProcessing] = useState(false);

  // Load Data
  const fetchData = async () => {
    try {
      // Don't set full loading to true on refresh to avoid flickering
      const res = await getTenantDashboard();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Manual Snapshot Run
  const handleRunSnapshot = async () => {
    try {
      setProcessing(true);
      await runSnapshot(snapDate);
      alert(`Snapshot generated for ${snapDate}. Refreshing data...`);
      await fetchData(); // 🔄 Reload dashboard immediately
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to run snapshot");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-400">Loading dashboard...</div>;
  if (!data) return <div className="p-6 text-gray-400">No data available.</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Casino Dashboard</h1>
        <button onClick={fetchData} className="bg-gray-800 px-4 py-2 rounded text-sm hover:bg-gray-700">
          Refresh Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KpiCard label="Gross Gaming Revenue" value={`₹ ${data.financials.ggr}`} color="text-green-400" />
        <KpiCard label="Total Bets" value={`₹ ${data.financials.total_bets}`} color="text-white" />
        <KpiCard label="Active Players" value={data.players.active} color="text-blue-400" />
        <KpiCard label="RTP %" value={`${data.financials.rtp}%`} color="text-yellow-400" />
      </div>

      {/* Chart */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl h-80">
        <h3 className="text-lg font-bold text-white mb-4">Revenue Trend (30 Days)</h3>
        {data.timeseries.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.timeseries}>
              <XAxis dataKey="date" tick={{fontSize: 12}} />
              <YAxis />
              <Tooltip contentStyle={{backgroundColor: '#111827', border: '1px solid #374151'}} />
              <Line type="monotone" dataKey="ggr" stroke="#10B981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No history yet. Run a snapshot below.
          </div>
        )}
      </div>

      {/* 🛠️ MANUAL SNAPSHOT TOOL */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
        <h3 className="text-lg font-bold text-gray-300 mb-2">Data Tools (Manual Trigger)</h3>
        <p className="text-xs text-gray-500 mb-4">
          Analytics are usually calculated automatically at midnight. You can force a calculation here for testing.
        </p>
        
        <div className="flex gap-4 items-end">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Select Date</label>
            <input 
              type="date" 
              className="bg-black border border-gray-700 p-2 rounded text-white text-sm"
              style={{ colorScheme: "dark" }}
              value={snapDate}
              onChange={(e) => setSnapDate(e.target.value)}
            />
          </div>
          <button 
            onClick={handleRunSnapshot}
            disabled={processing}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-bold disabled:opacity-50"
          >
            {processing ? "Generating..." : "⚡ Run Snapshot & Refresh"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper
const KpiCard = ({ label, value, color }) => (
  <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
    <p className="text-gray-400 text-sm">{label}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

export default AdminDashboard;