import { useEffect, useState } from "react";
import { getTenantAnalytics } from "../../api/superAnalytics.api";

const OwnerTenantAnalytics = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTenantAnalytics();
        setRows(res.data || []);
      } catch (err) {
        console.error("❌ Tenant analytics load failed", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div className="text-gray-400">Loading tenant analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
         Tenant Analytics
      </h1>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="p-4 text-left">Tenant</th>
              <th className="p-4">Active Players</th>
              <th className="p-4">Total Bets</th>
              <th className="p-4">Total Wins</th>
              <th className="p-4">GGR</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr
                key={r.tenant_id}
                className="border-t border-gray-800 hover:bg-gray-800"
              >
                <td className="p-4 font-semibold">{r.tenant_name}</td>
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
            No tenant analytics data
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerTenantAnalytics;
