import { useEffect, useState } from "react";
import { getAllInquiries, updateInquiryStatus } from "../../api/ownerInquiry.api";
import { Mail, Building2, MessageSquare, Clock, CheckCircle2, UserPlus, RefreshCw, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OwnerInquiries = () => {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(""); // empty = all

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAllInquiries(filter);
      setInquiries(res.data);
    } catch (err) {
      console.error("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [filter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateInquiryStatus(id, newStatus);
      loadData();
    } catch (err) {
      alert("Update failed");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'new': return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case 'contacted': return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case 'closed': return "bg-green-500/10 text-green-500 border-green-500/20";
      default: return "bg-gray-800 text-gray-400";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Partnership Leads</h1>
          <p className="text-sm text-gray-500">Manage prospective casino operators</p>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-900 p-1 rounded-xl border border-gray-800">
          {['', 'new', 'contacted', 'closed'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === s ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/50 text-[10px] uppercase font-black text-gray-500 tracking-[2px] border-b border-gray-800">
                <th className="px-6 py-5">Sender</th>
                <th className="px-6 py-5">Message</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {inquiries.map((iq) => (
                <tr key={iq.inquiry_id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-blue-400 font-bold border border-gray-700">
                        {iq.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{iq.name}</p>
                        <p className="text-[10px] text-gray-500 flex items-center gap-1">
                          <Building2 size={10} /> {iq.company_name}
                        </p>
                        <p className="text-[10px] text-gray-600 font-mono mt-0.5">{iq.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="max-w-xs">
                      <p className="text-xs text-gray-400 line-clamp-2 italic leading-relaxed">
                        "{iq.message}"
                      </p>
                      <p className="text-[9px] text-gray-600 mt-2 font-bold uppercase tracking-wider">
                        Received: {new Date(iq.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${getStatusStyle(iq.status)}`}>
                      {iq.status}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {iq.status === 'new' && (
                        <button 
                          onClick={() => handleStatusChange(iq.inquiry_id, 'contacted')}
                          className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg hover:bg-yellow-500 hover:text-black transition-all"
                          title="Mark as Contacted"
                        >
                          <Mail size={16} />
                        </button>
                      )}
                      {iq.status !== 'closed' && (
                        <button 
                          onClick={() => handleStatusChange(iq.inquiry_id, 'closed')}
                          className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-black transition-all"
                          title="Close/Done"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => navigate("/owner/tenants/create", { state: { name: iq.company_name, email: iq.email } })}
                        className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                        title="Convert to Tenant"
                      >
                        <UserPlus size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="p-20 text-center flex flex-col items-center justify-center gap-4 bg-gray-900">
            <RefreshCw className="text-blue-500 animate-spin" size={32} />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Loading Leads...</p>
          </div>
        )}

        {!loading && inquiries.length === 0 && (
          <div className="p-20 text-center text-gray-600">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-sm italic">No inquiries found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerInquiries;