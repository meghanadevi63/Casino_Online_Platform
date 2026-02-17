import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadKYC } from "../api/kyc.api";
import { AuthContext } from "../context/AuthContext";
import { 
  ShieldCheck, 
  Fingerprint, 
  FileText, 
  UploadCloud, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  XCircle,
  ArrowLeft
} from "lucide-react";

const DOCUMENT_TYPES = ["AADHAAR", "PAN", "PASSPORT", "DRIVING_LICENSE"];
const MAX_FILE_SIZE_MB = 5;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

const PlayerKYC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useContext(AuthContext);

  const [documentType, setDocumentType] = useState("AADHAAR");
  const [documentNumber, setDocumentNumber] = useState("");
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  if (!user) return null;
  if (user.role !== "PLAYER") {
    navigate("/");
    return null;
  }

  const { kyc_status } = user;

  // Configuration for different statuses
  const statusConfig = {
    verified: {
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/50",
      icon: <CheckCircle2 size={48} />,
      label: "Verified",
      desc: "Your identity has been confirmed. You have full access to all features."
    },
    pending: {
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/50",
      icon: <Clock size={48} />,
      label: "Under Review",
      desc: "Our compliance team is currently verifying your documents. This usually takes 24-48 hours."
    },
    rejected: {
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/50",
      icon: <XCircle size={48} />,
      label: "Rejected",
      desc: user.kyc_rejection_reason || "The provided documents did not meet our requirements."
    },
    expired: {
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/50",
      icon: <Clock size={48} />,
      label: "Expired",
      desc: "Your previously verified document has expired. Please provide a current one."
    },
    not_submitted: {
      color: "text-gray-400",
      bg: "bg-gray-800",
      border: "border-gray-700",
      icon: <Fingerprint size={48} />,
      label: "Not Verified",
      desc: "Identity verification is required for withdrawals and high-stakes play."
    }
  }[kyc_status] || {};

  const canUpload = kyc_status === "not_submitted" || kyc_status === "rejected" || kyc_status === "expired";

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) return "Only PDF, JPG, or PNG files are allowed";
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return `File size must be under ${MAX_FILE_SIZE_MB} MB`;
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a document file");
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const formData = new FormData();
    formData.append("document_type", documentType);
    formData.append("document_number", documentNumber);
    formData.append("file", file);

    try {
      setLoading(true);
      setError(null);
      setMessage(null);
      const res = await uploadKYC(formData);
      setMessage(res.data.message);
      setFile(null);
      setDocumentNumber("");
      await refreshUser();
    } catch (err) {
      setError(err?.response?.data?.detail || "KYC upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-gray-800 pb-6">
        <button 
          onClick={() => navigate("/")}
          className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            Identity Verification <ShieldCheck className="text-yellow-500" />
          </h1>
          <p className="text-sm text-gray-500 font-medium uppercase tracking-widest">Compliance & Safety</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Status Card (Left side) */}
        <div className="lg:col-span-2 space-y-4">
          <div className={`p-8 rounded-3xl border ${statusConfig.border} ${statusConfig.bg} flex flex-col items-center text-center shadow-2xl`}>
            <div className={`${statusConfig.color} mb-4`}>
              {statusConfig.icon}
            </div>
            <h2 className={`text-xl font-black uppercase tracking-tighter ${statusConfig.color}`}>
              {statusConfig.label}
            </h2>
            <p className="text-sm text-gray-400 mt-4 leading-relaxed font-medium">
              {statusConfig.desc}
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl">
             <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Why verify?</h3>
             <ul className="space-y-3">
                {[
                  "Unrestricted fast withdrawals",
                  "Higher deposit limits",
                  "Access to exclusive tournaments",
                  "Enhanced account security"
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
                    <CheckCircle2 size={14} className="text-yellow-600 mt-0.5" /> {text}
                  </li>
                ))}
             </ul>
          </div>
        </div>

        {/* Upload Form (Right side) */}
        <div className="lg:col-span-3">
          {canUpload ? (
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <FileText size={20} className="text-yellow-500" /> Submit Document
              </h3>

              {message && (
                <div className="mb-6 bg-green-500/10 border border-green-500/50 p-4 rounded-xl flex items-center gap-3 text-green-400 text-sm animate-fade-in">
                  <CheckCircle2 size={18} /> {message}
                </div>
              )}

              {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-400 text-sm animate-fade-in">
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 ml-1">Document Type</label>
                    <select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      className="w-full bg-black border border-gray-700 rounded-xl py-3 px-4 text-sm text-white focus:border-yellow-500 outline-none transition-all cursor-pointer"
                    >
                      {DOCUMENT_TYPES.map((type) => (
                        <option key={type} value={type}>{type.replace("_", " ")}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 ml-1">ID Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. XXXX-XXXX-XXXX"
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                      className="w-full bg-black border border-gray-700 rounded-xl py-3 px-4 text-sm text-white focus:border-yellow-500 outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Custom File Upload Area */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 ml-1">Upload File (PDF, PNG, JPG)</label>
                  <label className={`
                    relative group cursor-pointer border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all
                    ${file ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-gray-800 hover:border-gray-600 bg-black/20'}
                  `}>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        setFile(e.target.files[0]);
                        setError(null);
                      }}
                      className="hidden"
                    />
                    
                    <UploadCloud size={40} className={`mb-3 transition-colors ${file ? 'text-yellow-500' : 'text-gray-600'}`} />
                    
                    {file ? (
                      <div className="text-center">
                        <p className="text-sm font-bold text-white truncate max-w-xs">{file.name}</p>
                        <p className="text-[10px] text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-300">Click to browse or drag and drop</p>
                        <p className="text-[10px] text-gray-500 uppercase mt-1 tracking-wider">Maximum {MAX_FILE_SIZE_MB}MB</p>
                      </div>
                    )}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || !file}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-black py-4 rounded-2xl text-sm shadow-xl transition-all active:scale-[0.98] disabled:opacity-20 disabled:grayscale uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>Processing...</>
                  ) : (
                    <><CheckCircle2 size={18} /> Submit Verification</>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-6">
               <div className="bg-gray-800 p-6 rounded-full text-gray-600">
                  <ShieldCheck size={64} />
               </div>
               <div>
                  <h3 className="text-xl font-bold text-white mb-2">Verification is Locked</h3>
                  <p className="text-sm text-gray-500 max-w-xs">
                    Documents are already under process or verified. You don't need to take any action right now.
                  </p>
               </div>
               <button 
                  onClick={() => navigate("/")}
                  className="text-yellow-500 font-bold hover:underline text-sm"
                >
                  Return to Dashboard
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerKYC;