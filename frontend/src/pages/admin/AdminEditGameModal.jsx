import { useState } from "react";
import { updateMyGame } from "../../api/adminGames.api";
import { Settings2, Coins, X, Save, RefreshCw } from "lucide-react";

const AdminEditGameModal = ({ game, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    min_bet_override: game.min_bet, 
    max_bet_override: game.max_bet,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await updateMyGame(game.game_id, {
        min_bet_override: Number(form.min_bet_override),
        max_bet_override: Number(form.max_bet_override),
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to update game");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl relative">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500">
              <Settings2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">Edit Limits</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{game.game_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Coins size={12} className="text-yellow-600" /> Minimum Bet
              </label>
              <input
                type="number"
                value={form.min_bet_override}
                onChange={(e) => setForm({ ...form, min_bet_override: e.target.value })}
                className="w-full bg-black border border-gray-800 focus:border-yellow-500 rounded-xl p-4 text-white text-lg font-mono outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Coins size={12} className="text-yellow-600" /> Maximum Bet
              </label>
              <input
                type="number"
                value={form.max_bet_override}
                onChange={(e) => setForm({ ...form, max_bet_override: e.target.value })}
                className="w-full bg-black border border-gray-800 focus:border-yellow-500 rounded-xl p-4 text-white text-lg font-mono outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-xl text-sm uppercase tracking-widest shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <><Save size={18} /> Save Changes</>
              )}
            </button>
            <button 
                onClick={onClose} 
                className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEditGameModal;