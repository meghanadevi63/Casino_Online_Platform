import { useEffect, useState, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { getMyBonuses, claimBonus, cancelBonus } from "../api/playerBonus.api";
import api from "../api/axios";
import { 
  Gift, 
  Zap, 
  CheckCircle2, 
  Trophy, 
  Timer, 
  ArrowLeft, 
  CircleDashed,
  History,
  Ban,
  Filter,
  XCircle,
  AlertCircle,
  Clock,
  Calendar,
  RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";


const CountdownTimer = ({ targetDate, prefix = "" }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;
      if (distance < 0) return "EXPIRED";
      
      const d = Math.floor(distance / (1000 * 60 * 60 * 24));
      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      if (d > 0) return `${d}d ${h}h ${m}m`;
      return `${h}h ${m}m ${s}s`;
    };

    const timer = setInterval(() => setTimeLeft(calculate()), 1000);
    setTimeLeft(calculate());
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <span className="font-mono text-orange-500 font-bold">
      {prefix} {timeLeft}
    </span>
  );
};

const Promotions = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("available"); 
  const [available, setAvailable] = useState([]);
  const [myBonuses, setMyBonuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [historyFilter, setHistoryFilter] = useState("ALL");

  const symbol = user?.currency_symbol || "₹";

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [availRes, myRes] = await Promise.all([
        api.get("/bonuses/available"),
        getMyBonuses()
      ]);
      setAvailable(availRes.data);
      setMyBonuses(myRes.data);
    } catch (err) {
      console.error("Error loading promotions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Logic to split Active vs History
  const activeChallenges = myBonuses.filter(b => ["active", "claimable"].includes(b.status));
  const hasActiveChallenge = activeChallenges.length > 0;

  const historyChallenges = myBonuses.filter(b => {
    const isHistory = ["completed", "expired", "cancelled"].includes(b.status);
    if (historyFilter === "ALL") return isHistory;
    return b.status === historyFilter.toLowerCase();
  });

  const handleActivate = async (id) => {
    if (hasActiveChallenge) {
      alert("You already have an active challenge. Complete or cancel it first.");
      return;
    }
    try {
      setActionLoading(id);
      await api.post(`/bonuses/activate/${id}`);
      setActiveTab("active");
      loadData();
    } catch (err) { 
      alert(err.response?.data?.detail || "Failed to join challenge"); 
    } finally {
      setActionLoading(null);
    }
  };

  const handleClaim = async (usageId) => {
    try {
      setActionLoading(usageId);
      await claimBonus(usageId);
      window.dispatchEvent(new CustomEvent("balanceUpdated"));
      loadData();
    } catch (err) { 
      alert(err.response?.data?.detail || "Claim failed"); 
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (usageId) => {
    if (!window.confirm("Are you sure you want to forfeit this challenge? All progress will be lost and pending bonus funds will be removed from your wallet.")) return;
    try {
      setActionLoading(usageId);
      await cancelBonus(usageId);
      window.dispatchEvent(new CustomEvent("balanceUpdated"));
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || "Cancellation failed");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <CircleDashed className="animate-spin text-yellow-500 mb-4" size={40} />
        <div className="text-yellow-500 font-bold text-xl uppercase tracking-widest">Syncing Offers...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-8">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500/20 p-2 rounded-xl">
            <Trophy className="text-yellow-500" size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Promotions Hub</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Complete challenges to earn cash</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
            <button onClick={loadData} className="p-2 text-gray-500 hover:text-white transition-colors cursor-pointer">
                <RefreshCw size={20} />
            </button>
            <div className="flex items-center gap-2 bg-gray-900 p-1 rounded-xl border border-gray-800">
            {[
                { id: "available", label: "Available", icon: <Zap size={14}/> },
                { id: "active", label: "Active", icon: <CircleDashed size={14}/> },
                { id: "history", label: "History", icon: <History size={14}/> }
            ].map(t => (
                <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === t.id ? 'bg-yellow-500 text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'
                }`}
                >
                {t.icon} {t.label}
                {t.id === 'active' && activeChallenges.length > 0 && (
                    <span className="bg-black text-yellow-500 px-1.5 rounded-full text-[8px]">{activeChallenges.length}</span>
                )}
                </button>
            ))}
            </div>
        </div>
      </div>

      {/* HISTORY FILTERS */}
      {activeTab === "history" && (
        <div className="flex items-center gap-6 bg-gray-900/50 p-5 rounded-2xl border border-gray-800">
          <div className="flex items-center gap-2 text-gray-400">
            <Filter size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Filter By:</span>
          </div>
          <div className="flex gap-3">
            {["ALL", "COMPLETED", "EXPIRED", "CANCELLED"].map(f => (
              <button
                key={f}
                onClick={() => setHistoryFilter(f)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all cursor-pointer ${
                  historyFilter === f 
                    ? "bg-yellow-500 border-yellow-500 text-black shadow-lg shadow-yellow-500/10" 
                    : "bg-black border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* GRID CONTENT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. AVAILABLE TAB */}
        {activeTab === "available" && available
          .filter(b => new Date(b.valid_to) > new Date()) // Safety filter
          .map(b => (
          <div key={b.bonus_id} className="bg-gray-900 p-6 rounded-2xl border border-gray-800 hover:border-yellow-500/50 transition duration-300 shadow-lg group flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="bg-yellow-500/10 p-3 rounded-2xl text-yellow-500 group-hover:scale-110 transition-transform">
                  <Gift size={24} />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Reward</span>
                  <span className="text-xl font-black text-white font-mono">{symbol}{b.bonus_amount}</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-2">{b.bonus_name}</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-6">
                Wager <span className="text-white font-bold">{b.wagering_multiplier}x</span> the reward amount in any cash game to unlock this bonus.
              </p>

              <div className="space-y-2 mb-8 bg-black/30 p-3 rounded-xl border border-gray-800">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                  <span className="text-gray-500 flex items-center gap-1"><Timer size={12}/> Join Before</span>
                  <CountdownTimer targetDate={b.valid_to} />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {hasActiveChallenge && (
                <div className="flex items-center gap-2 text-[9px] text-orange-400 font-bold uppercase bg-orange-400/5 p-2 rounded-lg border border-orange-400/20">
                  <AlertCircle size={12} /> Finish active challenge first
                </div>
              )}
              <button 
                onClick={() => handleActivate(b.bonus_id)}
                disabled={actionLoading === b.bonus_id || hasActiveChallenge}
                className={`w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-xl transition transform active:scale-95 flex items-center justify-center gap-2 uppercase text-xs tracking-widest shadow-lg shadow-yellow-500/10 disabled:opacity-30 disabled:grayscale 
    ${hasActiveChallenge || actionLoading === b.bonus_id ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {actionLoading === b.bonus_id ? <CircleDashed className="animate-spin" size={16}/> : "Start Challenge"}
              </button>
            </div>
          </div>
        ))}

        {/* 2. ACTIVE TAB */}
        {activeTab === "active" && activeChallenges.map(u => {
          const progress = (u.wagering_completed / u.wagering_required) * 100;
          const isClaimable = u.status === 'claimable';

          return (
            <div key={u.bonus_usage_id} className={`bg-gray-900 p-6 rounded-2xl border transition duration-300 shadow-lg flex flex-col justify-between ${isClaimable ? 'border-yellow-500/50 shadow-yellow-500/5' : 'border-gray-800'}`}>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight">{u.bonus_name}</h3>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${isClaimable ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                    {u.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-6 text-[9px] font-bold uppercase text-gray-500">
                    <span className="flex items-center gap-1"><Calendar size={10}/> Started: {new Date(u.granted_at).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1 text-orange-400"><Clock size={10}/> Deadline: <CountdownTimer targetDate={u.expired_at} /></span>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Wagering Progress</span>
                    <span className={`text-xs font-black ${isClaimable ? 'text-yellow-500' : 'text-white'}`}>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-black h-2 rounded-full border border-gray-800 overflow-hidden">
                    <div className="bg-yellow-500 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(234,179,8,0.3)]" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-gray-500 uppercase font-bold">
                    <span>{symbol}{u.wagering_completed.toLocaleString()}</span>
                    <span>Target: {symbol}{u.wagering_required.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleClaim(u.bonus_usage_id)}
                  disabled={!isClaimable || actionLoading === u.bonus_usage_id}
                  className={`w-full font-black py-4 rounded-xl transition transform active:scale-95 flex items-center justify-center gap-2 uppercase text-xs tracking-widest cursor-pointer ${
                    isClaimable 
                      ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-500/20' 
                      : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {actionLoading === u.bonus_usage_id ? <CircleDashed className="animate-spin" size={16}/> : isClaimable ? "Claim Cash Reward" : "Locked"}
                </button>
                
                <button 
                  onClick={() => handleCancel(u.bonus_usage_id)}
                  disabled={actionLoading === u.bonus_usage_id}
                  className="w-full py-2 text-[9px] font-black text-gray-600 hover:text-red-500 uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <XCircle size={12} /> Cancel Challenge
                </button>
              </div>
            </div>
          );
        })}

        {/* 3. HISTORY TAB */}
        {activeTab === "history" && historyChallenges.map(u => {
          const isCompleted = u.status === 'completed';
          return (
            <div 
              key={u.bonus_usage_id} 
              className={`p-6 rounded-2xl border transition-all duration-300 ${
                isCompleted 
                ? "bg-yellow-500/5 border-yellow-500/30 shadow-lg shadow-yellow-500/5" 
                : "bg-gray-900/40 border-gray-800 opacity-70 hover:opacity-100"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className={`text-sm font-bold uppercase ${isCompleted ? 'text-yellow-500' : 'text-gray-300'}`}>
                  {u.bonus_name}
                </h3>
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                  isCompleted 
                  ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' 
                  : 'bg-red-500/10 text-red-500 border-red-500/20'
                }`}>
                  {u.status}
                </span>
              </div>
              
              <div className="space-y-1 mb-4 text-[9px] text-gray-600 font-bold uppercase">
                  <p>Started: {new Date(u.granted_at).toLocaleDateString()}</p>
                  {u.completed_at && <p className="text-yellow-500/70">Claimed: {new Date(u.completed_at).toLocaleDateString()}</p>}
              </div>

              <div className="flex justify-between items-center border-t border-gray-800 pt-4">
                <div className="text-xs text-gray-500">
                  {isCompleted ? 'Reward Successfully Claimed' : u.status === 'cancelled' ? 'Challenge Forfeited' : 'Challenge Expired'}
                </div>
                <div className={`text-sm font-mono font-bold ${isCompleted ? 'text-yellow-500' : 'text-white'}`}>
                  {isCompleted ? '+' : ''}{symbol}{u.bonus_amount}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* EMPTY STATES */}
      {!loading && (
        (activeTab === 'available' && available.length === 0) || 
        (activeTab === 'active' && activeChallenges.length === 0) ||
        (activeTab === 'history' && historyChallenges.length === 0)
      ) && (
        <div className="bg-gray-900/50 border border-dashed border-gray-800 rounded-[2.5rem] p-24 text-center">
          <Trophy className="mx-auto mb-4 opacity-10" size={48} />
          <p className="font-bold uppercase tracking-widest text-gray-600">No {activeTab} promotions found.</p>
        </div>
      )}
    </div>
  );
};

export default Promotions;