import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getTenantAdmins } from "../../api/superTenantAdmins.api";
import AddTenantAdminModal from "./AddTenantAdminModal";
import { 
  Users, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  Ban, 
  MapPin, 
  Mail,
  UserX
} from "lucide-react";

const OwnerTenantAdmins = () => {
  const { tenantId } = useParams();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTenantAdmins(tenantId);
      setAdmins(res.data);
    } catch (err) {
      console.error("Failed to load admins:", err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  if (loading && admins.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <RefreshCw className="animate-spin mb-2" size={32} />
      <p className="font-bold text-xs uppercase tracking-widest">Loading Administrators...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Users className="text-yellow-500" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-white">Tenant Administrators</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Manage Operator Accounts</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 cursor-pointer"
        >
          <Plus size={18} strokeWidth={3} /> Add Admin
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-black/50 text-xs font-bold text-gray-500 border-b border-gray-800 uppercase tracking-widest">
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Country</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {admins.map((a) => (
                <tr key={a.user_id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="font-bold text-white text-sm">{a.first_name} {a.last_name}</span>
                        <span className="text-[10px] text-gray-500 font-mono">{a.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-bold">
                        <MapPin size={14} className="text-blue-500" /> {a.country_code}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                      a.status === 'active'
                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                    }`}>
                      {a.status === 'active' ? <CheckCircle2 size={10} /> : <Ban size={10} />}
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {admins.length === 0 && !loading && (
          <div className="p-20 text-center flex flex-col items-center">
            <UserX className="text-gray-800 mb-4" size={48} />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No administrators created for this tenant</p>
          </div>
        )}
      </div>

      {/* ADD MODAL */}
      {showAdd && (
        <AddTenantAdminModal
          tenantId={tenantId}
          onClose={() => setShowAdd(false)}
          onSuccess={loadAdmins}
        />
      )}
    </div>
  );
};

export default OwnerTenantAdmins;