import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getGameProviders,
  createGameProvider,
  updateGameProvider,
} from "../../api/superGameProviders.api";
import EditGameProviderModal from "./EditGameProviderModal";
import { 
  Cpu, 
  Search, 
  Plus, 
  ExternalLink, 
  RefreshCw, 
  Filter, 
  X, 
  CheckCircle2, 
  Ban,
  Gamepad2,
  ArrowRight,
  Edit2
} from "lucide-react";

const OwnerGameProviders = () => {
  const navigate = useNavigate();
  
  // Data State
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Actions State
  const [showCreate, setShowCreate] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [createForm, setCreateForm] = useState({ provider_name: "", website: "" });
  const [updatingId, setUpdatingId] = useState(null);

  // 1. Load Data
  const loadProviders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getGameProviders();
      setProviders(res.data);
    } catch (err) {
      console.error("❌ Failed to load game providers", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  // 2. Filter Logic using useEffect (No useMemo)
  useEffect(() => {
    const result = providers.filter(p => {
      const matchesSearch = p.provider_name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === "all" || 
                           (filterStatus === "active" ? p.is_active : !p.is_active);
      return matchesSearch && matchesStatus;
    });
    setFilteredProviders(result);
  }, [search, filterStatus, providers]);

  // 3. Handlers
  const handleCreate = async (e) => {
    if (e) e.preventDefault();
    try {
      await createGameProvider(createForm);
      setShowCreate(false);
      setCreateForm({ provider_name: "", website: "" });
      loadProviders();
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to create provider");
    }
  };

  const toggleStatus = async (provider) => {
    try {
      setUpdatingId(provider.provider_id);
      await updateGameProvider(provider.provider_id, {
        is_active: !provider.is_active,
      });
      await loadProviders();
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && providers.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <RefreshCw className="animate-spin mb-2" size={32} />
      <p className="font-bold text-xs uppercase tracking-widest">Syncing Partners...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500">
            <Cpu size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Game Providers</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Platform Integration Hub</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-lg shadow-yellow-500/10"
        >
          <Plus size={18} strokeWidth={3} /> Add Provider
        </button>
      </div>

      {/* FILTERS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-900 p-4 rounded-2xl border border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            placeholder="Search by name..." 
            className="w-full bg-black border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-yellow-500 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 pointer-events-none" size={18} />
          <select 
            className="w-full bg-black border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-yellow-500 outline-none appearance-none cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="disabled">Disabled Only</option>
          </select>
        </div>

        <button 
          onClick={loadProviders}
          className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-xl transition-all font-bold text-xs uppercase"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-black/50 text-xs font-bold text-gray-500 border-b border-gray-800 uppercase tracking-widest">
                <th className="px-6 py-4">Provider Identity</th>
                <th className="px-6 py-4">Website</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredProviders.map((p) => (
                <tr key={p.provider_id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-sm">{p.provider_name}</span>
                      <span className="text-[10px] text-gray-600 font-mono uppercase">ID: {p.provider_id}</span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-sm">
                    {p.website ? (
                      <a href={p.website} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center gap-1.5 font-bold transition-colors">
                        <ExternalLink size={14} /> {p.website.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      <span className="text-gray-700">None</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                      p.is_active 
                        ? "bg-green-500/10 text-green-500 border-green-500/20" 
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                    }`}>
                      {p.is_active ? <CheckCircle2 size={10} /> : <Ban size={10} />}
                      {p.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-xs text-gray-500 font-bold uppercase">
                    {new Date(p.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => navigate(`/owner/game-providers/${p.provider_id}/games`)}
                        className="p-2 bg-gray-800 hover:bg-gray-700 text-yellow-500 rounded-lg border border-gray-700 transition-all cursor-pointer"
                        title="View Games"
                      >
                        <Gamepad2 size={16} />
                      </button>
                      
                      <button
                        onClick={() => setEditingProvider(p)}
                        className="p-2 bg-gray-800 hover:bg-yellow-500 text-yellow-500 hover:text-black rounded-lg border border-gray-700 hover:border-yellow-500 transition-all cursor-pointer"
                        title="Edit Provider"
                      >
                        <Edit2 size={16} />
                      </button>

                      <button
                        onClick={() => toggleStatus(p)}
                        disabled={updatingId === p.provider_id}
                        className={`p-2 rounded-lg border transition-all cursor-pointer ${
                          p.is_active 
                          ? "bg-red-600/10 text-red-500 border-red-600/20 hover:bg-red-600 hover:text-white" 
                          : "bg-green-600/10 text-green-500 border-green-600/20 hover:bg-green-600 hover:text-white"
                        } disabled:opacity-30`}
                        title={p.is_active ? "Disable" : "Enable"}
                      >
                        {updatingId === p.provider_id ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <Plus size={16} className={p.is_active ? "rotate-45" : ""} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProviders.length === 0 && !loading && (
          <div className="p-20 text-center flex flex-col items-center">
            <Cpu className="text-gray-800 mb-4" size={48} />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No providers found</p>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500">
                    <Plus size={20} strokeWidth={3} />
                </div>
                <h2 className="text-2xl font-bold">Add Provider</h2>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Studio Name</label>
                <input
                  placeholder="e.g. NetEnt"
                  value={createForm.provider_name}
                  onChange={(e) => setCreateForm({...createForm, provider_name: e.target.value})}
                  className="w-full bg-black border border-gray-700 p-4 rounded-2xl text-white focus:border-yellow-500 outline-none transition-all text-sm"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Corporate Website</label>
                <input
                  placeholder="https://..."
                  value={createForm.website}
                  onChange={(e) => setCreateForm({...createForm, website: e.target.value})}
                  className="w-full bg-black border border-gray-700 p-4 rounded-2xl text-white focus:border-yellow-500 outline-none transition-all text-sm"
                />
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button 
                  type="submit" 
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  Confirm Integration <ArrowRight size={16} />
                </button>
                <button 
                  type="button"
                  onClick={() => setShowCreate(false)} 
                  className="w-full py-2 text-gray-500 hover:text-white transition-colors font-bold text-[10px] uppercase tracking-widest cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingProvider && (
        <EditGameProviderModal
          provider={editingProvider}
          onClose={() => setEditingProvider(null)}
          onSuccess={loadProviders}
        />
      )}
    </div>
  );
};

export default OwnerGameProviders;