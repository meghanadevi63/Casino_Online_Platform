import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Dynamic currency
import { getGames, checkGameEligibility } from "../api/game.api";
import { 
  Gamepad2, 
  Search, 
  Coins, 
  Play, 
  ArrowLeft, 
  LayoutGrid, 
  CircleDashed 
} from "lucide-react";

const GameLobby = () => {
  const { user } = useContext(AuthContext);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // Search state
  const [checking, setChecking] = useState(null);
  const navigate = useNavigate();

  const currencySymbol = user?.currency_symbol || "₹";

  useEffect(() => {
    const loadGames = async () => {
      try {
        const res = await getGames();
        setGames(res.data);
      } catch (err) {
        console.error("Failed to load games", err);
      } finally {
        setLoading(false);
      }
    };
    loadGames();
  }, []);

  // Filter logic for Game Name or Category
  const filteredGames = games.filter(game => 
    game.game_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (game.category && game.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handlePlay = async (gameId) => {
    try {
      setChecking(gameId);
      const res = await checkGameEligibility(gameId);
      if (!res.data.eligible) {
        alert(`🚫 Access Denied: ${res.data.reason}`);
        return;
      }
      navigate(`/game/${gameId}`);
    } catch (err) {
      console.error(err);
      alert("Unable to verify game access. Please try again.");
    } finally {
      setChecking(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <CircleDashed className="animate-spin text-yellow-500 mb-4" size={40} />
        <div className="text-yellow-500 font-bold text-xl uppercase tracking-widest">Loading Casino...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-8">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500/20 p-2 rounded-xl">
            <Gamepad2 className="text-yellow-500" size={32} />
          </div>
          <h1 className="text-2xl font-bold">Game Lobby</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {/* SEARCH BAR */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search games or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:border-yellow-500 outline-none w-full md:w-64 transition-all"
            />
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl text-sm transition flex items-center gap-2 font-bold"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </div>

      {/* RESULTS SUMMARY */}
      <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest">
          <LayoutGrid size={14} />
          <span>Showing {filteredGames.length} available titles</span>
      </div>

      {filteredGames.length === 0 ? (
        <div className="bg-gray-900/50 border border-dashed border-gray-800 rounded-[2.5rem] p-24 text-center">
          <Gamepad2 className="mx-auto mb-4 opacity-20" size={48} />
          <p className="font-bold uppercase tracking-widest text-gray-500">No games found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <div
              key={game.game_id}
              className="bg-gray-900 p-6 rounded-2xl border border-gray-800 hover:border-yellow-500/50 transition duration-300 shadow-lg group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-white group-hover:text-yellow-400 transition uppercase tracking-tight">
                    {game.game_name}
                  </h2>
                  <span className="text-[10px] bg-gray-800 px-2 py-1 rounded-lg text-gray-400 border border-gray-700 font-black uppercase tracking-wider">
                    {game.category || "Casual"}
                  </span>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-gray-500 font-bold uppercase text-[10px] tracking-widest">
                      <Coins size={14} className="text-yellow-600" />
                      <span>Min Bet</span>
                    </div>
                    <span className="text-white font-mono font-bold text-base">{currencySymbol}{game.min_bet}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-gray-800 pt-3">
                    <div className="flex items-center gap-2 text-gray-500 font-bold uppercase text-[10px] tracking-widest">
                      <Coins size={14} className="text-yellow-600" />
                      <span>Max Bet</span>
                    </div>
                    <span className="text-white font-mono font-bold text-base">{currencySymbol}{game.max_bet}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handlePlay(game.game_id)}
                disabled={checking === game.game_id}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-xl transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase text-xs tracking-widest cursor-pointer"
              >
                {checking === game.game_id ? (
                  <>
                    <CircleDashed className="animate-spin" size={16} />
                    Checking...
                  </>
                ) : (
                  <>
                    <Play size={16} fill="currentColor" /> Play Now
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GameLobby;