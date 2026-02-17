import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  getResponsibleLimits,
  setResponsibleLimits,
  selfExclude,
  getResponsibleLimitsUsage,
} from "../api/responsibleGaming.api";
import { 
  ShieldCheck, 
  Activity, 
  Settings2, 
  AlertTriangle, 
  Calendar, 
  Wallet,
  Clock,
  CheckCircle2,
  LogOut 
} from "lucide-react";

const ProgressBar = ({ used, limit, symbol }) => {
  if (!limit) return <div className="text-xs text-gray-500 italic mt-2">No limit set</div>;

  const percent = Math.min((used / limit) * 100, 100);

  let colorClass = "bg-green-500";
  if (percent >= 80) colorClass = "bg-red-500";
  else if (percent >= 50) colorClass = "bg-yellow-500";

  return (
    <div className="mt-4">
      <div className="flex justify-between items-end mb-1">
        <span className="text-[10px] font-bold text-gray-500 uppercase">Usage Intensity</span>
        <span className={`text-xs font-bold ${percent >= 80 ? 'text-red-400' : 'text-gray-300'}`}>
            {percent.toFixed(0)}%
        </span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden border border-gray-700">
        <div
          className={`${colorClass} h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-[10px] font-medium text-gray-500">
          <span>{symbol}0</span>
          <span>Limit: {symbol}{limit.toLocaleString()}</span>
      </div>
    </div>
  );
};

const ResponsibleGaming = () => {
  const { user } = useContext(AuthContext);
  const [limits, setLimits] = useState(null);
  const [usage, setUsage] = useState(null);

  const [form, setForm] = useState({
    daily_deposit_limit: "",
    daily_bet_limit: "",
    monthly_bet_limit: "",
  });

  const [excludeDate, setExcludeDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const symbol = user?.currency_symbol || "₹";

  // ===============================
  // LOAD LIMITS + USAGE
  // ===============================
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [limitsRes, usageRes] = await Promise.all([
        getResponsibleLimits(),
        getResponsibleLimitsUsage(),
      ]);

      setLimits(limitsRes.data);
      setUsage(usageRes.data);

      setForm({
        daily_deposit_limit: limitsRes.data.daily_deposit_limit || "",
        daily_bet_limit: limitsRes.data.daily_bet_limit || "",
        monthly_bet_limit: limitsRes.data.monthly_bet_limit || "",
      });
    } catch {
      setError("Responsible gaming limits not set yet.");
    }
  };

  const isSelfExcluded =
    limits?.self_exclusion_until &&
    new Date(limits.self_exclusion_until) >= new Date();

  // ===============================
  // SAVE LIMITS
  // ===============================
  const saveLimits = async () => {
    setLoading(true);
    setError("");

    try {
      const payload = {};
      Object.keys(form).forEach((key) => {
        if (form[key] !== "") payload[key] = Number(form[key]);
      });

      const res = await setResponsibleLimits(payload);
      setLimits(res.data);
      await loadAll();
      alert("Limits updated successfully");
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to update limits");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // SELF EXCLUDE
  // ===============================
  const handleSelfExclude = async () => {
    if (!excludeDate) return;
    if (!window.confirm("WARNING: Self-exclusion cannot be reversed. You will be locked out of your account until the chosen date. Proceed?")) return;

    setLoading(true);
    setError("");

    try {
      const res = await selfExclude({
        self_exclusion_until: excludeDate,
      });
      setLimits(res.data);
      await loadAll();
      alert("Self-exclusion activated. You will now be logged out.");
    } catch (err) {
      setError(err?.response?.data?.detail || "Self-exclusion failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500/20 p-2 rounded-xl">
            <ShieldCheck className="text-yellow-500" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Safe Play</h1>
            <p className="text-sm text-gray-500 font-medium">Protect your bankroll and set healthy boundaries</p>
          </div>
        </div>
        
        {isSelfExcluded && (
          <div className="bg-red-500/10 border border-red-500/50 px-4 py-2 rounded-xl flex items-center gap-2 animate-pulse">
            <Clock size={16} className="text-red-500" />
            <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Self Excluded until {limits.self_exclusion_until}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: USAGE TRACKING */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={18} className="text-yellow-500" />
            <h2 className="text-lg font-bold text-white uppercase tracking-widest text-[10px]">Real-time Usage</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Daily Card */}
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <span className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Daily Betting</span>
                <Wallet size={16} className="text-gray-600" />
              </div>
              <div className="text-2xl font-black text-white">
                {symbol}{usage?.daily_bet_used?.toLocaleString() || '0'}
              </div>
              <ProgressBar used={usage?.daily_bet_used} limit={usage?.daily_bet_limit} symbol={symbol} />
            </div>

            {/* Monthly Card */}
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <span className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Monthly Betting</span>
                <Calendar size={16} className="text-gray-600" />
              </div>
              <div className="text-2xl font-black text-white">
                {symbol}{usage?.monthly_bet_used?.toLocaleString() || '0'}
              </div>
              <ProgressBar used={usage?.monthly_bet_used} limit={usage?.monthly_bet_limit} symbol={symbol} />
            </div>
          </div>

          {/* UPDATE FORM */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
             <div className="p-6 border-b border-gray-800 flex items-center gap-3 bg-black/20">
                <Settings2 size={18} className="text-yellow-500" />
                <h3 className="font-bold text-white uppercase tracking-widest text-[10px]">Threshold Settings</h3>
             </div>
             <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {["daily_deposit_limit", "daily_bet_limit", "monthly_bet_limit"].map((field) => (
                    <div key={field}>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 ml-1">
                            {field.replaceAll("_", " ")}
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">{symbol}</span>
                            <input
                                type="number"
                                disabled={isSelfExcluded || loading}
                                value={form[field]}
                                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                                className="w-full bg-black border border-gray-700 rounded-xl py-2.5 pl-8 pr-4 text-white focus:border-yellow-500 outline-none transition-all disabled:opacity-30 font-mono text-sm"
                                placeholder="Not set"
                            />
                        </div>
                    </div>
                ))}
             </div>
             <div className="p-4 bg-black/40 flex justify-end">
                <button
                    onClick={saveLimits}
                    disabled={loading || isSelfExcluded}
                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-8 py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-30 flex items-center gap-2 shadow-lg shadow-yellow-500/10 text-xs uppercase"
                >
                    {loading ? "Saving..." : <><CheckCircle2 size={16}/> Save Limits</>}
                </button>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SELF EXCLUSION */}
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={18} className="text-red-500" />
                <h2 className="text-lg font-bold text-white uppercase tracking-widest text-[10px]">Danger Zone</h2>
            </div>

            <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-3xl flex flex-col items-center text-center shadow-2xl">
                <div className="bg-red-500/20 p-4 rounded-full mb-4">
                    <LogOut size={32} className="text-red-500" />
                </div>
                <h3 className="text-xl font-black text-white mb-2 uppercase italic tracking-tighter">Self-Exclusion</h3>
                <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                    Take a permanent break from gambling. Once activated, your account will be locked until the chosen date. 
                    <strong> This action cannot be undone.</strong>
                </p>
                
                <div className="w-full space-y-4">
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="date"
                            disabled={loading || isSelfExcluded}
                            value={excludeDate}
                            onChange={(e) => setExcludeDate(e.target.value)}
                            style={{ colorScheme: 'dark' }}
                            className="w-full bg-black border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-red-500 outline-none transition-all disabled:opacity-20"
                        />
                    </div>
                    <button
                        onClick={handleSelfExclude}
                        disabled={loading || !excludeDate || isSelfExcluded}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl transition-all active:scale-95 disabled:opacity-10 shadow-xl shadow-red-900/20 uppercase tracking-widest text-[10px]"
                    >
                        {loading ? "Processing..." : "Confirm Self-Exclusion"}
                    </button>
                </div>
            </div>

            {/* Support Box */}
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl">
                <h4 className="text-white font-bold text-xs mb-2 uppercase tracking-wider">Need assistance?</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed mb-4">
                    If you're concerned about your gambling habits, our support team is available 24/7 to help you set stricter limits.
                </p>
                <button className="w-full border border-gray-700 hover:bg-gray-800 text-gray-300 py-2 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all">
                    Contact Support
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsibleGaming;