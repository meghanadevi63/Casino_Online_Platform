import { useEffect, useState, useCallback, useContext } from "react";
import { 
  getLiveDashboard, 
  getTenantOperatingCountries 
} from "../../api/adminAnalytics.api";
import { AuthContext } from "../../context/AuthContext";
import SearchableSelect from "../../components/SearchableSelect";
import { 
  Zap, TrendingUp, Users, Activity, Trophy, 
  RefreshCw, Globe, Ticket, UserPlus, 
  Map, AlertTriangle, ShieldAlert, Coins, Gamepad2, UserX, Percent
} from "lucide-react";

const AdminLiveDashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");

  // Dynamic Currency Symbol from Backend response (Regional) or User Context (Global)
  const symbol = data?.currency_symbol || user?.currency_symbol || "₹";

  const refreshData = useCallback(async () => {
    try {
      const res = await getLiveDashboard(selectedCountry);
      setData(res.data);
    } catch (err) { 
      console.error("Dashboard sync error:", err); 
    } finally {
      setLoading(false);
    }
  }, [selectedCountry]);

  // Load operating countries and default to the first one if global view is not desired
  useEffect(() => {
    getTenantOperatingCountries().then(res => {
      if (res.data && res.data.length > 0) {
        setCountries(res.data);
        // Set first country as default to avoid "Global" data mismatches
        setSelectedCountry(res.data[0].value);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedCountry) {
        refreshData();
        const timer = setInterval(refreshData, 20000);
        return () => clearInterval(timer);
    }
  }, [refreshData, selectedCountry]);

  if (!data) return <div className="p-10 text-gray-500 font-bold uppercase text-[10px] tracking-[3px]">Initialising Regional Audit...</div>;

  return (
    <div className="space-y-6">
      
      {/* HEADER & REGIONAL FILTER (No Animations) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Zap className="text-yellow-500 fill-yellow-500" size={20} /> Live Pulse
          </h1>
          <p className="text-[9px] text-gray-500 font-black uppercase tracking-[2px] mt-1">
            Regional Audit Scope: {countries.find(c => c.value === selectedCountry)?.label || "Select Region"}
          </p>
        </div>

        <div className="w-full md:w-72">
           <SearchableSelect 
             label="Operational Scope"
             options={countries}
             value={selectedCountry}
             onSelect={(val) => {
                setLoading(true);
                setSelectedCountry(val);
             }}
             placeholder="Select Country"
           />
        </div>
      </div>

      {/* KPI GRID - High Density (No Animations) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard label="Today's GGR" value={`${symbol}${data.kpis.ggr.toLocaleString()}`} color="text-green-400" icon={<TrendingUp size={14}/>} />
        <KpiCard label="Active Sessions" value={data.kpis.active_sessions} color="text-blue-400" icon={<Activity size={14}/>} />
        <KpiCard label="Raffle Sales" value={`${symbol}${data.kpis.total_raffle_sales_today.toLocaleString()}`} color="text-orange-400" icon={<Ticket size={14}/>} />
        <KpiCard label="New Signups" value={data.kpis.new_registrations_today} color="text-purple-400" icon={<UserPlus size={14}/>} />
        <KpiCard label="Total Bets" value={`${symbol}${data.kpis.total_bets.toLocaleString()}`} color="text-white" icon={<Users size={14}/>} />
        <KpiCard label="Actual RTP" value={`${data.kpis.actual_rtp}%`} color="text-yellow-500" icon={<Trophy size={14}/>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT: STRATEGIC PERFORMANCE AUDIT (Assignment Task 3) */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                <h2 className="text-[10px] font-black text-white uppercase tracking-[2px] mb-6 border-b border-gray-800 pb-4">
                    Strategic Performance Audit
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <ReportCard 
                        label="Player LTV" 
                        value={`${symbol}${data.kpis.player_ltv_total.toLocaleString()}`} 
                        desc="Net (Deposits - Payouts)"
                        icon={<Coins size={16} className="text-green-500" />}
                    />
                    <ReportCard 
                        label="Retention Risk" 
                        value={`${data.kpis.inactive_players_30d}`} 
                        desc="Inactive (30 Days)"
                        icon={<UserX size={16} className="text-red-500" />}
                    />
                    <ReportCard 
                        label="Bonus Efficiency" 
                        value={`${data.kpis.bonus_utilization_rate}%`} 
                        desc="Challenge Completion"
                        icon={<Percent size={16} className="text-purple-500" />}
                    />
                </div>

                {/* Regional Game Audit Table */}
                <div className="space-y-4">
                    <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Game-Level RTP & GGR Variance</h3>
                    <div className="bg-black/20 rounded-xl overflow-hidden border border-gray-800">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-black/40 border-b border-gray-800">
                                <tr className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                                    <th className="p-4">Game Title</th>
                                    <th className="p-4 text-center">Active Players</th>
                                    <th className="p-4 text-right">Today's GGR</th>
                                    <th className="p-4 text-right">Actual RTP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {data.top_games.map(game => (
                                    <tr key={game.game_name}>
                                        <td className="p-4 font-bold text-gray-300 uppercase tracking-tighter">{game.game_name}</td>
                                        <td className="p-4 text-center text-white font-mono">{game.unique_players}</td>
                                        <td className={`p-4 text-right font-mono font-bold ${game.ggr_today >= 0 ? 'text-white' : 'text-red-500'}`}>
                                            {game.ggr_today < 0 ? '-' : ''}{symbol}{Math.abs(game.ggr_today).toLocaleString()}
                                        </td>
                                        <td className={`p-4 text-right font-mono font-black ${game.rtp_today > 100 ? 'text-red-500' : 'text-green-500'}`}>
                                            {game.rtp_today}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        {/* RIGHT: COMPLIANCE & SYSTEM LOGS */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl flex flex-col">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-800 pb-4">
                <ShieldAlert size={18} className="text-red-500" />
                <h2 className="text-[10px] font-black text-white uppercase tracking-[2px]">Compliance & Risk</h2>
            </div>
            
            <div className="space-y-4 flex-1">
                {/* Stale Withdrawals Alert (Assignment Task 3g) */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${data.kpis.stale_withdrawals_count > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-black/20 border-gray-800'}`}>
                    <div>
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Stale Payouts (&gt;3 Days)</p>
                        <p className={`text-2xl font-black font-mono ${data.kpis.stale_withdrawals_count > 0 ? 'text-red-500' : 'text-white'}`}>
                            {data.kpis.stale_withdrawals_count}
                        </p>
                    </div>
                    {data.kpis.stale_withdrawals_count > 0 && <AlertTriangle className="text-red-500" size={20} />}
                </div>

                <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-600 uppercase">Gateway Health</span>
                        <span className="text-[9px] font-black text-green-500 uppercase flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Operational
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-600 uppercase">Last Sync (UTC)</span>
                        <span className="text-[10px] font-black text-yellow-500 font-mono">
                            {new Date(data.updated_at).toLocaleTimeString([], { hour12: false })}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-600 uppercase">Sync Rate</span>
                        <span className="text-[10px] font-black text-white font-mono">20s Interval</span>
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-800">
                    <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                        <Map size={24} className="text-blue-500 shrink-0" />
                        <p className="text-[9px] text-gray-500 font-medium leading-relaxed uppercase">
                            Audit complete. Data represents active sessions and finalized bets for the selected regional node.
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// High-density KPI card
const KpiCard = ({ label, value, color, icon }) => (
  <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex flex-col justify-between">
    <div className="flex justify-between items-start mb-2">
      <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{label}</span>
      <div className="text-gray-500">{icon}</div>
    </div>
    <div className={`text-lg font-black ${color} font-mono tracking-tighter truncate`}>{value}</div>
  </div>
);

// Strategic Report Card
const ReportCard = ({ label, value, desc, icon }) => (
    <div className="bg-black/30 border border-gray-800 p-4 rounded-2xl">
        <div className="flex items-center gap-2 mb-3">
            {icon}
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
        </div>
        <p className="text-lg font-black text-white font-mono leading-none">{value}</p>
        <p className="text-[8px] text-gray-600 font-bold uppercase mt-1">{desc}</p>
    </div>
);

export default AdminLiveDashboard;