import { useEffect, useState } from "react";
import { getActiveBonusUsage } from "../../api/adminBonus.api";
import { 
  TrendingUp, 
  Users, 
  Target, 
  CheckCircle2, 
  RefreshCw, 
  Mail, 
  Search,
  X,
  User as UserIcon 
} from "lucide-react";

const AdminBonusProgress = () => {
  const [activeUsage, setActiveUsage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); 

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getActiveBonusUsage();
      setActiveUsage(res.data);
    } catch (err) {
      console.error("Failed to load progress", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  //  Filtering Logic
  const filteredUsage = activeUsage.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.player_name?.toLowerCase().includes(term) ||
      u.player_email?.toLowerCase().includes(term) ||
      u.bonus_name?.toLowerCase().includes(term) ||
      u.status?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          
          <div className=" text-yellow-500">
            <TrendingUp size={28} />
          </div>
          <div>
           
            <h1 className="text-2xl font-bold">Player Progress</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Real-time wagering tracking</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/*  Search Input */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search player, bonus, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black border border-gray-800 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white focus:border-yellow-500 outline-none w-full md:w-64 transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button 
            onClick={loadData}
            className="p-2.5 bg-gray-900 border border-gray-800 text-gray-500 hover:text-yellow-500 hover:border-yellow-500/50 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/50 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-800">
                <th className="px-8 py-5">Player Identity</th>
                <th className="px-8 py-5">Campaign</th>
                <th className="px-8 py-5 text-center">Wagering Progress</th>
                <th className="px-8 py-5 text-center">Target</th>
                <th className="px-8 py-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredUsage.map((u) => {
                const progress = (u.wagering_completed / u.wagering_required) * 100;
                const pSymbol = u.currency_symbol || "₹";

                return (
                  <tr key={u.bonus_usage_id} className="hover:bg-yellow-500/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-800 p-2.5 rounded-xl text-yellow-500 border border-gray-700 group-hover:border-yellow-500/50 transition-colors">
                          <UserIcon size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white">{u.player_name || "Unknown Player"}</span>
                          <span className="text-[10px] text-gray-500 font-mono tracking-tighter">{u.player_email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <span className="text-xs font-black text-gray-300 uppercase tracking-tight">{u.bonus_name}</span>
                      <p className="text-[9px] text-gray-600 font-bold uppercase mt-1">Reward: {pSymbol}{u.bonus_amount.toLocaleString()}</p>
                    </td>

                    <td className="px-8 py-6">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex justify-between w-32 text-[9px] font-mono font-bold text-yellow-500 uppercase">
                          <span>{pSymbol}{u.wagering_completed.toLocaleString()}</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-32 bg-gray-800 h-1.5 rounded-full overflow-hidden border border-gray-700">
                          <div 
                            className="bg-yellow-500 h-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(234,179,8,0.4)]" 
                            style={{ width: `${progress}%` }} 
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6 text-center">
                      <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-500 font-mono bg-black/40 px-3 py-1 rounded-lg border border-gray-800">
                        <Target size={10} />
                        {pSymbol}{u.wagering_required.toLocaleString()}
                      </div>
                    </td>

                    <td className="px-8 py-6 text-right">
                      <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase px-3 py-1 rounded-full border ${
                        u.status === 'claimable' 
                          ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                          : u.status === 'completed'
                          ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                          : 'bg-gray-800 text-gray-500 border-gray-700'
                      }`}>
                        {u.status === 'claimable' && <CheckCircle2 size={10} />}
                        {u.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Loading State Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-[2px] flex items-center justify-center z-10">
             <RefreshCw className="text-yellow-500 animate-spin" size={32} />
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredUsage.length === 0 && (
          <div className="p-24 text-center">
            <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 opacity-20">
              <Users size={32} className="text-white" />
            </div>
            <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">
              {searchTerm ? `No results matching "${searchTerm}"` : "No active player bonus data found"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBonusProgress;