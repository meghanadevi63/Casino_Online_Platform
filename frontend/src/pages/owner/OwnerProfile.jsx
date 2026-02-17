import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { updatePassword } from "../../api/user.api";
import { fetchSuperTenants } from "../../api/superTenants.api";
import { getGameProviders } from "../../api/superGameProviders.api";
import { 
  User, ShieldAlert, Mail, Lock, 
  Building2, Cpu, KeyRound, Eye, EyeOff,
  RefreshCw, Save
} from "lucide-react";

const OwnerProfile = () => {
  const { user } = useContext(AuthContext);
  
  // Stats State
  const [stats, setStats] = useState({ tenants: 0, providers: 0 });
  
  // Form State
  const [passForm, setPassForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    // Fetch stats for the dashboard cards
    const loadStats = async () => {
      try {
        const [tenantsRes, providersRes] = await Promise.all([
          fetchSuperTenants(),
          getGameProviders()
        ]);
        setStats({
          tenants: tenantsRes.data.length,
          providers: providersRes.data.length
        });
      } catch (err) {
        console.error("Failed to load stats", err);
      }
    };
    loadStats();
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passForm.new_password !== passForm.confirm_password) {
      alert("New passwords do not match!");
      return;
    }
    setUpdating(true);
    try {
      await updatePassword({
        current_password: passForm.current_password,
        new_password: passForm.new_password
      });
      setPassForm({ current_password: "", new_password: "", confirm_password: "" });
      alert("Password changed successfully!");
    } catch (err) {
      alert(err.response?.data?.detail || "Password update failed");
    } finally {
      setUpdating(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Page Title */}
      <div className="flex items-center gap-3 border-b border-gray-800 pb-6">
        <div className="bg-yellow-500/20 p-2 rounded-lg">
          <User className="text-yellow-500" size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Super Admin Profile</h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Platform Owner Account</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: Identity & Stats */}
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-[2rem] p-8 text-center shadow-2xl">
            <div className="w-24 h-24 rounded-full bg-yellow-600 flex items-center justify-center mx-auto mb-4 text-3xl font-black text-white ring-4 ring-gray-800">
              {user.email?.[0].toUpperCase()}
            </div>
            <h2 className="text-lg font-bold text-white truncate">{user.email}</h2>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ShieldAlert size={12} /> Super Admin
            </div>
          </div>

          <StatCard label="Total Tenants" value={stats.tenants} icon={<Building2 size={20}/>} />
          <StatCard label="Total Providers" value={stats.providers} icon={<Cpu size={20}/>} />
        </div>

        {/* RIGHT: Security Settings */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-[2rem] p-8 shadow-xl">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-[3px] mb-8 flex items-center gap-2">
            <Lock size={18} className="text-yellow-500" /> Security Credentials
          </h3>

          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="space-y-2 relative">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Current Password</label>
              <div className="relative group">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={passForm.current_password}
                  onChange={(e) => setPassForm({...passForm, current_password: e.target.value})}
                  className="w-full bg-black border border-gray-800 focus:border-yellow-500 rounded-xl p-4 text-white text-sm outline-none pr-12"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 cursor-pointer">
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">New Password</label>
                <input 
                  type="password"
                  value={passForm.new_password}
                  onChange={(e) => setPassForm({...passForm, new_password: e.target.value})}
                  className="w-full bg-black border border-gray-800 focus:border-yellow-500 rounded-xl p-4 text-white text-sm outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Confirm Password</label>
                <input 
                  type="password"
                  value={passForm.confirm_password}
                  onChange={(e) => setPassForm({...passForm, confirm_password: e.target.value})}
                  className="w-full bg-black border border-gray-800 focus:border-yellow-500 rounded-xl p-4 text-white text-sm outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-800/50">
              <button type="submit" disabled={updating} className="bg-yellow-500 hover:bg-yellow-600 text-black font-black px-8 py-3 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer">
                {updating ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon }) => (
  <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className="bg-black/40 p-3 rounded-xl border border-gray-700 text-yellow-500">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</p>
        <p className="text-xl font-black text-white">{value}</p>
      </div>
    </div>
  </div>
);

export default OwnerProfile;