import { useEffect, useState } from "react";
import { createBonus, getAdminBonuses } from "../../api/adminBonus.api";
import { 
  Gift, Plus, Trophy, Coins, Zap, Target, Tag, 
  CalendarClock, CheckCircle2, ArrowRight, Clock, Layers, Search 
} from "lucide-react";

const AdminBonuses = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); 

  const [form, setForm] = useState({
    bonus_name: "",
    bonus_type: "POST_WAGER_REWARD",
    bonus_amount: "",
    wagering_multiplier: "10",
    valid_from: new Date().toISOString().slice(0, 16),
    valid_to: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAdminBonuses();
      setCampaigns(res.data);
    } catch (err) {
      console.error("Failed to load bonuses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    
    const payload = {
      ...form,
      bonus_amount: parseFloat(form.bonus_amount),
      wagering_multiplier: parseInt(form.wagering_multiplier),
      valid_from: new Date(form.valid_from).toISOString(),
      valid_to: new Date(form.valid_to).toISOString(),
    };

    try {
      await createBonus(payload);
      setShowCreate(false);
      setForm({
        bonus_name: "",
        bonus_type: "POST_WAGER_REWARD",
        bonus_amount: "",
        wagering_multiplier: "10",
        valid_from: new Date().toISOString().slice(0, 16),
        valid_to: "",
      });
      loadData();
    } catch (err) {
      alert("Creation failed");
    }
  };

  // Search Filtering Logic
  const filteredCampaigns = campaigns.filter(c => 
    c.bonus_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="text-yellow-500 bg-yellow-500/10 p-2 rounded-xl">
            <Gift size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Bonus Campaigns</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Manage global player incentives</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:border-yellow-500 outline-none w-64 transition-all"
            />
          </div>

          <button 
            onClick={() => setShowCreate(true)}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-yellow-500/20 cursor-pointer"
          >
            <Plus size={16} strokeWidth={3} /> New Campaign
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-500 animate-pulse font-black uppercase tracking-widest text-xs">Syncing Catalog...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map(c => {
            //  to determine if bonus is expired
            const isExpired = new Date(c.valid_to) < new Date();

            return (
              <div key={c.bonus_id} className={`bg-gray-900 border p-6 rounded-[2rem] relative overflow-hidden group transition-all shadow-xl ${isExpired ? 'opacity-60 border-gray-800' : 'hover:border-yellow-500/30 border-gray-800'}`}>
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-2xl ${isExpired ? 'bg-gray-800 text-gray-600' : 'bg-yellow-500/10 text-yellow-500'}`}>
                    <Trophy size={24} />
                  </div>
                  
                  {/*  Dynamic Status Badge (Active / Paused / Expired) */}
                  <span className={`flex items-center gap-1.5 text-[9px] font-black px-2.5 py-1 rounded-full uppercase border ${
                    isExpired 
                      ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                      : c.is_active 
                        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {!isExpired && c.is_active && <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />}
                    {isExpired ? 'Expired' : c.is_active ? 'Active' : 'Paused'}
                  </span>
                </div>

                <h4 className="text-xl font-bold text-white mb-1 uppercase tracking-tight">{c.bonus_name}</h4>
                <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-6">{c.bonus_type.replace(/_/g, ' ')}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-black/40 p-3 rounded-xl border border-gray-800">
                    <p className="text-[9px] font-bold text-gray-500 uppercase mb-1">Reward</p>
                    <p className="text-sm font-black text-white font-mono">₹{c.bonus_amount}</p>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl border border-gray-800">
                    <p className="text-[9px] font-bold text-gray-500 uppercase mb-1">Wagering</p>
                    <p className="text-sm font-black text-white font-mono">{c.wagering_multiplier}x</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                  <Clock size={12} />
                  <span>Ends: {new Date(c.valid_to).toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500">
                <Target size={20} strokeWidth={3} />
              </div>
              <h2 className="text-2xl font-bold">New Challenge</h2>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Campaign Name</label>
                    <div className="relative group">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500 transition-colors" size={16} />
                      <input 
                          className="w-full bg-black border border-gray-800 rounded-xl p-3 pl-10 text-sm text-white focus:border-yellow-500 outline-none transition-all"
                          placeholder="e.g. Weekly Grinder"
                          onChange={e => setForm({...form, bonus_name: e.target.value})}
                          required
                      />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Bonus Type</label>
                    <div className="relative group">
                      <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500 transition-colors" size={16} />
                      <select 
                          className="w-full bg-black border border-gray-800 rounded-xl p-3 pl-10 text-sm text-white focus:border-yellow-500 outline-none transition-all appearance-none cursor-pointer"
                          value={form.bonus_type}
                          onChange={e => setForm({...form, bonus_type: e.target.value})}
                          required
                      >
                        <option value="POST_WAGER_REWARD">Post-Wager Reward</option>
                        <option value="DEPOSIT">Deposit Match</option>
                        <option value="FREE_BET">Free Bet</option>
                        <option value="CASHBACK">Cashback</option>
                      </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Reward (Cash)</label>
                        <div className="relative group">
                          <Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500 transition-colors" size={16} />
                          <input 
                              type="number"
                              className="w-full bg-black border border-gray-800 rounded-xl p-3 pl-10 text-sm text-white outline-none focus:border-yellow-500 transition-all"
                              placeholder="500"
                              onChange={e => setForm({...form, bonus_amount: e.target.value})}
                              required
                          />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Multiplier (x)</label>
                        <div className="relative group">
                          <Zap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500 transition-colors" size={16} />
                          <input 
                              type="number"
                              className="w-full bg-black border border-gray-800 rounded-xl p-3 pl-10 text-sm text-white outline-none focus:border-yellow-500 transition-all"
                              placeholder="10"
                              value={form.wagering_multiplier}
                              onChange={e => setForm({...form, wagering_multiplier: e.target.value})}
                              required
                          />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Start Date</label>
                        <input 
                            type="datetime-local"
                            className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-yellow-500 transition-all"
                            style={{ colorScheme: 'dark' }}
                            value={form.valid_from}
                            onChange={e => setForm({...form, valid_from: e.target.value})}
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">End Date</label>
                        <input 
                            type="datetime-local"
                            className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-yellow-500 transition-all"
                            style={{ colorScheme: 'dark' }}
                            value={form.valid_to}
                            onChange={e => setForm({...form, valid_to: e.target.value})}
                            required
                        />
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-800 mt-4 flex gap-3">
                    <button type="submit" className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
                      <ArrowRight size={16} /> Launch
                    </button>
                    <button type="button" onClick={() => setShowCreate(false)} className="px-6 text-gray-500 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-colors cursor-pointer">
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

export default AdminBonuses;