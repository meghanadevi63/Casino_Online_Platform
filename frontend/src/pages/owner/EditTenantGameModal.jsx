import { useState } from "react";
import { updateTenantGame } from "../../api/superTenantGames.api";
import { 
  X, 
  Settings2, 
  Calendar, 
  Coins, 
  Percent, 
  Save, 
  RefreshCw,
  Clock
} from "lucide-react";

const EditTenantGameModal = ({ tenantId, game, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    contract_start: game.contract_start || "",
    contract_end: game.contract_end || "",
    min_bet_override: game.min_bet_override || "",
    max_bet_override: game.max_bet_override || "",
    rtp_override: game.rtp_override || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      
      const payload = {
        contract_start: form.contract_start || null,
        contract_end: form.contract_end || null,
        min_bet_override: form.min_bet_override ? Number(form.min_bet_override) : null,
        max_bet_override: form.max_bet_override ? Number(form.max_bet_override) : null,
        rtp_override: form.rtp_override ? Number(form.rtp_override) : null,
      };

      await updateTenantGame(tenantId, game.game_id, payload);
      onSuccess();
      onClose();
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to update game");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-gray-900 border border-gray-800 rounded-[2rem] w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-start bg-black/20">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500">
              <Settings2 size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Edit Configuration</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate max-w-[220px]">
                {game.game_name}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-white transition-colors cursor-pointer p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Section: Contract Dates */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
                <Clock size={14} className="text-yellow-500" />
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px]">Contract Validity</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 uppercase ml-1">Start Date</label>
                <input
                  type="date"
                  value={form.contract_start}
                  onChange={(e) => setForm({ ...form, contract_start: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-yellow-500 outline-none transition-all cursor-pointer"
                  style={{ colorScheme: "dark" }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 uppercase ml-1">End Date</label>
                <input
                  type="date"
                  value={form.contract_end}
                  onChange={(e) => setForm({ ...form, contract_end: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-yellow-500 outline-none transition-all cursor-pointer"
                  style={{ colorScheme: "dark" }}
                />
              </div>
            </div>
          </div>

          {/* Section: Betting Overrides */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
                <Coins size={14} className="text-yellow-500" />
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px]">Staking Limits</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 uppercase ml-1 text-center">Min Bet Override</label>
                <input
                  type="number"
                  value={form.min_bet_override}
                  onChange={(e) => setForm({ ...form, min_bet_override: e.target.value })}
                  className="w-full bg-black border border-gray-800 focus:border-yellow-500 rounded-xl p-3 text-sm text-white outline-none transition-all font-mono"
                  placeholder="Global Default"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 uppercase ml-1">Max Bet Override</label>
                <input
                  type="number"
                  value={form.max_bet_override}
                  onChange={(e) => setForm({ ...form, max_bet_override: e.target.value })}
                  className="w-full bg-black border border-gray-800 focus:border-yellow-500 rounded-xl p-3 text-sm text-white outline-none transition-all font-mono"
                  placeholder="Global Default"
                />
              </div>
            </div>
          </div>

          {/* Section: Math Overrides */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
                <Percent size={14} className="text-yellow-500" />
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px]">Return To Player</h3>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-600 uppercase ml-1 text-center">RTP Percentage (%)</label>
              <input
                type="number"
                value={form.rtp_override}
                onChange={(e) => setForm({ ...form, rtp_override: e.target.value })}
                className="w-full bg-black border border-gray-800 focus:border-yellow-500 rounded-xl p-3 text-sm text-white outline-none transition-all font-mono"
                placeholder="Global Default"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-800 bg-black/20 flex flex-col sm:flex-row gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 px-6 py-3 rounded-xl text-gray-500 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={handleSubmit}
            className="flex-[2] bg-yellow-500 hover:bg-yellow-400 text-black font-black py-3 rounded-xl text-xs uppercase tracking-widest shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 order-1 sm:order-2"
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={18} />
            ) : (
              <><Save size={18} /> Save Settings</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTenantGameModal;