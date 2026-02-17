import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  getTenantProviders,
  updateTenantProvider,
} from "../../api/superTenantProviders.api";
import AddTenantProviderModal from "./AddTenantProviderModal";
import { 
  Cpu, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  Ban, 
  Calendar, 
  SearchX,
  Power
} from "lucide-react";

const OwnerTenantProviders = () => {
  const { tenantId } = useParams();

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const loadProviders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTenantProviders(tenantId);
      setProviders(res.data);
    } catch (err) {
      console.error("❌ Failed to load providers", err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  const toggleStatus = async (provider) => {
    try {
      setUpdatingId(provider.provider_id);
      await updateTenantProvider(tenantId, provider.provider_id, {
        is_active: !provider.is_active,
      });
      loadProviders();
    } catch (err) {
      console.error("❌ Failed to update provider", err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && providers.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <RefreshCw className="animate-spin mb-2" size={32} />
      <p className="font-bold text-xs uppercase tracking-widest">Loading Integrations...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Cpu className="text-yellow-500" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-white">Tenant Game Providers</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Manage Active Studio Contracts</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 cursor-pointer"
        >
          <Plus size={18} strokeWidth={3} /> Enable Provider
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-black/50 text-xs font-bold text-gray-500 border-b border-gray-800 uppercase tracking-widest">
                <th className="px-6 py-4">Provider</th>
                <th className="px-6 py-4">Contract Start</th>
                <th className="px-6 py-4">Contract End</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {providers.map((p) => (
                <tr key={p.provider_id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-800 p-2 rounded-lg text-blue-400">
                            <Cpu size={16} />
                        </div>
                        <span className="font-bold text-white text-sm">{p.provider_name}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-xs text-gray-400 font-bold">
                    {p.contract_start || "-"}
                  </td>

                  <td className="px-6 py-4 text-xs text-gray-400 font-bold">
                    {p.contract_end || "-"}
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

                  <td className="px-6 py-4 text-center">
                    <button
                      disabled={updatingId === p.provider_id}
                      onClick={() => toggleStatus(p)}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
                          p.is_active
                          ? "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-600 hover:text-white"
                          : "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-600 hover:text-white"
                      } disabled:opacity-30`}
                    >
                      {updatingId === p.provider_id ? (
                        <RefreshCw size={12} className="animate-spin" />
                      ) : (
                        p.is_active ? "Disable" : "Enable"
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {providers.length === 0 && !loading && (
          <div className="p-20 text-center flex flex-col items-center">
            <SearchX className="text-gray-800 mb-4" size={48} />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No providers enabled for this tenant</p>
          </div>
        )}
      </div>

      {/* ADD MODAL */}
      {showAdd && (
        <AddTenantProviderModal
          tenantId={tenantId}
          existingProviders={providers} 
          onClose={() => setShowAdd(false)}
          onSuccess={loadProviders}
        />
      )}
    </div>
  );
};

export default OwnerTenantProviders;