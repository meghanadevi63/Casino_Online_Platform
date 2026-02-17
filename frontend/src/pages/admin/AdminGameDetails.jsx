import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGameAnalyticsDetails } from "../../api/adminAnalytics.api";

const AdminGameDetails = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getGameAnalyticsDetails(gameId);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [gameId]);

  if (loading) return <div className="p-6 text-gray-400">Loading details...</div>;
  if (!data) return <div className="p-6 text-red-400">Game data not found</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="bg-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-700">
          ← Back
        </button>
        <h1 className="text-2xl font-bold">{data.game_name} Analytics</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Bets" value={`₹ ${data.total_bet_amount.toLocaleString()}`} color="text-white" />
        <StatCard label="Total Wins" value={`₹ ${data.total_win_amount.toLocaleString()}`} color="text-gray-300" />
        <StatCard label="GGR" value={`₹ ${data.ggr.toLocaleString()}`} color={data.ggr >= 0 ? "text-green-400" : "text-red-400"} />
        
        <StatCard label="Active Players" value={data.active_players} color="text-blue-400" />
        <StatCard label="Total Sessions" value={data.total_sessions} color="text-gray-400" />
        <StatCard label="RTP %" value={data.rtp_percentage ? `${data.rtp_percentage}%` : "N/A"} color="text-yellow-400" />
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
  <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

export default AdminGameDetails;