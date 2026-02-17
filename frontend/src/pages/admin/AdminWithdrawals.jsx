import { useEffect, useState, useCallback, useMemo } from "react";
import { getAdminWithdrawals, processWithdrawalAction } from "../../api/adminWithdrawals.api";
import { 
  ArrowDownCircle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Search, 
  Filter, 
  Calendar, 
  FilterX, 
  PlayCircle,
  Clock,
  User,
  Hash
} from "lucide-react";

const AdminWithdrawals = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Modal States
  const [selectedReq, setSelectedReq] = useState(null);
  const [actionType, setActionType] = useState(""); // "complete" or "reject"
  const [inputValue, setInputValue] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminWithdrawals();
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Client-side Filtering Logic
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesEmail = req.player_email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || req.status === statusFilter;
      const reqDate = new Date(req.requested_at).toISOString().split("T")[0];
      const matchesDate = !dateFilter || reqDate === dateFilter;
      return matchesEmail && matchesStatus && matchesDate;
    });
  }, [requests, searchTerm, statusFilter, dateFilter]);

  const handleAction = async (id, action, extra = {}) => {
    try {
      await processWithdrawalAction(id, action, extra);
      setSelectedReq(null);
      setInputValue("");
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || "Action failed");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setDateFilter("");
  };

  if (loading && requests.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <RefreshCw className="animate-spin mb-2" size={32} />
      <p className="font-bold">Loading withdrawal queue...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <ArrowDownCircle className="text-yellow-500" size={28} />
          <h1 className="text-2xl font-bold text-white">Withdrawal Management</h1>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors cursor-pointer">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* FILTERS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-900 p-4 rounded-xl border border-gray-800 shadow-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            placeholder="Search Player Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-yellow-500 outline-none transition-all"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 pointer-events-none" size={18} />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-yellow-500 outline-none appearance-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="requested">Requested</option>
            <option value="approved">Approved</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 pointer-events-none" size={18} />
          <input 
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ colorScheme: 'dark' }}
            className="w-full bg-black border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-yellow-500 outline-none"
          />
        </div>

        <button 
          onClick={clearFilters}
          className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded-lg transition-all border border-transparent hover:border-red-500/30 font-bold text-xs uppercase"
        >
          <FilterX size={16} /> Clear Filters
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-black/50 text-xs font-bold text-gray-400 border-b border-gray-800 uppercase tracking-wider">
                <th className="px-6 py-4">Player</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 hidden md:table-cell text-center">Request Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredRequests.map((req) => (
                <tr key={req.withdrawal_id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <User size={14} className="text-gray-500" /> {req.player_email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-yellow-500 font-mono">
                      {req.currency_symbol}{req.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase ${
                      req.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                      req.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                      'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell text-center">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 font-bold">
                      <Clock size={12} /> {new Date(req.requested_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {req.status === "requested" && (
                        <>
                          <button onClick={() => handleAction(req.withdrawal_id, "approve")} className="p-2 bg-gray-800 hover:bg-green-600 text-green-500 hover:text-white rounded-lg transition-all cursor-pointer" title="Approve"><CheckCircle2 size={18}/></button>
                          <button onClick={() => { setSelectedReq(req); setActionType("reject"); }} className="p-2 bg-gray-800 hover:bg-red-600 text-red-500 hover:text-white rounded-lg transition-all cursor-pointer" title="Reject"><XCircle size={18}/></button>
                        </>
                      )}
                      {req.status === "approved" && (
                        <button onClick={() => handleAction(req.withdrawal_id, "process")} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1">
                          <PlayCircle size={14}/> Process
                        </button>
                      )}
                      {req.status === "processing" && (
                        <button onClick={() => { setSelectedReq(req); setActionType("complete"); }} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer">
                          Complete Payout
                        </button>
                      )}
                      {req.gateway_reference && (
                         <div className="text-[10px] font-mono text-gray-600 flex items-center gap-1">
                           <Hash size={10} /> {req.gateway_reference.slice(0, 12)}...
                         </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && !loading && (
          <div className="p-20 text-center">
            <FilterX className="mx-auto mb-4 opacity-20 text-gray-400" size={48} />
            <p className="text-gray-500 font-bold">No matching withdrawal requests</p>
          </div>
        )}
      </div>

      {/* ACTION MODAL */}
      {selectedReq && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2">
              {actionType === "complete" ? "Finalize Payout" : "Reject Request"}
            </h2>
            <div className="bg-black/30 p-4 rounded-xl mb-6 border border-gray-800">
               <p className="text-xs text-gray-500 font-bold uppercase mb-1">Player Email</p>
               <p className="text-sm text-white font-bold mb-3">{selectedReq.player_email}</p>
               <p className="text-xs text-gray-500 font-bold uppercase mb-1">Total Amount</p>
               <p className="text-xl text-yellow-500 font-bold font-mono">{selectedReq.currency_symbol}{selectedReq.amount.toLocaleString()}</p>
            </div>

            <label className="block text-xs font-bold text-gray-500 uppercase ml-1 mb-2">
              {actionType === "complete" ? "Gateway Reference (e.g. UPI ID / Bank Ref)" : "Reason for Rejection"}
            </label>
            <textarea 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-black border border-gray-800 focus:border-yellow-500 rounded-xl p-4 text-sm text-white outline-none transition-all h-32 resize-none"
              placeholder={actionType === "complete" ? "Enter the transaction ID from your payment provider..." : "Explain why this request was declined..."}
            />

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setSelectedReq(null); setInputValue(""); }} className="flex-1 bg-gray-800 py-3 rounded-xl font-bold text-white cursor-pointer hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button 
                onClick={() => handleAction(
                  selectedReq.withdrawal_id, 
                  actionType, 
                  actionType === "complete" ? { gateway_reference: inputValue } : { rejection_reason: inputValue }
                )}
                disabled={!inputValue}
                className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all cursor-pointer ${
                  actionType === "complete" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                } disabled:opacity-30`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWithdrawals;