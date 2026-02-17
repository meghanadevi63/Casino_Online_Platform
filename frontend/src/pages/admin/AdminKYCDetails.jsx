import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchKYCDocument, processKYC } from "../../api/adminKyc.api";
import { 
  ArrowLeft, 
  ShieldCheck, 
  User, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Eye,
  Calendar
} from "lucide-react";

const statusStyle = {
  verified: "bg-green-500/10 text-green-500 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  rejected: "bg-red-500/10 text-red-500 border-red-500/20",
};

const AdminKYCDetails = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();

  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const loadKYC = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchKYCDocument(documentId);
      setKyc(res.data);
      setRejectReason(res.data.rejection_reason ?? "");
    } catch (err) {
      console.error("Failed to load KYC document", err);
      setError("Failed to load KYC document details.");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    loadKYC();
  }, [loadKYC]);

  const handleAction = async (action) => {
    if (action === "reject" && !rejectReason.trim()) {
      alert("Rejection reason is required");
      return;
    }

    try {
      setProcessing(true);
      await processKYC(documentId, {
        action,
        rejection_reason: action === "reject" ? rejectReason : undefined,
      });
      navigate("/admin/kyc");
    } catch (err) {
      alert(err?.response?.data?.detail || "Action failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <Clock className="animate-spin mb-2" size={32} />
      <p className="font-bold">Loading document details...</p>
    </div>
  );

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-10 text-center">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <p className="text-white font-bold">{error}</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-yellow-500 hover:underline font-bold cursor-pointer">
          Go Back
        </button>
      </div>
    );
  }

  if (!kyc) return null;

  const isProcessed = kyc.verification_status !== "pending";

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* Navigation */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold cursor-pointer"
      >
        <ArrowLeft size={20} /> Back to Queue
      </button>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header Bar */}
        <div className="p-6 border-b border-gray-800 bg-black/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-yellow-500" size={28} />
            <h1 className="text-2xl font-bold text-white  tracking-tight">KYC Review Station</h1>
          </div>
          <span className={`px-4 py-1 rounded-full text-xs font-bold border uppercase ${statusStyle[kyc.verification_status]}`}>
            {kyc.verification_status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Info Column */}
          <div className="p-6 sm:p-8 space-y-8 border-r border-gray-800">
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-2">Applicant Information</h2>
              <div className="grid grid-cols-1 gap-6">
                <InfoItem icon={<User size={18}/>} label="Full Email" value={kyc.email} />
                <InfoItem icon={<FileText size={18}/>} label="Document Type" value={kyc.document_type} />
                <InfoItem icon={<ShieldCheck size={18}/>} label="Reference Number" value={kyc.document_number || "Not Specified"} />
                <InfoItem icon={<Calendar size={18}/>} label="Uploaded On" value={new Date(kyc.uploaded_at).toLocaleString()} />
              </div>
            </div>

            {/* Rejection Reason Display */}
            {kyc.verification_status === "rejected" && (
              <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-xl">
                <div className="flex items-center gap-2 text-red-500 mb-2">
                  <XCircle size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Rejection Note</span>
                </div>
                <p className="text-sm text-gray-300">{kyc.rejection_reason}</p>
              </div>
            )}

            {/* Action Area */}
            {!isProcessed ? (
              <div className="space-y-4 pt-6 border-t border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={16} className="text-yellow-500" />
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Decision Notes</label>
                </div>
                <textarea
                  placeholder="Provide a reason if rejecting this document..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-black border border-gray-800 focus:border-yellow-500 rounded-xl p-4 text-sm text-white outline-none transition-all h-32 resize-none"
                />

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    disabled={processing}
                    onClick={() => handleAction("approve")}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-all cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={18} /> Approve
                  </button>

                  <button
                    disabled={processing}
                    onClick={() => handleAction("reject")}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition-all cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} /> Reject
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-6 border-t border-gray-800">
                <div className="bg-gray-800/50 p-4 rounded-xl flex items-center justify-center gap-3">
                  <CheckCircle2 size={18} className="text-gray-500" />
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest text-center">Processing Complete</p>
                </div>
              </div>
            )}
          </div>

          {/* Document Preview Column */}
          <div className="p-6 sm:p-8 bg-black/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                <Eye size={14} /> Document Asset
              </div>
              <a 
                href={kyc.file_url} 
                target="_blank" 
                rel="noreferrer" 
                className="text-[10px] text-yellow-500 font-bold hover:underline uppercase flex items-center gap-1"
              >
                Open Original <ExternalLink size={10} />
              </a>
            </div>
            
            <div className="bg-black border border-gray-800 rounded-xl overflow-hidden h-[400px] sm:h-[500px] lg:h-[600px] shadow-inner relative group">
              <iframe
                src={kyc.file_url}
                title="KYC Document Preview"
                className="w-full h-full border-none"
              />
              {/* Optional overlay for better UX */}
              <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-xl shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]"></div>
            </div>
            
            <div className="mt-4 flex items-start gap-2 bg-yellow-500/5 p-3 rounded-xl border border-yellow-500/10">
              <AlertCircle size={14} className="text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-gray-500 font-medium uppercase leading-relaxed">
                Verify the text on the document matches the applicant's account name and data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// UI Components
const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-4">
    <div className="p-2.5 bg-gray-800 rounded-xl text-yellow-500">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
  </div>
);

const ExternalLink = ({ size, className }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15 3 21 3 21 9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
);

export default AdminKYCDetails;