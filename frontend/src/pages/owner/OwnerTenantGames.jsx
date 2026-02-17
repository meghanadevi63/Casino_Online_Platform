import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  getTenantGames,
  updateTenantGame,
} from "../../api/superTenantGames.api";
import EnableTenantGameModal from "./EnableTenantGameModal";
import EditTenantGameModal from "./EditTenantGameModal";
import { 
  Gamepad2, 
  Plus, 
  Settings2, 
  Power, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  SearchX,
  Coins,
  Cpu
} from "lucide-react";

const OwnerTenantGames = () => {
  const { tenantId } = useParams();

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showAdd, setShowAdd] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [updatingGameId, setUpdatingGameId] = useState(null);

  const loadGames = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTenantGames(tenantId);
      setGames(res.data);
    } catch (err) {
      console.error("❌ Failed to load tenant games", err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  const toggleStatus = async (game) => {
    try {
      setUpdatingGameId(game.game_id);
      await updateTenantGame(tenantId, game.game_id, {
        is_active: !game.is_active,
      });
      await loadGames();
    } catch (err) {
      console.error("❌ Failed to update game status", err);
    } finally {
      setUpdatingGameId(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <RefreshCw className="animate-spin mb-2" size={32} />
      <p className="text-[10px] font-black uppercase tracking-[4px]">Loading Catalog...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <Gamepad2 className="text-yellow-500" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-white">Active Games Library</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Tenant Specific Configuration</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 cursor-pointer"
        >
          <Plus size={18} strokeWidth={3} /> Enable Game
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-black/50 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800">
                <th className="px-6 py-4">Game Title</th>
                <th className="px-6 py-4">Provider</th>
                <th className="px-6 py-4 text-center">Live Status</th>
                <th className="px-6 py-4 text-center">Bet Limits</th>
                <th className="px-6 py-4 text-center">RTP</th>
                <th className="px-6 py-4 text-right">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {games.map((g) => (
                <tr key={g.game_id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-800 p-2 rounded-lg text-gray-400 group-hover:text-yellow-500 transition-colors">
                        <Gamepad2 size={16} />
                      </div>
                      <span className="font-bold text-white text-sm">{g.game_name}</span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                      <Cpu size={14} /> {g.provider_name}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                      g.is_active 
                        ? "bg-green-500/10 text-green-500 border-green-500/20" 
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                    }`}>
                      {g.is_active ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                      {g.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-2 bg-black/30 px-3 py-1 rounded-lg border border-gray-800">
                        <Coins size={10} className="text-yellow-600" />
                        <span className="font-mono text-xs text-gray-300 font-bold">{g.min_bet_override ?? '-'} / {g.max_bet_override ?? '-'}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center text-xs font-mono font-bold text-yellow-500">
                    {g.rtp_override ? `${g.rtp_override}%` : <span className="text-gray-600">-</span>}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingGame(g)}
                        className="p-2 bg-gray-800 hover:bg-yellow-500 text-yellow-500 hover:text-black rounded-lg border border-gray-700 transition-all cursor-pointer"
                        title="Edit Configuration"
                      >
                        <Settings2 size={16} />
                      </button>
                      <button
                        onClick={() => toggleStatus(g)}
                        disabled={updatingGameId === g.game_id}
                        className={`p-2 rounded-lg border transition-all cursor-pointer ${
                          g.is_active 
                          ? "bg-red-600/10 text-red-500 border-red-600/20 hover:bg-red-600 hover:text-white" 
                          : "bg-green-600/10 text-green-500 border-green-600/20 hover:bg-green-600 hover:text-white"
                        } disabled:opacity-30`}
                        title={g.is_active ? "Disable Game" : "Enable Game"}
                      >
                        {updatingGameId === g.game_id ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <Power size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {games.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center">
            <SearchX className="text-gray-800 mb-4" size={48} />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No games enabled for this tenant yet</p>
          </div>
        )}
      </div>

      {/* MODALS */}
      {showAdd && (
        <EnableTenantGameModal
          tenantId={tenantId}
          existingGames={games}
          onClose={() => setShowAdd(false)}
          onSuccess={loadGames}
        />
      )}

      {editingGame && (
        <EditTenantGameModal
          tenantId={tenantId}
          game={editingGame}
          onClose={() => setEditingGame(null)}
          onSuccess={loadGames}
        />
      )}
    </div>
  );
};

export default OwnerTenantGames;