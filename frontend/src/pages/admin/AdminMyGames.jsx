import { useEffect, useState, useCallback, useMemo } from "react";
import { getMyGames, updateMyGame } from "../../api/adminGames.api";
import AdminEditGameModal from "./AdminEditGameModal";
import { 
  Gamepad2, 
  Search, 
  Building2, 
  Settings2, 
  RefreshCw, 
  Filter, 
  Coins,
  XCircle,
  CheckCircle2,
  Power,
  Ban
} from "lucide-react";

const AdminMyGames = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [providers, setProviders] = useState([]);

  const [editingGame, setEditingGame] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const loadGames = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyGames();
      setGames(res.data);
      const uniqueProviders = [...new Set(res.data.map(g => g.provider_name))];
      setProviders(uniqueProviders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  const filteredGames = useMemo(() => {
    return games.filter(g => {
      const matchesSearch = g.game_name.toLowerCase().includes(search.toLowerCase()) || 
                           g.game_code.toLowerCase().includes(search.toLowerCase());
      const matchesProvider = selectedProvider === "all" || g.provider_name === selectedProvider;
      return matchesSearch && matchesProvider;
    });
  }, [search, selectedProvider, games]);

  const handleToggle = async (game) => {
    try {
      setTogglingId(game.game_id);
      await updateMyGame(game.game_id, { is_active: !game.is_active });
      await loadGames();
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedProvider("all");
  };

  if (loading && games.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <RefreshCw className="animate-spin mb-2" size={32} />
      <p className="font-bold">Accessing Library...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <Gamepad2 className="text-yellow-500" size={28} />
          <h1 className="text-2xl font-bold text-white">Games Library</h1>
        </div>
        <button 
          onClick={loadGames} 
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors cursor-pointer"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-900 p-4 rounded-xl border border-gray-800 shadow-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            placeholder="Search by name or code..."
            className="w-full bg-black border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-yellow-500 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 pointer-events-none" size={18} />
          <select 
            className="w-full bg-black border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-yellow-500 outline-none appearance-none cursor-pointer"
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
          >
            <option value="all">All Providers</option>
            {providers.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={resetFilters}
          className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded-lg transition-all border border-transparent hover:border-red-500/30 font-bold text-xs uppercase"
        >
          Clear Filters
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-black/50 text-xs font-bold text-gray-400 border-b border-gray-800 uppercase tracking-widest">
                <th className="px-6 py-4">Game Information</th>
                <th className="px-6 py-4">Provider</th>
                <th className="px-6 py-4 text-center">Bet Limits</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Quick Action</th>
                <th className="px-6 py-4 text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredGames.map(g => (
                <tr key={g.game_id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-sm">{g.game_name}</span>
                      <span className="text-[10px] text-gray-500 font-mono uppercase tracking-tighter">{g.game_code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-blue-400 font-bold">
                        <Building2 size={14} /> {g.provider_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                        <Coins size={12} className="text-yellow-600" /> {g.min_bet} - {g.max_bet}
                    </div>
                  </td>

                  {/*  Clear Status Indicator */}
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${g.is_active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
                        <span className={`text-xs font-bold ${g.is_active ? 'text-green-500' : 'text-red-500'}`}>
                            {g.is_active ? "Active" : "Inactive"}
                        </span>
                    </div>
                  </td>

                  {/*  Clear Action Button Beside Status */}
                  <td className="px-6 py-4 text-center">
                    <button 
                        onClick={() => handleToggle(g)}
                        disabled={togglingId === g.game_id}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer border ${
                            g.is_active 
                            ? "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-600 hover:text-white" 
                            : "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-600 hover:text-white"
                        }`}
                    >
                        {togglingId === g.game_id ? (
                            <RefreshCw size={12} className="animate-spin" />
                        ) : g.is_active ? (
                            <> <Ban size={12} /> Disable Game </>
                        ) : (
                            <> <CheckCircle2 size={12} /> Enable Game </>
                        )}
                    </button>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button 
                        onClick={() => setEditingGame(g)}
                        className="p-2 bg-gray-800 hover:bg-yellow-500 text-yellow-500 hover:text-black rounded-lg transition-all cursor-pointer border border-gray-700 hover:border-yellow-500"
                        title="Edit Configuration"
                    >
                        <Settings2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredGames.length === 0 && !loading && (
          <div className="p-20 text-center">
            <Gamepad2 className="mx-auto mb-4 opacity-20 text-gray-400" size={48} />
            <p className="text-gray-500 font-bold text-sm">No games found matching your search</p>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingGame && (
        <AdminEditGameModal
          game={editingGame}
          onClose={() => setEditingGame(null)}
          onSuccess={loadGames}
        />
      )}
    </div>
  );
};

export default AdminMyGames;