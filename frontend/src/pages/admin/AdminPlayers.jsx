import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAdminPlayers, updateAdminPlayerStatus } from "../../api/adminPlayers.api";
import { Users, Search, Eye, UserX, ShieldCheck, RefreshCw } from "lucide-react";

const AdminPlayers = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const navigate = useNavigate();

  const loadPlayers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminPlayers();
      setPlayers(res.data);
    } catch (err) {
      console.error("Failed to load players", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  const confirmSuspend = async () => {
    await updateAdminPlayerStatus(selectedPlayer.player_id, "suspended");
    setSelectedPlayer(null);
    loadPlayers();
  };

  const filteredPlayers = players.filter(p => 
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <RefreshCw className="mb-2" size={32} />
      <p>Loading database...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <Users className="text-yellow-500" size={28} />
          <h1 className="text-2xl font-bold">Player Management</h1>
        </div>

        <div className="relative min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-yellow-500 outline-none"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/50 text-sm font-bold text-gray-400 border-b border-gray-800">
                <th className="px-6 py-4">Player</th>
                <th className="px-6 py-4 hidden md:table-cell">KYC Status</th>
                <th className="px-6 py-4">Account Status</th>
                <th className="px-6 py-4 hidden lg:table-cell">Registered</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredPlayers.map((p) => (
                <tr key={p.player_id} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-white">{p.first_name} {p.last_name}</span>
                      <span className="text-xs text-gray-500 md:hidden">{p.email}</span>
                      <span className="text-xs text-gray-500 hidden md:block">{p.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className={`text-xs font-bold ${p.kyc_status === 'verified' ? 'text-green-500' : 'text-yellow-500'}`}>
                      {p.kyc_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={p.status === 'active' ? 'text-green-500' : 'text-red-500'}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-sm text-gray-500">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => navigate(`/admin/players/${p.player_id}`)}
                        className="p-2 bg-gray-800 hover:bg-yellow-500 hover:text-black rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye size={18} />
                      </button>
                      {p.status === "active" && (
                        <button 
                          onClick={() => setSelectedPlayer(p)}
                          className="p-2 bg-gray-800 hover:bg-red-600 text-red-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                        >
                          <UserX size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRM MODAL */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-gray-900 border border-gray-700 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2">Suspend Account</h2>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to suspend <span className="text-white font-bold">{selectedPlayer.first_name} {selectedPlayer.last_name}</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setSelectedPlayer(null)} className="flex-1 bg-gray-800 py-2 rounded-lg font-bold cursor-pointer">Cancel</button>
              <button onClick={confirmSuspend} className="flex-1 bg-red-600 py-2 rounded-lg font-bold cursor-pointer">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlayers;