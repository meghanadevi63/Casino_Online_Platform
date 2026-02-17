import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchSuperTenants,
  createSuperTenant,
  updateSuperTenant,
} from "../../api/superTenants.api";
import { 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  RefreshCw, 
  Globe, 
  CheckCircle2, 
  Ban, 
  Clock, 
  Settings2, 
  Power,
  X,
  ArrowRight
} from "lucide-react";

const OwnerTenants = () => {
  const navigate = useNavigate();

  // Data State
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Modal State
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ tenant_name: "", domain: "" });
  const [creating, setCreating] = useState(false);
  
  // Update State
  const [updatingId, setUpdatingId] = useState(null);

  // 1. Load Data
  const loadTenants = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchSuperTenants();
      setTenants(res.data || []);
    } catch (err) {
      console.error("❌ Failed to load tenants", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  // 2. Filter Logic (Memoized)
  const filteredTenants = useMemo(() => {
    return tenants.filter(t => {
      const matchesSearch = t.tenant_name.toLowerCase().includes(search.toLowerCase()) || 
                            (t.domain && t.domain.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = filterStatus === "all" || t.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [search, filterStatus, tenants]);

  // 3. Create Tenant Handler
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.tenant_name) return alert("Tenant Name is required");
    
    try {
      setCreating(true);
      await createSuperTenant({
        tenant_name: createForm.tenant_name,
        domain: createForm.domain || null,
        status: "active"
      });
      setShowCreate(false);
      setCreateForm({ tenant_name: "", domain: "" });
      loadTenants();
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to create tenant");
    } finally {
      setCreating(false);
    }
  };

  // 4. Toggle Status Handler
  const toggleStatus = async (tenant) => {
    const newStatus = tenant.status === "active" ? "suspended" : "active";
    if (!window.confirm(`Set ${tenant.tenant_name} to ${newStatus.toUpperCase()}?`)) return;

    try {
      setUpdatingId(tenant.tenant_id);
      await updateSuperTenant(tenant.tenant_id, {
        status: newStatus,
        domain: tenant.domain
      });
      await loadTenants();
    } catch (err) {
      alert("Failed to update tenant status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && tenants.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <RefreshCw className="animate-spin mb-2" size={32} />
      <p className="text-[10px] font-black uppercase tracking-[4px]">Loading Partners...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500">
            <Building2 size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Tenant Management</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Partner Operations Control</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 cursor-pointer"
        >
          <Plus size={18} strokeWidth={3} /> Create Tenant
        </button>
      </div>

      {/* FILTERS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-900 p-4 rounded-2xl border border-gray-800 shadow-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            placeholder="Search by name or domain..." 
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
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button 
          onClick={loadTenants}
          className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-xl transition-all font-bold text-xs uppercase"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Data
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-black/50 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800">
                <th className="px-6 py-4">Tenant Identity</th>
                <th className="px-6 py-4">Domain Config</th>
                <th className="px-6 py-4 text-center">Op Status</th>
                <th className="px-6 py-4">Onboarded</th>
                <th className="px-6 py-4 text-right">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.tenant_id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-sm">{tenant.tenant_name}</span>
                      <span className="text-[10px] text-gray-600 font-mono uppercase">ID: {tenant.tenant_id.slice(0, 8)}...</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {tenant.domain ? (
                      <a 
                        href={`https://${tenant.domain}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-bold text-xs transition-colors"
                      >
                        <Globe size={14} /> {tenant.domain}
                      </a>
                    ) : (
                      <span className="text-gray-600 text-xs italic">No domain linked</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                      tenant.status === "active"
                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                        : tenant.status === "suspended"
                        ? "bg-red-500/10 text-red-500 border-red-500/20"
                        : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                    }`}>
                      {tenant.status === "active" ? <CheckCircle2 size={10} /> : <Ban size={10} />}
                      {tenant.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase">
                        <Clock size={14} className="text-gray-700" />
                        {new Date(tenant.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => navigate(`/owner/tenants/${tenant.tenant_id}`)}
                        className="p-2 bg-gray-800 hover:bg-gray-700 text-yellow-500 rounded-lg border border-gray-700 transition-all cursor-pointer"
                        title="Manage Tenant"
                      >
                        <Settings2 size={16} />
                      </button>

                      <button
                        onClick={() => toggleStatus(tenant)}
                        disabled={updatingId === tenant.tenant_id}
                        className={`p-2 rounded-lg border transition-all cursor-pointer ${
                          tenant.status === "active"
                          ? "bg-red-600/10 text-red-500 border-red-600/20 hover:bg-red-600 hover:text-white"
                          : "bg-green-600/10 text-green-500 border-green-600/20 hover:bg-green-600 hover:text-white"
                        } disabled:opacity-30`}
                        title={tenant.status === "active" ? "Suspend" : "Activate"}
                      >
                        {updatingId === tenant.tenant_id ? (
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

        {filteredTenants.length === 0 && !loading && (
          <div className="p-20 text-center flex flex-col items-center">
            <Building2 className="text-gray-800 mb-4" size={48} />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No partners found</p>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500">
                    <Plus size={20} strokeWidth={3} />
                </div>
                <h2 className="text-2xl font-bold">Onboard New Tenant</h2>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Brand Name</label>
                <input
                  placeholder="e.g. Royal Vegas"
                  value={createForm.tenant_name}
                  onChange={(e) => setCreateForm({...createForm, tenant_name: e.target.value})}
                  className="w-full bg-black border border-gray-700 p-4 rounded-2xl text-white focus:border-yellow-500 outline-none transition-all text-sm"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Primary Domain (Optional)</label>
                <input
                  placeholder="e.g. royalvegas.com"
                  value={createForm.domain}
                  onChange={(e) => setCreateForm({...createForm, domain: e.target.value})}
                  className="w-full bg-black border border-gray-700 p-4 rounded-2xl text-white focus:border-yellow-500 outline-none transition-all text-sm"
                />
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button 
                  type="submit" 
                  disabled={creating}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {creating ? "Deploying..." : <><CheckCircle2 size={16}/> Create Partner Instance</>}
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
    </div>
  );
};

export default OwnerTenants;