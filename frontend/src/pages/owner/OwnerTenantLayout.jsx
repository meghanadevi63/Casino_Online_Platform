import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { fetchSuperTenantById, updateSuperTenant } from "../../api/superTenants.api";
import { 
  Building2, 
  ArrowLeft, 
  LayoutDashboard, 
  Globe, 
  Users, 
  Cpu, 
  Gamepad2,
  CheckCircle2,
  Ban,
  PauseCircle,
  RefreshCw,
  ChevronDown,
  Activity
} from "lucide-react";

const OwnerTenantLayout = () => {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const tabs = [
    { label: "Overview", path: "", icon: <LayoutDashboard size={16} /> },
    { label: "Countries", path: "countries", icon: <Globe size={16} /> },
    { label: "Admins", path: "admins", icon: <Users size={16} /> },
    { label: "Providers", path: "providers", icon: <Cpu size={16} /> },
    { label: "Games", path: "games", icon: <Gamepad2 size={16} /> },
  ];

  // Helper to determine active tab for Mobile Dropdown value
  const getCurrentTabValue = () => {
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    // If the last part is the UUID, we are at the root (Overview)
    if (lastPart === tenantId) return "";
    return lastPart;
  };

  const loadTenant = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchSuperTenantById(tenantId);
      setTenant(res.data);
    } catch (err) {
      console.error("Failed to load tenant", err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadTenant();
  }, [loadTenant]);

  const changeStatus = async (status) => {
    try {
      setUpdating(true);
      await updateSuperTenant(tenantId, { status, domain: tenant.domain });
      await loadTenant();
    } catch {
      alert("Failed to update tenant status");
    } finally {
      setUpdating(false);
    }
  };

  const handleMobileNav = (e) => {
    navigate(e.target.value);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <RefreshCw className="animate-spin mb-2" size={32} />
      <p className="font-black text-xs uppercase tracking-widest">Loading Tenant Data...</p>
    </div>
  );

  if (!tenant) return (
    <div className="p-10 text-center">
        <h2 className="text-xl font-black text-red-500 uppercase">Tenant Not Found</h2>
        <button onClick={() => navigate("/owner/tenants")} className="mt-4 text-gray-400 hover:text-white underline">Return to List</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-6 border-b border-gray-800 pb-8">
        
        {/* Top Row: Back Button & Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-500/20 p-3 rounded-2xl">
              <Building2 className="text-yellow-500" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
                {tenant.tenant_name}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
                  ID: {tenant.tenant_id.slice(0, 8)}...
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                  tenant.status === 'active' 
                    ? "bg-green-500/10 text-green-500 border-green-500/20" 
                    : tenant.status === 'suspended'
                    ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                    : "bg-red-500/10 text-red-500 border-red-500/20"
                }`}>
                  {tenant.status === 'active' && <CheckCircle2 size={10} />}
                  {tenant.status === 'suspended' && <PauseCircle size={10} />}
                  {tenant.status === 'inactive' && <Ban size={10} />}
                  {tenant.status}
                </span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => navigate("/owner/tenants")} 
            className="self-start md:self-auto flex items-center gap-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-400 hover:text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {/* Status Controls */}
        <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
             <Activity size={16} className="text-gray-500" />
             <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Lifecycle Control
             </span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {["active", "suspended", "inactive"].map((s) => (
              <button
                key={s}
                disabled={tenant.status === s || updating}
                onClick={() => changeStatus(s)}
                className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
                  tenant.status === s
                    ? "bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed opacity-50"
                    : "bg-black text-white border-gray-600 hover:border-yellow-500 hover:text-yellow-500 cursor-pointer hover:bg-gray-900"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* NAVIGATION: Responsive Switch */}
      
      {/* 1. Mobile Dropdown (< md) */}
      <div className="md:hidden relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500 pointer-events-none">
            <LayoutDashboard size={18} />
        </div>
        <select
            value={getCurrentTabValue()}
            onChange={handleMobileNav}
            className="w-full bg-gray-900 border border-gray-700 text-white text-sm font-bold uppercase tracking-wider rounded-xl py-3 pl-12 pr-10 appearance-none focus:border-yellow-500 outline-none transition-all"
        >
            {tabs.map((tab) => (
                <option key={tab.path} value={tab.path}>
                    {tab.label}
                </option>
            ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            <ChevronDown size={18} />
        </div>
      </div>

      {/* 2. Desktop Horizontal Tabs (>= md) */}
      <div className="hidden md:flex items-center gap-2 border-b border-gray-800 pb-1">
        {tabs.map((tab) => (
          <NavLink
            key={tab.label}
            to={tab.path}
            end={tab.path === ""}
            className={({ isActive }) =>
              `flex items-center gap-2 px-6 py-3 rounded-t-xl text-xs font-black uppercase tracking-widest transition-all ${
                isActive
                  ? "bg-gray-800 text-white border-b-2 border-yellow-500"
                  : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/30"
              }`
            }
          >
            {tab.icon}
            {tab.label}
          </NavLink>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[400px]">
        <Outlet context={{ tenant }} />
      </div>
    </div>
  );
};

export default OwnerTenantLayout;