import { useState } from "react";
import { rejectRequest } from "../../api/superRequests.api";
import { XCircle, AlertTriangle, FileWarning, X } from "lucide-react";

const RejectRequestModal = ({ request, onClose, onSuccess }) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    if (!reason.trim()) return alert("Please provide a reason.");
    
    try {
      setLoading(true);
      await rejectRequest(request.request_id, reason);
      onSuccess();
      onClose();
    } catch (err) {
      alert("Failed to reject request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-red-500/30 rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Background Accent */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/10 p-2.5 rounded-xl text-red-500">
              <FileWarning size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Reject Request</h2>
              <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Final Decision</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 relative z-10">
          <div className="bg-black/30 p-4 rounded-xl border border-gray-800">
            <p className="text-xs text-gray-400 leading-relaxed">
              You are about to deny access for <span className="text-white font-bold">{request.tenant_name}</span> to integrate with <span className="text-white font-bold">{request.provider_name}</span>.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 ml-1">
              <AlertTriangle size={12} className="text-red-500" /> Rejection Reason (Required)
            </label>
            <textarea 
              className="w-full bg-black border border-gray-800 rounded-xl p-4 text-sm text-white focus:border-red-500 outline-none transition-all h-32 resize-none placeholder:text-gray-700"
              placeholder="Explain why this request is being declined..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={handleReject} 
              disabled={loading || !reason.trim()}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-red-900/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? "Processing..." : <><XCircle size={16} /> Confirm Rejection</>}
            </button>
            
            <button 
              onClick={onClose} 
              className="w-full py-2 text-gray-500 hover:text-white font-bold text-[10px] uppercase tracking-widest transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RejectRequestModal;