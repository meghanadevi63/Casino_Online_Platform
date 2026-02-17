import { useState } from "react";
import { approveRequest } from "../../api/superRequests.api";
import { 
  X, 
  Calendar, 
  CheckCircle2, 
  FileSignature, 
  Building2, 
  Cpu,
  RefreshCw
} from "lucide-react";

const ApproveRequestModal = ({ request, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    contract_start: request.proposed_start_date || new Date().toISOString().split('T')[0],
    contract_end: "",
    is_active: true
  });

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const payload = {
        provider_id: request.provider_id,
        contract_start: form.contract_start || null,
        contract_end: form.contract_end || null,
        is_active: form.is_active
      };

      await approveRequest(request.request_id, payload);
      onSuccess();
      onClose();
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to approve request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-800 rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Background Accent (Yellow) */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/20 p-2.5 rounded-xl text-yellow-500">
              <FileSignature size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Approve Contract</h2>
              <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">Finalize Integration</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-white transition-colors cursor-pointer p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Info Summary */}
        <div className="bg-black/40 border border-gray-800 rounded-2xl p-5 mb-6 relative z-10">
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <Building2 size={12} /> Tenant
                    </p>
                    <p className="text-sm font-bold text-white truncate">{request.tenant_name}</p>
                </div>
                <div>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <Cpu size={12} /> Provider
                    </p>
                    <p className="text-sm font-bold text-white truncate">{request.provider_name}</p>
                </div>
            </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-5 relative z-10">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
               <Calendar size={12} className="text-yellow-500" /> Contract Start Date
            </label>
            <input 
              type="date" 
              className="w-full bg-black border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-yellow-500 outline-none transition-all cursor-pointer font-bold"
              style={{ colorScheme: "dark" }}
              value={form.contract_start}
              onChange={e => setForm({...form, contract_start: e.target.value})}
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
               <Calendar size={12} className="text-gray-600" /> Expiry Date (Optional)
            </label>
            <input 
              type="date" 
              className="w-full bg-black border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-yellow-500 outline-none transition-all cursor-pointer font-bold"
              style={{ colorScheme: "dark" }}
              value={form.contract_end}
              onChange={e => setForm({...form, contract_end: e.target.value})}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-8 relative z-10 pt-6 border-t border-gray-800">
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-yellow-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
                <>
                    <RefreshCw className="animate-spin" size={16} /> Approving...
                </>
            ) : (
                <><CheckCircle2 size={16} /> Authorize Contract</>
            )}
          </button>
          
          <button 
            onClick={onClose} 
            className="w-full py-2 text-gray-500 hover:text-white font-bold text-[10px] uppercase tracking-widest transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};

export default ApproveRequestModal;