import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSuperTenant } from "../../api/superTenants.api";
import { Plus, CheckCircle2, Building2, Globe, Shield } from "lucide-react";

const OwnerTenantCreate = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    tenant_name: "",
    domain: "",
    status: "active",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tenant_name) {
      alert("Tenant name is required");
      return;
    }

    try {
      setLoading(true);
      await createSuperTenant({
        tenant_name: form.tenant_name,
        domain: form.domain || null,
        status: form.status,
      });
      navigate("/owner/tenants");
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to create tenant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gray-900 border border-gray-800 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
        
        {/* Header Section */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500">
            <Plus size={20} strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-bold text-white">Onboard New Tenant</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tenant Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
              Brand Name
            </label>
            <div className="relative group">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <input
                name="tenant_name"
                placeholder="e.g. Royal Vegas"
                value={form.tenant_name}
                onChange={handleChange}
                className="w-full bg-black border border-gray-700 p-4 pl-12 rounded-2xl text-white focus:border-yellow-500 outline-none transition-all text-sm"
                required
              />
            </div>
          </div>

          {/* Domain */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
              Primary Domain (Optional)
            </label>
            <div className="relative group">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <input
                name="domain"
                placeholder="e.g. royalvegas.com"
                value={form.domain}
                onChange={handleChange}
                className="w-full bg-black border border-gray-700 p-4 pl-12 rounded-2xl text-white focus:border-yellow-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
              Instance Status
            </label>
            <div className="relative group">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full bg-black border border-gray-700 p-4 pl-12 rounded-2xl text-white focus:border-yellow-500 outline-none transition-all text-sm appearance-none cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                "Deploying..."
              ) : (
                <>
                  <CheckCircle2 size={16} /> Create Partner Instance
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/owner/tenants")}
              className="w-full py-2 text-gray-500 hover:text-white transition-colors font-bold text-[10px] uppercase tracking-widest cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Subtle Background Accent */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none"></div>
      </div>
    </div>
  );
};

export default OwnerTenantCreate;