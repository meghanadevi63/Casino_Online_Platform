import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProviderGames } from "../../api/superGameProviders.api";
import { 
  Gamepad2, 
  ArrowLeft, 
  RefreshCw, 
  Hash, 
  Calendar, 
  SearchX,
  CircleDashed,
  CheckCircle2,
  XCircle
} from "lucide-react";

const OwnerProviderGames = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProviderGames(providerId);
      setGames(res.data);
    } catch (err) {
      console.error("Failed to load provider games:", err);
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <CircleDashed className="animate-spin mb-2" size={32} />
      <p className="font-bold text-xs uppercase tracking-widest">Fetching Catalog...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-yellow-500/20 p-2.5 rounded-xl text-yellow-500">
            <Gamepad2 size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Provider Game Catalog</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Registered Titles</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
            <button 
                onClick={loadData}
                className="p-2.5 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-400 rounded-xl transition-all cursor-pointer"
                title="Refresh List"
            >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer border border-gray-700"
            >
                <ArrowLeft size={18} /> Back
            </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-black/50 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800">
                <th className="px-6 py-5">Game Title</th>
                <th className="px-6 py-5">System Code</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-6 py-5">Created On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {games.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                        <SearchX size={48} className="text-gray-800 mb-4" />
                        <p className="text-gray-500 font-bold text-sm">No games found for this provider.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                games.map((game) => (
                  <tr key={game.game_id} className="hover:bg-yellow-500/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-yellow-500/50 group-hover:text-yellow-500 transition-colors">
                            <Gamepad2 size={16} />
                        </div>
                        <span className="font-bold text-white text-sm uppercase tracking-tight">{game.game_name}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-black/30 w-fit px-2 py-1 rounded-lg border border-gray-800">
                        <Hash size={12} className="text-gray-600" />
                        {game.game_code}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                       <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                         game.is_active 
                            ? "bg-green-500/10 text-green-500 border-green-500/20" 
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                       }`}>
                         {game.is_active ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                         {game.is_active ? "Active" : "Disabled"}
                       </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase">
                        <Calendar size={14} className="text-gray-700" />
                        {new Date(game.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER INFO */}
      {!loading && games.length > 0 && (
        <div className="px-4 text-[10px] text-gray-600 font-bold uppercase tracking-widest flex justify-between">
            <span>Total Games: {games.length}</span>
            <span>Platform Master Catalog</span>
        </div>
      )}
    </div>
  );
};

export default OwnerProviderGames;