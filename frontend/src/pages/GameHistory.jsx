import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getMySessions, getSessionRounds } from "../api/history.api";
import { 
  History, 
  Gamepad2, 
  ChevronDown, 
  Target, 
  Wallet, 
  Trophy, 
  CheckCircle2, 
  Activity, 
  Calendar,
  Clock,
  CircleDashed
} from "lucide-react";

const GameHistory = () => {
  const { user } = useContext(AuthContext);
  const [sessions, setSessions] = useState([]);
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const symbol = user?.currency_symbol || "₹";

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const res = await getMySessions();
        setSessions(res.data);
      } catch (err) {
        console.error("❌ Failed to load sessions", err);
      } finally {
        setLoading(false);
      }
    };
    loadSessions();
  }, []);

  const toggleSession = async (session) => {
    if (expandedSessionId === session.session_id) {
      setExpandedSessionId(null);
      setRounds([]);
      return;
    }

    setExpandedSessionId(session.session_id);
    setDetailsLoading(true);

    try {
      const roundsRes = await getSessionRounds(session.session_id);
      setRounds(roundsRes.data);
    } catch (err) {
      console.error("❌ Failed to load session details", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <CircleDashed className="text-yellow-500 animate-spin" size={40} />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Fetching Archives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-gray-800 pb-6">
        <div className="bg-yellow-500/20 p-2 rounded-xl">
          <History className="text-yellow-500" size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Games Activity Log</h1>
          <p className="text-sm text-gray-500 font-medium uppercase tracking-widest">Track your previous sessions</p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-gray-900 border border-dashed border-gray-800 rounded-[2rem] p-20 text-center">
          <Gamepad2 size={48} className="mx-auto text-gray-800 mb-4" />
          <p className="text-gray-500 font-medium italic">No gaming activity recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const isOpen = expandedSessionId === session.session_id;

            return (
              <div
                key={session.session_id}
                className={`bg-gray-900 border transition-all duration-300 rounded-[1.5rem] overflow-hidden ${
                  isOpen ? "border-yellow-500/50 shadow-2xl" : "border-gray-800 hover:border-gray-700"
                }`}
              >
                {/* SESSION HEADER */}
                <div
                  onClick={() => toggleSession(session)}
                  className="p-5 cursor-pointer hover:bg-white/[0.02] flex justify-between items-center group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${isOpen ? "bg-yellow-500 text-black" : "bg-gray-800 text-gray-400 group-hover:text-white"}`}>
                      <Gamepad2 size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-white font-bold text-lg">{session.game_name}</span>
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                          session.status === 'active' 
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20" 
                            : "bg-gray-800 text-gray-500 border-gray-700"
                        }`}>
                          {session.status === 'active' ? <Activity size={10} /> : <CheckCircle2 size={10} />}
                          {session.status}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase">
                          <Calendar size={12} /> {new Date(session.started_at).toLocaleDateString()}
                        </div>
                        {/* Time display removed as requested */}
                      </div>
                    </div>
                  </div>

                  <ChevronDown 
                    className={`text-gray-600 transition-transform duration-300 ${isOpen ? "rotate-180 text-yellow-500" : ""}`} 
                    size={24} 
                  />
                </div>

                {/* SESSION DETAILS */}
                {isOpen && (
                  <div className="bg-black/40 border-t border-gray-800 p-6 animate-in slide-in-from-top-2 duration-300">
                    {detailsLoading ? (
                      <div className="flex items-center justify-center py-10 gap-3 text-gray-500">
                        <CircleDashed className="animate-spin" size={18} />
                        <span className="text-xs font-bold uppercase tracking-widest">Loading round data...</span>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                           <Target size={16} className="text-yellow-500" />
                           <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[2px]">Round Analysis</h3>
                        </div>

                        {rounds.length === 0 ? (
                          <div className="text-center py-6 border border-dashed border-gray-800 rounded-2xl">
                             <p className="text-xs text-gray-600 italic">No rounds recorded for this specific session.</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-gray-800">
                                  <th className="pb-3 px-2">Round</th>
                                  <th className="pb-3">Outcome</th>
                                  <th className="pb-3 text-right">Stake</th>
                                  <th className="pb-3 text-right">Return</th>
                                  <th className="pb-3 text-right">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-800/50">
                                {rounds.map((round) => (
                                  <tr key={round.round_id} className="group hover:bg-white/[0.01] transition-colors">
                                    <td className="py-4 px-2 text-xs font-mono text-gray-500 italic">
                                      #{round.round_number}
                                    </td>
                                    <td className="py-4">
                                      <span className="text-sm font-bold text-gray-200">{round.outcome}</span>
                                    </td>
                                    <td className="py-4 text-right">
                                      <div className="flex items-center justify-end gap-1 text-gray-400 font-mono text-xs">
                                        <Wallet size={12} /> {symbol}{round.bet_amount.toFixed(2)}
                                      </div>
                                    </td>
                                    <td className="py-4 text-right">
                                      <div className={`flex items-center justify-end gap-1 font-mono text-sm font-black ${
                                        round.win_amount > 0 ? "text-green-400" : "text-gray-600"
                                      }`}>
                                        <Trophy size={14} className={round.win_amount > 0 ? "opacity-100" : "opacity-0"} />
                                        {symbol}{round.win_amount.toFixed(2)}
                                      </div>
                                    </td>
                                    <td className="py-4 text-right">
                                      <span className={`inline-block px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter ${
                                        round.win 
                                          ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                                          : "bg-red-500/10 text-red-500 border border-red-500/20"
                                      }`}>
                                        {round.win ? "Win" : "Loss"}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GameHistory;