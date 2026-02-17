import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchAdminPlayerSummary, updateAdminPlayerStatus } from "../../api/adminPlayers.api";
import { fetchKYCHistory } from "../../api/adminKyc.api";
import { ArrowLeft, ShieldCheck, Trophy, Wallet, Target, Clock, ExternalLink, UserX } from "lucide-react";

const AdminPlayerDetails = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [kycHistory, setKycHistory] = useState([]);
  
  // Modal State
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  const loadSummary = useCallback(async () => {
    try {
      const res = await fetchAdminPlayerSummary(playerId);
      setPlayer(res.data);
      const kycRes = await fetchKYCHistory(playerId);
      setKycHistory(kycRes.data);
    } catch (err) {
      console.error("Failed to load player summary", err);
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const confirmSuspend = async () => {
    try {
      await updateAdminPlayerStatus(playerId, "suspended");
      setShowSuspendModal(false);
      loadSummary();
    } catch (err) {
      alert("Failed to suspend player");
    }
  };

  const formatMoney = (val) => {
    return `${player.currency_symbol} ${Number(val).toLocaleString(undefined, {
      minimumFractionDigits: player.decimal_places,
    })}`;
  };

  if (loading) return <div className="text-gray-500 p-20 text-center">Loading player details...</div>;
  if (!player) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* Navigation & Action Header */}
      <div className="flex justify-between items-center border-b border-gray-800 pb-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold cursor-pointer"
        >
          <ArrowLeft size={20} /> Back
        </button>
        
        {player.status === "active" ? (
            <button
                onClick={() => setShowSuspendModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold cursor-pointer"
            >
                Suspend Account
            </button>
        ) : (
            <div className="bg-gray-800 text-gray-500 px-4 py-2 rounded-lg font-bold border border-gray-700">
                Status: {player.status.charAt(0).toUpperCase() + player.status.slice(1)}
            </div>
        )}
      </div>

      {/* Main Profile Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-2xl font-bold text-yellow-500 border border-gray-700">
            {player.first_name?.[0]}{player.last_name?.[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{player.first_name} {player.last_name}</h1>
            <p className="text-sm text-gray-500">{player.email} • {player.country_code}</p>
          </div>
        </div>
        <div className={`px-4 py-1 rounded-full text-xs font-bold border ${
          player.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
        }`}>
          {player.status.toUpperCase()}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatBox label="Wallet Balance" value={formatMoney(player.wallet_balance)} icon={<Wallet size={20}/>} color="text-yellow-500" />
        <StatBox label="Total Winnings" value={formatMoney(player.total_win_amount)} icon={<Trophy size={20}/>} color="text-green-500" />
        <StatBox label="Net GGR" value={formatMoney(player.ggr)} icon={<Target size={20}/>} color="text-red-500" />
      </div>

      {/* Limits & Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-md">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">Responsible Gaming</h2>
          <div className="space-y-4">
            <DataField label="Daily Bet Limit" value={player.daily_bet_limit ? formatMoney(player.daily_bet_limit) : "No Limit"} />
            <DataField label="Monthly Bet Limit" value={player.monthly_bet_limit ? formatMoney(player.monthly_bet_limit) : "No Limit"} />
            <DataField label="Self Exclusion" value={player.self_exclusion_until || "None"} />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-md">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">System Activity</h2>
          <div className="space-y-4">
            <DataField label="Total Sessions" value={player.total_sessions} />
            <DataField label="Total Rounds" value={player.total_rounds} />
            <DataField label="Registration Date" value={new Date(player.created_at).toLocaleDateString()} />
          </div>
        </div>
      </div>

      {/* KYC Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-md">
        <div className="p-6 border-b border-gray-800">
            <h2 className="text-lg font-bold flex items-center gap-2">KYC Document History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/50 text-xs font-bold text-gray-500 border-b border-gray-800">
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Verification</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">File</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {kycHistory.map((k) => (
                <tr key={k.document_id} className="text-sm">
                  <td className="px-6 py-4 font-bold text-gray-300">{k.document_type}</td>
                  <td className={`px-6 py-4 font-bold ${k.verification_status === 'verified' ? 'text-green-500' : 'text-yellow-500'}`}>
                    {k.verification_status}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{new Date(k.uploaded_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <a href={k.file_url} target="_blank" rel="noreferrer" className="text-yellow-500 hover:underline inline-flex items-center gap-1 font-bold">
                      View <ExternalLink size={14} />
                    </a>
                  </td>
                </tr>
              ))}
              {kycHistory.length === 0 && (
                <tr><td colSpan="4" className="p-10 text-center text-gray-600">No documents uploaded</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SUSPEND CONFIRMATION MODAL */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-gray-900 border border-gray-700 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="bg-red-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserX size={32} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white text-center mb-2">Suspend Player</h2>
            <p className="text-gray-400 text-center text-sm mb-6">
              Are you sure you want to suspend <span className="text-white font-bold">{player.first_name} {player.last_name}</span>? This will restrict their access to games.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowSuspendModal(false)} 
                className="flex-1 bg-gray-800 py-2 rounded-lg font-bold text-white cursor-pointer hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmSuspend} 
                className="flex-1 bg-red-600 py-2 rounded-lg font-bold text-white cursor-pointer hover:bg-red-700 transition-colors"
              >
                Suspend
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Internal Helpers
const StatBox = ({ label, value, icon, color }) => (
  <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
    <div className={`p-3 bg-black/40 rounded-xl ${color}`}>{icon}</div>
    <div>
      <p className="text-xs text-gray-500 font-bold uppercase">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  </div>
);

const DataField = ({ label, value }) => (
  <div className="flex justify-between border-b border-gray-800 pb-2">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-bold text-white">{value}</span>
  </div>
);

export default AdminPlayerDetails;