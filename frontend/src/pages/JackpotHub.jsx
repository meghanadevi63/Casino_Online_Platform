import { useEffect, useState, useContext, useMemo } from "react";
import { getAvailableJackpots, joinJackpot } from "../api/playerRaffle.api";
import { AuthContext } from "../context/AuthContext";
import { 
  Trophy, 
  Coins, 
  Users, 
  Timer, 
  Target, 
  CheckCircle2, 
  CircleDashed, 
  Search, 
  Info,
  AlertCircle,
  ArrowRight,
  History,
  Flame,
  Calendar,
  Activity,
  Clock 
} from "lucide-react";

const JackpotHub = () => {
  const { user } = useContext(AuthContext);
  const [jackpots, setJackpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);
  const [activeTab, setActiveTab] = useState("live"); 
  
  const [statusMessage, setStatusMessage] = useState({ id: null, text: "", type: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const symbol = user?.currency_symbol || "₹";

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAvailableJackpots();
      setJackpots(res.data);
    } catch (err) {
      console.error("Failed to sync pools", err);
    } finally { setLoading(false); }
  };

  const handleJoin = async (id) => {
    setJoining(id);
    setStatusMessage({ id: null, text: "", type: "" });

    try {
      await joinJackpot(id);
      setStatusMessage({ id, text: "Successfully entered!", type: "success" });
      window.dispatchEvent(new CustomEvent("balanceUpdated"));
      
      setTimeout(() => {
        loadData();
        setStatusMessage({ id: null, text: "", type: "" });
      }, 2000);

    } catch (err) {
      const errMsg = err.response?.data?.detail || "Failed to join";
      setStatusMessage({ id, text: errMsg, type: "error" });
      setTimeout(() => setStatusMessage({ id: null, text: "", type: "" }), 4000);
    } finally { 
      setJoining(null); 
    }
  };

  // Search & Tab Filtering Logic
  const filteredJackpots = useMemo(() => {
    return jackpots.filter(j => {
      const matchesSearch = j.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === "live" ? j.status === "active" : j.status === "completed";
      return matchesSearch && matchesTab;
    });
  }, [jackpots, searchTerm, activeTab]);

  // Utility to format Date and Time neatly
  const formatDateTime = (dateStr) => {
    return new Date(dateStr).toLocaleString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <CircleDashed className="animate-spin text-yellow-500 mb-4" size={40} />
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-[4px]">Accessing Live Pools...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 ">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-800 pb-8">
        <div className="flex items-center gap-4">
          <div className="bg-yellow-500/20 p-3 rounded-2xl">
            <Trophy className="text-yellow-500" size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Jackpot Hub</h1>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[3px] mt-2">Exclusive Raffles & Global Draws</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <input 
                type="text"
                placeholder="Search Pools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:border-yellow-500 outline-none w-full md:w-64 transition-all uppercase font-bold"
              />
            </div>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex items-center gap-2 p-1 bg-gray-900/50 border border-gray-800 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("live")}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "live" ? "bg-yellow-500 text-black shadow-lg" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Activity size={14} /> Live Pools
          </button>
          <button
            onClick={() => setActiveTab("winners")}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "winners" ? "bg-yellow-500 text-black shadow-lg" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <History size={14} /> Past Winners
          </button>
      </div>

      {/* JACKPOT GRID */}
      {filteredJackpots.length === 0 ? (
        <div className="bg-gray-900/50 border border-dashed border-gray-800 rounded-[2.5rem] p-24 text-center">
          <Trophy size={48} className="mx-auto text-gray-800 mb-4 opacity-20" />
          <p className="text-gray-500 font-black uppercase tracking-widest text-xs">No {activeTab} pools available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredJackpots.map(j => {
            const isTimeUp = j.jackpot_type === 'TIME_BASED' && new Date(j.draw_at) <= new Date();
            const isThresholdMet = j.jackpot_type === 'THRESHOLD' && j.current_amount >= j.target_amount;
            const isJoinable = !isTimeUp && !isThresholdMet && !j.is_joined;
            
            const progress = j.jackpot_type === 'THRESHOLD' ? (j.current_amount / j.target_amount) * 100 : 0;
            const isUrgent = progress >= 90;

            return (
              <div key={j.jackpot_id} className={`group bg-gray-900 border transition-all duration-500 rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col shadow-2xl ${
                j.status === 'active' ? "border-gray-800 hover:border-yellow-500/50" : "border-gray-800/30 grayscale-[0.2]"
              }`}>
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <span className="bg-black/50 text-yellow-500 text-[9px] font-black px-3 py-1 rounded-full border border-yellow-500/20 uppercase tracking-widest">
                    {j.jackpot_type.replace('_', ' ')}
                  </span>
                  
                  <div className="flex items-center gap-1.5 text-gray-500 bg-black/30 px-2.5 py-1 rounded-lg border border-gray-800">
                      <Users size={12} className="text-yellow-500/50" />
                      <span className="text-[10px] font-black font-mono tracking-tighter">{j.participants_count || 0} Joined</span>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2 group-hover:text-yellow-400 transition-colors">
                  {j.name}
                </h3>
                
                <div className="mb-6 h-14 relative z-10">
                   {activeTab === 'winners' ? (
                        <div className="flex flex-col gap-1 text-yellow-500"> 
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={14} className="text-yellow-500" />
                                <p className="text-[10px] font-black uppercase tracking-wider">Concluded</p>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-500 font-bold text-[10px] uppercase">
                                <Clock size={10} />
                                {formatDateTime(j.drawn_at)} 
                            </div>
                        </div>
                   ) : j.jackpot_type === 'TIME_BASED' ? (
                     <div className="flex flex-col gap-1 text-blue-400">
                        <div className="flex items-center gap-2">
                           <Calendar size={14} />
                           <p className="text-[10px] font-black uppercase tracking-wider">Scheduled Draw</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500 font-bold text-[10px] uppercase">
                           <Clock size={10} className="text-yellow-500/50" />
                           {formatDateTime(j.draw_at)} 
                        </div>
                     </div>
                   ) : j.jackpot_type === 'THRESHOLD' ? (
                      <div className="space-y-2">
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                              <span className="text-gray-500">Target: {symbol}{j.target_amount.toLocaleString()}</span>
                              <span className={isUrgent ? "text-red-500 animate-pulse" : "text-yellow-500"}>
                                {isUrgent && <Flame size={10} className="inline mr-1" />}
                                {Math.round(progress)}%
                              </span>
                          </div>
                          <div className="w-full bg-black h-1.5 rounded-full overflow-hidden border border-gray-800">
                              <div className={`h-full transition-all duration-1000 ${isUrgent ? 'bg-red-500' : 'bg-yellow-500'}`} style={{ width: `${progress}%` }}></div>
                          </div>
                      </div>
                   ) : (
                      <div className="flex items-center gap-2 text-gray-500">
                          <Info size={14} />
                          <p className="text-[10px] font-black uppercase tracking-wider">Draw: Admin discretion</p>
                      </div>
                   )}
                </div>

                <div className="bg-black/40 rounded-3xl p-5 border border-gray-800/50 mb-8 mt-auto relative z-10 shadow-inner">
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Total Pool</p>
                        <p className={`text-3xl font-black font-mono tracking-tighter ${activeTab === 'winners' ? 'text-yellow-500' : 'text-white'}`}>
                            {symbol}{j.current_amount.toLocaleString()}
                        </p>
                     </div>
                     {activeTab === 'live' && (
                        <div className="text-right">
                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Entry Fee</p>
                            <div className="flex items-center justify-end gap-1 text-lg font-bold text-yellow-500">
                                <Coins size={14} /> {j.entry_fee}
                            </div>
                        </div>
                     )}
                  </div>
                </div>

                <div className="relative z-10">
                  {activeTab === 'winners' ? (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-2xl text-center"> 
                          <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 leading-none">Champion</p>
                          <p className="text-lg font-black text-yellow-500 uppercase tracking-tighter truncate">{j.winner_name}</p>
                      </div>
                  ) : statusMessage.id === j.jackpot_id ? (
                      <div className={`p-4 rounded-xl text-center text-[10px] font-black uppercase tracking-widest animate-in zoom-in-95 duration-200 ${
                          statusMessage.type === 'success' ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                      }`}>
                          {statusMessage.type === 'success' ? <CheckCircle2 className="mx-auto mb-1 text-yellow-500" size={16} /> : <AlertCircle className="mx-auto mb-1 text-red-500" size={16} />}
                          {statusMessage.text}
                      </div>
                  ) : (
                      <button
                          disabled={!isJoinable || joining === j.jackpot_id}
                          onClick={() => handleJoin(j.jackpot_id)}
                          className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-[2px] transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2 cursor-pointer
                          ${j.is_joined 
                              ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 cursor-default" 
                              : isJoinable 
                              ? "bg-yellow-500 text-black hover:bg-yellow-400 shadow-yellow-500/10" 
                              : "bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed"}
                          `}
                      >
                          {joining === j.jackpot_id ? <CircleDashed className="animate-spin" size={18} /> : 
                           j.is_joined ? <><CheckCircle2 size={16}/> Already Joined</> : 
                           isJoinable ? <><ArrowRight size={16}/> Enter Raffle</> : 
                           "Entry Closed"}
                      </button>
                  )}
                </div>
                
                {/* Secondary Messages */}
                {activeTab === 'live' && !isJoinable && !j.is_joined && (
                  <p className="text-center text-[9px] font-black text-red-500/50 uppercase mt-4 tracking-[3px] leading-none">
                      Registration Expired
                  </p>
                )}
                {activeTab === 'live' && j.is_joined && (isTimeUp || isThresholdMet) && (
                  <p className="text-center text-[9px] font-black text-yellow-500/50 uppercase mt-4 tracking-[3px] leading-none">
                      Awaiting Results
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JackpotHub;