import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getGamesAnalytics,
  getGamesAnalyticsRange,
  getGamesAnalyticsCustom
} from "../../api/adminAnalytics.api";

const AdminAnalyticsGames = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter State
  const [filterType, setFilterType] = useState("latest"); // latest, 7d, 30d, custom
  const [customDates, setCustomDates] = useState({ start: "", end: "" });

  useEffect(() => {
    loadData();
  }, [filterType]); // Reload when filter changes

  const loadData = async () => {
    setLoading(true);
    try {
      let res;
      if (filterType === "latest") {
        res = await getGamesAnalytics();
      } else if (filterType === "7d" || filterType === "30d") {
        res = await getGamesAnalyticsRange(filterType);
      } else if (filterType === "custom" && customDates.start && customDates.end) {
        res = await getGamesAnalyticsCustom(customDates.start, customDates.end);
      } else {
        // If custom is selected but dates empty, wait for user input
        setLoading(false);
        return;
      }
      setGames(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSearch = () => {
    if (filterType === "custom") loadData();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Game Performance</h1>
        
        {/* FILTERS */}
        <div className="flex gap-2 items-center bg-gray-900 p-2 rounded-lg border border-gray-800">
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-black text-white border border-gray-700 rounded px-3 py-1 text-sm outline-none focus:border-yellow-400"
          >
            <option value="latest">Latest Snapshot</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </select>

          {/* Custom Date Inputs */}
          {filterType === "custom" && (
            <div className="flex gap-2 items-center">
              <input 
                type="date" 
                className="bg-black text-white border border-gray-700 rounded px-2 py-1 text-sm"
                style={{ colorScheme: "dark" }}
                onChange={(e) => setCustomDates({...customDates, start: e.target.value})}
              />
              <span className="text-gray-500">-</span>
              <input 
                type="date" 
                className="bg-black text-white border border-gray-700 rounded px-2 py-1 text-sm"
                style={{ colorScheme: "dark" }}
                onChange={(e) => setCustomDates({...customDates, end: e.target.value})}
              />
              <button 
                onClick={handleCustomSearch}
                className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-xs font-bold"
              >
                Go
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="text-gray-400">Loading analytics...</div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-800 text-gray-400">
              <tr>
                <th className="p-4">Game</th>
                <th className="p-4 text-center">Sessions</th>
                <th className="p-4 text-right">Total Bets</th>
                <th className="p-4 text-right">Total Wins</th>
                <th className="p-4 text-right">GGR</th>
                <th className="p-4 text-center">RTP</th>
                <th className="p-4 text-center">Players</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {games.map((g) => (
                <tr key={g.game_id} className="hover:bg-gray-800/50">
                  <td className="p-4 font-bold text-white">{g.game_name}</td>
                  <td className="p-4 text-center text-gray-400">{g.total_sessions || "-"}</td>
                  <td className="p-4 text-right">₹ {g.total_bet_amount.toLocaleString()}</td>
                  <td className="p-4 text-right">₹ {g.total_win_amount.toLocaleString()}</td>
                  <td className={`p-4 text-right font-bold ${g.ggr >= 0 ? "text-green-400" : "text-red-400"}`}>
                    ₹ {g.ggr.toLocaleString()}
                  </td>
                  <td className="p-4 text-center text-yellow-400 font-mono">
                    {g.rtp_percentage ? `${g.rtp_percentage}%` : "-"}
                  </td>
                  <td className="p-4 text-center text-blue-400">{g.active_players}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => navigate(`/admin/analytics/games/${g.game_id}`)}
                      className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs transition"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
              {games.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    No data found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminAnalyticsGames;