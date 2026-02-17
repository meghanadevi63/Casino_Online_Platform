import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getSuperGames, createSuperGame } from "../../api/superGames.api";
import { getGameProviders } from "../../api/superGameProviders.api";
import { 
  Gamepad2, 
  Search, 
  Filter, 
  Plus, 
  Settings, 
  CheckCircle2, 
  Ban, 
  RefreshCw, 
  Cpu, 
  ArrowRight,
  Database,
  Coins,
  X,
  ChevronDown 
} from "lucide-react";

const OwnerGames = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [providers, setProviders] = useState([]);
  
  // Filters
  const [filterProvider, setFilterProvider] = useState("all");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Create Form State
  const [form, setForm] = useState({
    provider_id: "",
    category_id: "",
    game_name: "",
    game_code: "",
    min_bet: "",
    max_bet: "",
    rtp_percentage: "",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [gamesRes, providersRes] = await Promise.all([
        getSuperGames(),
        getGameProviders()
      ]);
      setGames(gamesRes.data);
      setProviders(providersRes.data.filter((p) => p.is_active));
    } catch (err) {
      console.error("❌ Failed to load data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredGames = useMemo(() => {
    return games.filter(g => {
      const matchesSearch = g.game_name.toLowerCase().includes(search.toLowerCase()) || 
                            g.game_code.toLowerCase().includes(search.toLowerCase());
      const matchesProvider = filterProvider === "all" || String(g.provider_id) === filterProvider;
      return matchesSearch && matchesProvider;
    });
  }, [search, filterProvider, games]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createSuperGame({
        ...form,
        min_bet: Number(form.min_bet),
        max_bet: Number(form.max_bet),
        rtp_percentage: form.rtp_percentage ? Number(form.rtp_percentage) : null,
      });
      setShowCreate(false);
      setForm({
        provider_id: "", category_id: "", game_name: "", game_code: "",
        min_bet: "", max_bet: "", rtp_percentage: "",
      });
      loadData();
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to create game");
    }
  };

  const getProviderName = (id) => {
    const p = providers.find(prov => prov.provider_id === id);
    return p ? p.provider_name : `ID: ${id}`;
  };

  if (loading && games.length === 0) return (
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
          <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500">
            <Gamepad2 size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Global Games Catalog</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Master Definitions & Metadata</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 cursor-pointer"
        >
          <Plus size={18} strokeWidth={3} /> Add New Game
        </button>
      </div>

      {/* FILTERS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-900 p-4 rounded-2xl border border-gray-800 shadow-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            placeholder="Search by name or code..."
            className="w-full bg-black border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-yellow-500 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 pointer-events-none" size={18} />
          <select 
            className="w-full bg-black border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-yellow-500 outline-none appearance-none cursor-pointer"
            value={filterProvider}
            onChange={(e) => setFilterProvider(e.target.value)}
          >
            <option value="all">All Providers</option>
            {providers.map(p => (
              <option key={p.provider_id} value={p.provider_id}>{p.provider_name}</option>
            ))}
          </select>
          {/* Custom Chevron for Filter */}
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
        </div>

        <button 
          onClick={loadData}
          className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-xl transition-all font-bold text-xs uppercase"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Library
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-black/50 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800">
                <th className="px-6 py-4">Game Title</th>
                <th className="px-6 py-4">Studio</th>
                <th className="px-6 py-4 text-center">Global Status</th>
                <th className="px-6 py-4">Added On</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredGames.map((g) => (
                <tr key={g.game_id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-sm">{g.game_name}</span>
                      <span className="text-[10px] text-gray-600 font-mono uppercase tracking-tight">{g.game_code}</span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
                        <Cpu size={14} className="text-blue-500" /> {getProviderName(g.provider_id)}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                      g.is_active 
                        ? "bg-green-500/10 text-green-500 border-green-500/20" 
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                    }`}>
                      {g.is_active ? <CheckCircle2 size={10} /> : <Ban size={10} />}
                      {g.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-xs text-gray-500 font-bold uppercase">
                    {new Date(g.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => navigate(`/owner/games/${g.game_id}/countries`)}
                      className="inline-flex items-center gap-2 bg-gray-800 hover:bg-yellow-500 text-yellow-500 hover:text-black px-4 py-2 rounded-lg border border-gray-700 transition-all font-bold text-[10px] uppercase cursor-pointer"
                    >
                      <Settings size={14} /> Configure
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredGames.length === 0 && !loading && (
          <div className="p-20 text-center flex flex-col items-center">
            <Database className="text-gray-800 mb-4" size={48} />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No matching games found</p>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-[2rem] p-8 w-full max-w-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500">
                        <Plus size={20} strokeWidth={3} />
                    </div>
                    <h2 className="text-2xl font-bold">Create Master Game</h2>
                </div>
                <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-white transition-colors cursor-pointer"><X size={24}/></button>
            </div>
            
            {/* Scrollable Form Content */}
            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left Column: Basic Info */}
                  <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-2">Basic Information</h3>
                      <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Game Name</label>
                          <input 
                          value={form.game_name} 
                          onChange={e => setForm({...form, game_name: e.target.value})}
                          className="w-full bg-black border border-gray-700 p-3 rounded-xl text-white focus:border-yellow-500 outline-none transition-all text-sm"
                          placeholder="e.g. Super Mega Slot"
                          required
                          />
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Unique Code</label>
                          <input 
                          value={form.game_code} 
                          onChange={e => setForm({...form, game_code: e.target.value})}
                          className="w-full bg-black border border-gray-700 p-3 rounded-xl text-white focus:border-yellow-500 outline-none transition-all text-sm font-mono"
                          placeholder="e.g. super_mega_slot_01"
                          required
                          />
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Provider</label>
                          <div className="relative">
                            <select 
                            value={form.provider_id} 
                            onChange={e => setForm({...form, provider_id: e.target.value})}
                            className="w-full bg-black border border-gray-700 p-3 rounded-xl text-white focus:border-yellow-500 outline-none transition-all text-sm cursor-pointer appearance-none truncate pr-10"
                            required
                            >
                            <option value="">Select Provider</option>
                            {providers.map(p => (
                                <option key={p.provider_id} value={p.provider_id}>{p.provider_name}</option>
                            ))}
                            </select>
                            {/* Custom Chevron for Modal */}
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                          </div>
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Category ID</label>
                          <input 
                          type="number"
                          value={form.category_id} 
                          onChange={e => setForm({...form, category_id: e.target.value})}
                          className="w-full bg-black border border-gray-700 p-3 rounded-xl text-white focus:border-yellow-500 outline-none transition-all text-sm"
                          placeholder="e.g. 1"
                          required
                          />
                      </div>
                  </div>

                  {/* Right Column: Financial Config */}
                  <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-2">Financial Configuration</h3>
                      <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">RTP Percentage</label>
                          <input 
                          type="number"
                          value={form.rtp_percentage} 
                          onChange={e => setForm({...form, rtp_percentage: e.target.value})}
                          className="w-full bg-black border border-gray-700 p-3 rounded-xl text-white focus:border-yellow-500 outline-none transition-all text-sm"
                          placeholder="e.g. 96.5"
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Coins size={12}/> Min Bet</label>
                              <input 
                              type="number"
                              value={form.min_bet} 
                              onChange={e => setForm({...form, min_bet: e.target.value})}
                              className="w-full bg-black border border-gray-700 p-3 rounded-xl text-white focus:border-yellow-500 outline-none transition-all text-sm font-mono"
                              required
                              />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Coins size={12}/> Max Bet</label>
                              <input 
                              type="number"
                              value={form.max_bet} 
                              onChange={e => setForm({...form, max_bet: e.target.value})}
                              className="w-full bg-black border border-gray-700 p-3 rounded-xl text-white focus:border-yellow-500 outline-none transition-all text-sm font-mono"
                              required
                              />
                          </div>
                      </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-800 flex justify-end gap-3">
                  <button 
                      type="button"
                      onClick={() => setShowCreate(false)} 
                      className="px-6 py-3 rounded-xl text-gray-500 hover:text-white hover:bg-gray-800 transition font-bold text-xs uppercase tracking-widest cursor-pointer"
                  >
                      Cancel
                  </button>
                  <button 
                      type="submit"
                      className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                      <Plus size={16} strokeWidth={3} /> Create Master Game
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerGames;