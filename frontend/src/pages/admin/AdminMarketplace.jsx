import { useEffect, useState, useCallback } from "react";
import { getMarketplaceGames } from "../../api/adminMarketplace.api";
import AdminEnableGameModal from "./AdminEnableGameModal";
import RequestAccessModal from "../../components/RequestAccessModal";
import { 
  ShoppingBag, 
  Search, 
  Building2, 
  Percent, 
  Plus, 
  CheckCircle2, 
  Lock, 
  Gamepad2,
  RefreshCw
} from "lucide-react";

const AdminMarketplace = () => {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [enableGame, setEnableGame] = useState(null);
  const [requestGame, setRequestGame] = useState(null);

  const loadGames = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMarketplaceGames();
      setGames(res.data);
      setFilteredGames(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  useEffect(() => {
    if (!search) {
      setFilteredGames(games);
    } else {
      setFilteredGames(games.filter(g => 
        g.game_name.toLowerCase().includes(search.toLowerCase()) ||
        g.provider_name.toLowerCase().includes(search.toLowerCase())
      ));
    }
  }, [search, games]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <RefreshCw className="animate-spin mb-2" size={32} />
      <p className="font-bold">Syncing Marketplace...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <ShoppingBag className="text-yellow-500" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-white">Game Marketplace</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Expand your casino catalog</p>
          </div>
        </div>

        <div className="relative min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            placeholder="Search games or providers..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-yellow-500 outline-none transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map(game => (
          <div key={game.game_id} className="bg-gray-900 border border-gray-800 rounded-[2rem] p-6 hover:border-yellow-500/30 transition-all flex flex-col justify-between shadow-xl relative overflow-hidden group">
            
            {/* Background Decorative Icon */}
            <div className="absolute -top-6 -right-6 text-white opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                <Gamepad2 size={120} />
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-1.5 text-blue-400">
                    <Building2 size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{game.provider_name}</span>
                </div>
                {game.rtp && (
                    <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg border border-gray-800">
                        <Percent size={10} className="text-yellow-500" />
                        <span className="text-[10px] font-bold text-gray-400">RTP: {game.rtp}%</span>
                    </div>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-yellow-500 transition-colors">{game.game_name}</h3>
              <p className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase">{game.game_code}</p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-800 relative z-10">
              
              {/* STATUS: ENABLED */}
              {game.status === "ENABLED" && (
                <div className="w-full bg-green-500/10 text-green-500 border border-green-500/20 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-default">
                  <CheckCircle2 size={16} /> Active in Library
                </div>
              )}

              {/* STATUS: AVAILABLE */}
              {game.status === "AVAILABLE" && (
                <button 
                  onClick={() => setEnableGame(game)}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-3 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-lg shadow-yellow-500/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus size={16} strokeWidth={3} /> Add to Library
                </button>
              )}

              {/* STATUS: LOCKED */}
              {game.status === "LOCKED" && (
                <div className="space-y-3">
                  <button 
                    onClick={() => setRequestGame(game)}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock size={16} /> Request Provider Access
                  </button>
                  <p className="text-[10px] text-center text-gray-500 font-medium">
                    Contact required with {game.provider_name}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!loading && filteredGames.length === 0 && (
        <div className="text-center py-20 bg-gray-900/50 border border-dashed border-gray-800 rounded-[2rem]">
            <Search size={48} className="mx-auto text-gray-800 mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No games found matching your search</p>
        </div>
      )}

      {/* ENABLE MODAL */}
      {enableGame && (
        <AdminEnableGameModal 
          game={enableGame}
          onClose={() => setEnableGame(null)}
          onSuccess={() => {
            setEnableGame(null);
            loadGames();
          }}
        />
      )}

      {/* REQUEST ACCESS MODAL */}
      {requestGame && (
        <RequestAccessModal
          game={requestGame}
          onClose={() => setRequestGame(null)}
        />
      )}
    </div>
  );
};

export default AdminMarketplace;