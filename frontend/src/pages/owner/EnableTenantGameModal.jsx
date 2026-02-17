import { useEffect, useState } from "react";
import { getAllGames, enableTenantGame } from "../../api/superTenantGames.api";
import { getTenantProviders } from "../../api/superTenantProviders.api";
import { 
  Plus, 
  X, 
  Gamepad2, 
  Calendar, 
  Settings2, 
  CheckCircle2, 
  RefreshCw, 
  ChevronDown,
  Coins,
  Percent
} from "lucide-react";

const EnableTenantGameModal = ({ tenantId, onClose, onSuccess, existingGames }) => {
  const [availableGames, setAvailableGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedGameId, setSelectedGameId] = useState("");
  const [form, setForm] = useState({
    contract_start: "",
    contract_end: "",
    min_bet_override: "",
    max_bet_override: "",
    rtp_override: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesRes, providersRes] = await Promise.all([
          getAllGames(),
          getTenantProviders(tenantId)
        ]);

        const allGames = gamesRes.data;
        const activeProviders = providersRes.data.filter(p => p.is_active);
        
        const filtered = allGames.filter(game => {
          const isProviderContracted = activeProviders.some(p => p.provider_id === game.provider_id);
          const isAlreadyEnabled = existingGames.some(eg => eg.game_id === game.game_id);
          return isProviderContracted && !isAlreadyEnabled;
        });

        setAvailableGames(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tenantId, existingGames]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedGameId) return;

    try {
      setSubmitting(true);
      const payload = {
        game_id: selectedGameId,
        is_active: true,
        contract_start: form.contract_start || null,
        contract_end: form.contract_end || null,
        min_bet_override: form.min_bet_override ? Number(form.min_bet_override) : null,
        max_bet_override: form.max_bet_override ? Number(form.max_bet_override) : null,
        rtp_override: form.rtp_override ? Number(form.rtp_override) : null,
      };

      await enableTenantGame(tenantId, payload);
      onSuccess();
      onClose();
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to enable game");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-gray-900 border border-gray-800 rounded-[2rem] w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-800 flex justify-between items-start bg-black/20">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500">
              <Plus size={24} strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Enable Game</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Add Master Title to Tenant Library</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors cursor-pointer p-1">
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          
          {/* Game Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Gamepad2 size={12} className="text-yellow-500" /> Choose Game Title
            </label>
            <div className="relative">
              <select
                value={selectedGameId}
                onChange={(e) => setSelectedGameId(e.target.value)}
                className="w-full bg-black border border-gray-800 rounded-xl p-4 text-sm text-white focus:border-yellow-500 outline-none appearance-none cursor-pointer transition-all disabled:opacity-50"
                disabled={loading}
              >
                <option value="">{loading ? "Syncing catalog..." : "-- Select from Available Titles --"}</option>
                {availableGames.map((g) => (
                  <option key={g.game_id} value={g.game_id}>{g.game_name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
            </div>
          </div>

          {/* Contract Dates */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px] border-b border-gray-800 pb-2">Contract Validity</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 uppercase ml-1">Start Date</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
                    <input 
                        type="date" 
                        style={{ colorScheme: "dark" }}
                        value={form.contract_start}
                        onChange={e => setForm({...form, contract_start: e.target.value})}
                        className="w-full bg-black border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-yellow-500 outline-none cursor-pointer"
                    />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 uppercase ml-1">End Date (Optional)</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
                    <input 
                        type="date" 
                        style={{ colorScheme: "dark" }}
                        value={form.contract_end}
                        onChange={e => setForm({...form, contract_end: e.target.value})}
                        className="w-full bg-black border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-yellow-500 outline-none cursor-pointer"
                    />
                </div>
              </div>
            </div>
          </div>

          {/* Overrides */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px] border-b border-gray-800 pb-2">Tenant Overrides</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 uppercase ml-1 flex items-center gap-1"><Coins size={10}/> Min Bet</label>
                <input 
                    type="number"
                    placeholder="Global"
                    value={form.min_bet_override}
                    onChange={e => setForm({...form, min_bet_override: e.target.value})}
                    className="w-full bg-black border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-yellow-500 outline-none font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 uppercase ml-1 flex items-center gap-1"><Coins size={10}/> Max Bet</label>
                <input 
                    type="number"
                    placeholder="Global"
                    value={form.max_bet_override}
                    onChange={e => setForm({...form, max_bet_override: e.target.value})}
                    className="w-full bg-black border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-yellow-500 outline-none font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 uppercase ml-1 flex items-center gap-1"><Percent size={10}/> RTP %</label>
                <input 
                    type="number"
                    placeholder="Global"
                    value={form.rtp_override}
                    onChange={e => setForm({...form, rtp_override: e.target.value})}
                    className="w-full bg-black border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-yellow-500 outline-none font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-gray-800 flex flex-col sm:flex-row gap-3 bg-black/20">
          <button 
            onClick={onClose} 
            className="flex-1 px-6 py-4 rounded-xl text-gray-500 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            disabled={submitting || !selectedGameId}
            onClick={handleSubmit}
            className="flex-[2] bg-yellow-500 hover:bg-yellow-600 text-black font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-lg transition-all active:scale-[0.98] disabled:opacity-30 disabled:grayscale cursor-pointer flex items-center justify-center gap-2 order-1 sm:order-2"
          >
            {submitting ? (
              <RefreshCw className="animate-spin" size={18} />
            ) : (
              <><CheckCircle2 size={18} /> Deploy to Library</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnableTenantGameModal;