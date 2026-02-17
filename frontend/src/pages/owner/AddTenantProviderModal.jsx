import { useEffect, useState } from "react";
import { addTenantProvider } from "../../api/superTenantProviders.api";
import { getGameProviders } from "../../api/superGameProviders.api";
import { 
  Plus, 
  X, 
  Cpu, 
  Calendar, 
  CheckCircle2, 
  RefreshCw, 
  ChevronDown 
} from "lucide-react";

const AddTenantProviderModal = ({
  tenantId,
  existingProviders,
  onClose,
  onSuccess,
}) => {
  const [providers, setProviders] = useState([]);
  const [providerId, setProviderId] = useState("");
  const [contractStart, setContractStart] = useState("");
  const [contractEnd, setContractEnd] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const res = await getGameProviders();
        const enabledIds = existingProviders.map(p => p.provider_id);
        const availableProviders = res.data.filter(p => p.is_active && !enabledIds.includes(p.provider_id));
        setProviders(availableProviders);
      } catch (err) {
        console.error("Failed to load providers", err);
      }
    };
    loadProviders();
  }, [existingProviders]);

  const submit = async (e) => {
    if (e) e.preventDefault();
    if (!providerId) return alert("Select a provider");

    try {
      setLoading(true);
      await addTenantProvider(tenantId, {
        provider_id: Number(providerId),
        contract_start: contractStart || null,
        contract_end: contractEnd || null,
        is_active: true,
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to add provider");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-gray-900 border border-gray-800 rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
        
        <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
                <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500">
                    <Plus size={24} strokeWidth={3} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Enable Provider</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Establish a new contract</p>
                </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors cursor-pointer"><X size={20}/></button>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Cpu size={12} className="text-yellow-500" /> Available Game Providers
            </label>
            <div className="relative">
              <select
                value={providerId}
                onChange={(e) => setProviderId(e.target.value)}
                className="w-full bg-black border border-gray-800 rounded-xl p-4 text-sm text-white focus:border-yellow-500 outline-none appearance-none cursor-pointer transition-all"
                required
              >
                <option value="">-- Select from list --</option>
                {providers.map((p) => (
                  <option key={p.provider_id} value={p.provider_id}>{p.provider_name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
            </div>
            {providers.length === 0 && (
              <div className="text-xs text-gray-600 text-center pt-2">All available providers are already enabled.</div>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 uppercase ml-1">Contract Start</label>
                <input type="date" value={contractStart} onChange={(e) => setContractStart(e.target.value)} style={{ colorScheme: "dark" }} className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-sm text-white focus:border-yellow-500 outline-none cursor-pointer" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 uppercase ml-1">Contract End</label>
                <input type="date" value={contractEnd} onChange={(e) => setContractEnd(e.target.value)} style={{ colorScheme: "dark" }} className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-sm text-white focus:border-yellow-500 outline-none cursor-pointer" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || !providerId}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-lg transition-all active:scale-[0.98] disabled:opacity-30 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="animate-spin" size={16}/> : <><CheckCircle2 size={16} /> Add Contract</>}
            </button>
            <button type="button" onClick={onClose} className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors cursor-pointer">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTenantProviderModal;