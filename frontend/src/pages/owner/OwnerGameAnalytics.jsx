import { useEffect, useState } from "react";
import { getGameAnalytics } from "../../api/superAnalytics.api";

const OwnerGameAnalytics = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getGameAnalytics();
        setRows(res.data || []);
      } catch (err) {
        console.error("❌ Game analytics load failed", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div className="text-gray-400">Loading game analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Game Analytics
      </h1>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="p-4 text-left">Game</th>
              <th className="p-4">Tenants Running</th>
              <th className="p-4">Active Players</th>
              <th className="p-4">Total Bets</th>
              <th className="p-4">Total Wins</th>
              <th className="p-4">GGR</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr
                key={r.game_id}
                className="border-t border-gray-800 hover:bg-gray-800"
              >
                <td className="p-4 font-semibold">{r.game_name}</td>
                <td className="p-4 text-center">{r.tenants_running}</td>
                <td className="p-4 text-center">{r.active_players}</td>
                <td className="p-4 text-right">₹ {r.total_bets.toLocaleString()}</td>
                <td className="p-4 text-right">₹ {r.total_wins.toLocaleString()}</td>
                <td className="p-4 text-right font-semibold text-yellow-400">
                  ₹ {r.ggr.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            No game analytics data
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerGameAnalytics;
