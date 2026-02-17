import { useEffect, useState, useCallback } from "react";
import { getMyRequests } from "../../api/adminMarketplace.api";
import { 
  Inbox, 
  RefreshCw, 
  Building2, 
  Calendar, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  XCircle,
  SearchX
} from "lucide-react";

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyRequests();
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to load requests", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-green-500/10 text-green-500 border border-green-500/20">
            <CheckCircle2 size={12} /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-red-500/10 text-red-500 border border-red-500/20">
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
            <Clock size={12} /> Pending
          </span>
        );
    }
  };

  if (loading && requests.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <RefreshCw className="animate-spin mb-2" size={32} />
      <p className="font-bold">Loading request history...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <Inbox className="text-yellow-500" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-white">Tenant - Provider Requests</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Track provider access applications</p>
          </div>
        </div>
        <button 
          onClick={loadData} 
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors cursor-pointer"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-black/50 text-xs font-bold text-gray-400 border-b border-gray-800 uppercase tracking-widest">
                <th className="px-6 py-4">Provider</th>
                <th className="px-6 py-4">Proposed Start</th>
                <th className="px-6 py-4">Requested Date</th>
                <th className="px-6 py-4">Current Status</th>
                <th className="px-6 py-4">Admin Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {requests.map((req) => (
                <tr key={req.request_id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-yellow-500/10 transition-colors">
                        <Building2 size={18} className="text-blue-400" />
                      </div>
                      <span className="font-bold text-white text-sm">{req.provider_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                      <Calendar size={14} className="text-gray-500" />
                      {req.proposed_start_date || <span className="text-gray-600 font-normal">ASAP</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-500 font-bold uppercase">
                      {new Date(req.requested_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(req.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2 max-w-xs">
                      <MessageSquare size={14} className="text-gray-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {req.admin_notes || "No notes from platform owner yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {requests.length === 0 && !loading && (
          <div className="p-20 text-center">
            <SearchX className="mx-auto mb-4 opacity-20 text-gray-400" size={48} />
            <p className="text-gray-500 font-bold text-sm">No provider requests found</p>
            <p className="text-xs text-gray-600 mt-1 uppercase tracking-widest font-bold">Go to Marketplace to add new providers</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRequests;