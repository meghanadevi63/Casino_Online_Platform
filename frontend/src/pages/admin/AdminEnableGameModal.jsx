import { useState } from "react";
import { addGameToLibrary } from "../../api/adminMarketplace.api";
import { 
  Gamepad2, 
  Calendar, 
  Coins, 
  Percent, 
  X, 
  CheckCircle2, 
  Settings2 
} from "lucide-react";

const AdminEnableGameModal = ({ game, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    contract_start: "",
    contract_end: "",
    min_bet_override: "",
    max_bet_override: "",
    rtp_override: ""
  });

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payload = {
        game_id: game.game_id,
        contract_start: form.contract_start || null,
        contract_end: form.contract_end || null,
        min_bet_override: form.min_bet_override ? Number(form.min_bet_override) : null,
        max_bet_override: form.max_bet_override ? Number(form.max_bet_override) : null,
        rtp_override: form.rtp_override ? Number(form.rtp_override) : null,
      };

      await addGameToLibrary(payload);
      onSuccess();
      onClose();
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to add game");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500">
              <Gamepad2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Enable {game.game_name}</h2>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Library Configuration</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {/* Date Section */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Calendar size={12} /> Contract Period
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-600 font-bold ml-1 uppercase">Start</label>
                <input
                  type="date"
                  style={{ colorScheme: "dark" }}
                  value={form.contract_start}
                  onChange={(e) => setForm({ ...form, contract_start: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-yellow-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-600 font-bold ml-1 uppercase">End</label>
                <input
                  type="date"
                  style={{ colorScheme: "dark" }}
                  value={form.contract_end}
                  onChange={(e) => setForm({ ...form, contract_end: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-yellow-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Overrides Section */}
          <div className="space-y-3 pt-4 border-t border-gray-800">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Coins size={12} /> Bet Limits Override
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-600 font-bold ml-1 uppercase">Minimum</label>
                <input
                  type="number"
                  placeholder="Default"
                  value={form.min_bet_override}
                  onChange={(e) => setForm({ ...form, min_bet_override: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-yellow-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-600 font-bold ml-1 uppercase">Maximum</label>
                <input
                  type="number"
                  placeholder="Default"
                  value={form.max_bet_override}
                  onChange={(e) => setForm({ ...form, max_bet_override: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-yellow-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* RTP Section */}
          <div className="space-y-3 pt-4 border-t border-gray-800">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Percent size={12} /> RTP Configuration
            </h3>
            <div className="space-y-1">
                <label className="text-[10px] text-gray-600 font-bold ml-1 uppercase">RTP Override (%)</label>
                <input
                  type="number"
                  placeholder={`Global: ${game.rtp || "-"}%`}
                  value={form.rtp_override}
                  onChange={(e) => setForm({ ...form, rtp_override: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-yellow-500 outline-none transition-all"
                />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-8">
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-xl text-sm uppercase tracking-widest shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? "Initializing..." : <><CheckCircle2 size={18} /> Confirm & Enable</>}
          </button>
          <button 
            onClick={onClose} 
            className="w-full bg-transparent hover:bg-gray-800 text-gray-500 hover:text-white py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminEnableGameModal;