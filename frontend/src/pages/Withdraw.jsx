import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { withdrawRequest, getMyWithdrawals, getWalletsByPlayerId } from "../api/wallet.api";
import { 
  ArrowDownCircle, 
  Lock, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Withdraw = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [amount, setAmount] = useState("");
  const [cashBalance, setCashBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const isVerified = user?.kyc_status === "verified";
  const symbol = user?.currency_symbol || "₹";

  const loadData = async () => {
    if (!user) return;
    setFetching(true);
    try {
      const [walletRes, historyRes] = await Promise.all([
        getWalletsByPlayerId(user.user_id),
        getMyWithdrawals()
      ]);
      const cash = walletRes.data.find(w => w.wallet_type === "CASH");
      setCashBalance(cash?.balance || 0);
      setHistory(historyRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;
    if (amount > cashBalance) {
        alert("Insufficient balance");
        return;
    }

    setLoading(true);
    try {
      await withdrawRequest(Number(amount));
      setAmount("");
      // Refresh balance and history
      window.dispatchEvent(new CustomEvent("balanceUpdated"));
      await loadData();
      alert("Withdrawal request submitted successfully!");
    } catch (err) {
      alert(err.response?.data?.detail || "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  // 1. LOCKED UI (If not verified)
  if (!isVerified) {
    return (
      <div className="max-w-md mx-auto mt-10 text-center space-y-6">
        <div className="bg-red-500/10 border border-red-500/20 p-10 rounded-3xl flex flex-col items-center">
          <div className="bg-red-500/20 p-4 rounded-full mb-4">
            <Lock size={48} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase italic">Access Denied</h2>
          <p className="text-gray-400 mt-2 leading-relaxed">
            Your KYC status is currently <b>{user?.kyc_status?.replace('_', ' ')}</b>. 
            Withdrawals are only permitted for <b>Verified</b> accounts.
          </p>
          <button 
            onClick={() => navigate("/kyc")}
            className="mt-8 bg-yellow-500 hover:bg-yellow-400 text-black font-black px-8 py-3 rounded-xl transition-all active:scale-95"
          >
            Complete KYC Now
          </button>
        </div>
      </div>
    );
  }

  // 2. ACTIVE UI
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-3">
        <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500">
          <ArrowDownCircle size={28} />
        </div>
        <h1 className="text-2xl font-bold">Withdraw Winnings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Request Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl">
            <div className="mb-6">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Available to Payout</span>
              <p className="text-3xl font-black text-white font-mono">{symbol}{cashBalance.toLocaleString()}</p>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-6">
              <div className="relative group">
                <label className="text-[10px] font-bold text-gray-500 uppercase absolute -top-2 left-3 bg-gray-900 px-1 z-10">Request Amount</label>
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-600 group-focus-within:text-yellow-500">{symbol}</span>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-black border border-gray-800 focus:border-yellow-500 rounded-2xl py-4 pl-10 pr-4 text-xl font-mono outline-none transition-all"
                  placeholder="0.00"
                />
              </div>

              <button 
                disabled={loading || !amount || amount <= 0}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-30"
              >
                {loading ? "Processing..." : "Request Payout"}
              </button>
            </form>

            <div className="mt-6 flex items-start gap-3 bg-yellow-500/5 p-4 rounded-xl border border-yellow-500/10">
                <ShieldAlert size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-400 leading-relaxed uppercase font-bold">
                    Requests are processed within 24 hours. Bank transfer times may vary by region.
                </p>
            </div>
          </div>
        </div>

        {/* Right: Status Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center px-2">
             <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Payout History</h2>
             <button onClick={loadData} className="text-gray-500 hover:text-white transition"><RefreshCw size={14} className={fetching ? 'animate-spin' : ''}/></button>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/50 text-[10px] font-bold text-gray-500 uppercase border-b border-gray-800">
                  <th className="px-6 py-4">Submitted</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {history.map((w) => (
                  <tr key={w.withdrawal_id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4 text-xs text-gray-300">
                      {new Date(w.requested_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-white">
                      {w.currency_symbol}{w.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={w.status} />
                    </td>
                    <td className="px-6 py-4">
                       {w.status === 'rejected' ? (
                         <div className="flex items-center gap-1 text-[10px] text-red-400 group relative">
                            <AlertCircle size={12} /> Reason
                            <div className="absolute bottom-full mb-2 left-0 hidden group-hover:block bg-black border border-red-500/50 p-2 rounded text-white whitespace-normal w-40 z-50">
                                {w.rejection_reason}
                            </div>
                         </div>
                       ) : (
                         <span className="text-[10px] text-gray-600 font-mono italic">#{w.withdrawal_id.slice(0, 8)}</span>
                       )}
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-20 text-gray-600 italic text-sm">No payout requests found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component for Status Styling
const StatusBadge = ({ status }) => {
    const config = {
        requested: { icon: <Clock size={10}/>, style: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
        processing: { icon: <RefreshCw size={10} className="animate-spin" />, style: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
        completed: { icon: <CheckCircle2 size={10}/>, style: "bg-green-500/10 text-green-500 border-green-500/20" },
        rejected: { icon: <XCircle size={10}/>, style: "bg-red-500/10 text-red-500 border-red-500/20" },
        kyc_pending: { icon: <Lock size={10}/>, style: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
    }[status] || { icon: null, style: "bg-gray-800 text-gray-400" };

    return (
        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-tighter ${config.style}`}>
            {config.icon} {status.replace('_', ' ')}
        </span>
    );
};

export default Withdraw;