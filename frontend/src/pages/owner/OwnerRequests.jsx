import { useEffect, useState, useCallback } from "react";
import { getPendingRequests } from "../../api/superRequests.api";
import ApproveRequestModal from "./ApproveRequestModal";
import RejectRequestModal from "./RejectRequestModal";
import { 
  Bell, 
  RefreshCw, 
  Building2, 
  Cpu, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Inbox
} from "lucide-react";

const OwnerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectingRequest, setRejectingRequest] = useState(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPendingRequests();
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  if (loading && requests.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <RefreshCw className="animate-spin mb-2" size={32} />
      <p className="text-[10px] font-black uppercase tracking-[4px]">Fetching Requests...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500">
            <Bell size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Access Requests</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Pending Provider Integrations</p>
          </div>
        </div>
        <button 
          onClick={loadRequests} 
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors cursor-pointer"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-black/50 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800">
                <th className="px-6 py-4">Requesting Tenant</th>
                <th className="px-6 py-4">Provider Requested</th>
                <th className="px-6 py-4">Proposed Start</th>
                <th className="px-6 py-4">Submitted On</th>
                <th className="px-6 py-4 text-right">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {requests.map((req) => (
                <tr key={req.request_id} className="hover:bg-yellow-500/[0.01] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-800 rounded-lg text-blue-400 group-hover:text-white transition-colors">
                            <Building2 size={16} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">{req.tenant_name || "Unknown Tenant"}</p>
                            <p className="text-[10px] text-gray-600 font-mono">ID: {req.tenant_id.slice(0,8)}...</p>
                        </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
                        <Cpu size={14} className="text-yellow-600" /> 
                        {req.provider_name || `Provider #${req.provider_id}`}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar size={14} /> 
                        {req.proposed_start_date || <span className="italic text-gray-600">ASAP</span>}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        <Clock size={12} />
                        {new Date(req.requested_at).toLocaleDateString()}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="flex items-center gap-1.5 bg-green-600/10 hover:bg-green-600 text-green-500 hover:text-white border border-green-600/20 px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer"
                      >
                        <CheckCircle2 size={14} /> Approve
                      </button>
                      <button
                        onClick={() => setRejectingRequest(req)}
                        className="flex items-center gap-1.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {requests.length === 0 && !loading && (
          <div className="p-20 text-center flex flex-col items-center">
            <Inbox className="text-gray-800 mb-4" size={48} />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No pending requests at this time</p>
          </div>
        )}
      </div>

      {/* MODALS */}
      {selectedRequest && (
        <ApproveRequestModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onSuccess={loadRequests}
        />
      )}
      {rejectingRequest && (
        <RejectRequestModal
          request={rejectingRequest}
          onClose={() => setRejectingRequest(null)}
          onSuccess={loadRequests}
        />
      )}
    </div>
  );
};

export default OwnerRequests;