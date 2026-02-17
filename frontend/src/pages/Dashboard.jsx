import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getMySessions } from "../api/history.api"; 
import { Play, Shield, TrendingUp, ChevronRight, Gamepad2, Clock } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [recentSessions, setRecentSessions] = useState([]); 
  const [loading, setLoading] = useState(true); 

  //  Fetch data on mount
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await getMySessions();
        // Take the 3 most recent sessions
        setRecentSessions(res.data.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch dashboard activity", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  if (!user) return null;

  const kycStatusColor = {
    verified: "bg-green-500/20 text-green-400 border-green-500/50",
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    rejected: "bg-red-500/20 text-red-400 border-red-500/50",
    not_submitted: "bg-gray-700/50 text-gray-400 border-gray-600",
  }[user.kyc_status] || "bg-gray-800 text-gray-400";

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-r from-yellow-600 to-yellow-800 p-8 overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            Ready to win, {user.first_name}?
          </h1>
          <p className="text-yellow-100 mb-6 max-w-lg">
            Explore our new high-RTP games or check your latest session history.
          </p>
          <button 
            onClick={() => navigate("/games")}
            className="bg-white text-yellow-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-100 transition shadow-lg cursor-pointer"
          >
            <Play fill="currentColor" size={18} /> Play Now
          </button>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-yellow-400 rounded-full blur-[100px] opacity-30"></div>
      </div>

      {/* Quick Stats / Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* KYC Status Card */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex items-center justify-between hover:border-gray-700 transition">
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">Identity Verification</p>
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${kycStatusColor}`}>
              {user.kyc_status.replace("_", " ").toUpperCase()}
            </div>
          </div>
          <button onClick={() => navigate("/kyc")} className="p-3 bg-gray-800 rounded-full hover:bg-gray-700 transition cursor-pointer">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Responsible Gaming Card */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex items-center justify-between hover:border-gray-700 transition">
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">Responsible Gaming</p>
            <p className="text-white font-bold text-sm flex items-center gap-2">
              <Shield size={14} className="text-green-400" />
              Limits & Exclusion
            </p>
          </div>
          <button onClick={() => navigate("/responsible-gaming")} className="p-3 bg-gray-800 rounded-full hover:bg-gray-700 transition cursor-pointer">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Recent Activity Teaser (Functional) */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp size={20} className="text-yellow-500" /> Recent Activity
          </h3>
          <button onClick={() => navigate("/history")} className="text-sm text-yellow-400 hover:underline cursor-pointer">View All</button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500 animate-pulse uppercase tracking-widest text-xs">Loading activity...</div>
        ) : recentSessions.length > 0 ? (
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <div key={session.session_id} className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-gray-800">
                <div className="flex items-center gap-4">
                  {/* Yellow Icons */}
                  <Gamepad2 size={20} className="text-yellow-500" />
                  <div>
                    <p className="text-sm font-bold text-white uppercase tracking-tight">{session.game_name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      <Clock size={10} />
                      {new Date(session.started_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right text-[10px] font-black uppercase px-3 py-1 rounded-full border border-gray-800 text-gray-400">
                  {session.status}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm bg-black/20 rounded-xl border border-gray-800 border-dashed">
            Jump back into the action to see your stats here!
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;