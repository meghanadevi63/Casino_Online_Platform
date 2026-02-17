import { useState } from "react";
import { updateGameProvider } from "../../api/superGameProviders.api";
import { 
  X, 
  Settings2, 
  Building2, 
  Globe, 
  Save, 
  RefreshCw 
} from "lucide-react";

const EditGameProviderModal = ({ provider, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    provider_name: provider.provider_name,
    website: provider.website || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      await updateGameProvider(provider.provider_id, form);
      onSuccess();
      onClose();
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to update provider");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-gray-900 border border-gray-800 rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
        
        {/* Decorative background element */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl"></div>

        {/* Header */}
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500">
              <Settings2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Edit Provider</h2>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Update Integration Details</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-white transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {/* Provider Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Building2 size={12} className="text-yellow-600" /> Studio Identity
            </label>
            <input
              value={form.provider_name}
              onChange={(e) => setForm({ ...form, provider_name: e.target.value })}
              className="w-full bg-black border border-gray-800 focus:border-yellow-500 rounded-xl p-4 text-white text-sm outline-none transition-all"
              required
            />
          </div>

          {/* Website */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Globe size={12} className="text-yellow-600" /> Official Website
            </label>
            <input
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="w-full bg-black border border-gray-800 focus:border-yellow-500 rounded-xl p-4 text-white text-sm outline-none transition-all"
              placeholder="https://..."
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-yellow-500/10 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <><Save size={18} /> Save Changes</>
              )}
            </button>
            <button 
              type="button"
              onClick={onClose} 
              className="w-full py-2 text-gray-500 hover:text-white transition-colors font-bold text-[10px] uppercase tracking-widest cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGameProviderModal;