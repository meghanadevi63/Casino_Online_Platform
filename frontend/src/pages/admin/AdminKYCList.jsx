import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPendingKYC } from "../../api/adminKyc.api";
import { 
  ShieldCheck, 
  RefreshCw, 
  FileText, 
  User, 
  Eye, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Search,
  Calendar,
  Filter,
  FilterX
} from "lucide-react";

const statusStyle = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  verified: "bg-green-500/10 text-green-500 border-green-500/20",
  rejected: "bg-red-500/10 text-red-500 border-red-500/20",
};

const AdminKYCList = () => {
  const navigate = useNavigate();
  const [kycList, setKycList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const loadKYC = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchPendingKYC();
      setKycList(res.data);
    } catch (err) {
      console.error("❌ Failed to load KYC list", err);
      setError("Failed to load KYC requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadKYC();
  }, [loadKYC]);

  // Memoized Filtering Logic
  const filteredKyc = useMemo(() => {
    return kycList.filter((doc) => {
      const matchesEmail = doc.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !typeFilter || doc.document_type === typeFilter;
      
      const uploadDate = new Date(doc.uploaded_at).toISOString().split("T")[0];
      const matchesDate = !dateFilter || uploadDate === dateFilter;

      return matchesEmail && matchesType && matchesDate;
    });
  }, [kycList, searchTerm, typeFilter, dateFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setDateFilter("");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <RefreshCw className="animate-spin mb-2" size={32} />
        <p className="font-bold">Loading KYC requests...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-yellow-500" size={28} />
          <h1 className="text-2xl font-bold">KYC Verification Queue</h1>
        </div>

        <button
          onClick={loadKYC}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors cursor-pointer"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* FILTERS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-900/50 p-4 rounded-2xl border border-gray-800 shadow-lg">
        {/* Search Email */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            placeholder="Search Player Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-yellow-500 outline-none transition-all"
          />
        </div>

        {/* Document Type Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 pointer-events-none" size={18} />
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-yellow-500 outline-none appearance-none cursor-pointer"
          >
            <option value="">All Doc Types</option>
            <option value="AADHAAR">Aadhaar</option>
            <option value="PAN">PAN Card</option>
            <option value="PASSPORT">Passport</option>
            <option value="DRIVING_LICENSE">Driving License</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 pointer-events-none" size={18} />
          <input 
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ colorScheme: 'dark' }}
            className="w-full bg-black border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-yellow-500 outline-none"
          />
        </div>

        {/* Clear Filters */}
        <button 
          onClick={clearFilters}
          disabled={!searchTerm && !typeFilter && !dateFilter}
          className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-transparent hover:border-red-500/30 font-bold text-xs uppercase tracking-widest"
        >
          <FilterX size={16} /> Clear Filters
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* DATA TABLE */}
      {filteredKyc.length === 0 ? (
        <div className="bg-gray-900 border border-dashed border-gray-800 rounded-2xl p-20 text-center text-gray-500">
          <FilterX className="mx-auto mb-4 opacity-20" size={48} />
          <p className="font-bold">No matching KYC requests found</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-black/50 text-xs font-bold text-gray-400 border-b border-gray-800 uppercase tracking-widest">
                  <th className="px-6 py-4">Player Email</th>
                  <th className="px-6 py-4">Document</th>
                  <th className="px-6 py-4 hidden lg:table-cell">ID Number</th>
                  <th className="px-6 py-4 hidden md:table-cell">Uploaded Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-800">
                {filteredKyc.map((doc) => (
                  <tr key={doc.document_id} className="hover:bg-yellow-500/[0.01] transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-white">
                      {doc.email}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                        <FileText size={14} className="text-yellow-500" /> {doc.document_type}
                      </div>
                    </td>

                    <td className="px-6 py-4 hidden lg:table-cell text-sm font-mono text-gray-500">
                      {doc.document_number || "—"}
                    </td>

                    <td className="px-6 py-4 hidden md:table-cell text-sm text-gray-500 font-medium">
                      {new Date(doc.uploaded_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-tighter ${statusStyle[doc.verification_status]}`}>
                        {doc.verification_status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/admin/kyc/${doc.document_id}`)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer inline-flex items-center gap-2 shadow-lg shadow-yellow-500/10"
                      >
                        <Eye size={14} /> Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKYCList;