import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { updateProfile, updatePassword } from "../../api/user.api";
import { 
  User, 
  ShieldCheck, 
  Mail, 
  Lock, 
  Building2, 
  Fingerprint, 
  KeyRound, 
  Eye, 
  EyeOff,
  Save,
  RefreshCw,
  LayoutDashboard
} from "lucide-react";

const AdminProfile = () => {
  const { user, refreshUser } = useContext(AuthContext);
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Form States
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
  });

  const [passForm, setPassForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      await updateProfile(profileForm);
      await refreshUser();
      alert("Admin profile updated successfully!");
    } catch (err) {
      alert(err.response?.data?.detail || "Update failed");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passForm.new_password !== passForm.confirm_password) {
      alert("Passwords do not match!");
      return;
    }
    setUpdatingPassword(true);
    try {
      await updatePassword({
        current_password: passForm.current_password,
        new_password: passForm.new_password
      });
      setPassForm({ current_password: "", new_password: "", confirm_password: "" });
      alert("Password updated successfully!");
    } catch (err) {
      alert(err.response?.data?.detail || "Password update failed");
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-gray-800 pb-6">
        <div className="text-yellow-500">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Administrator Profile</h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Manage console credentials</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: IDENTITY CARD */}
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500"></div>
            
            <div className="w-20 h-20 rounded-[1.5rem] bg-gray-800 border-2 border-gray-700 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-yellow-500">
              {user.first_name?.[0]}{user.last_name?.[0] || "A"}
            </div>

            <h2 className="text-xl font-bold text-white">{user.first_name} {user.last_name}</h2>
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mt-1">Tenant Administrator</p>

            <div className="mt-8 space-y-3">
               <div className="flex items-center justify-between p-3 rounded-xl border border-gray-800 bg-black/20">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Casino</span>
                  <div className="flex items-center gap-2 text-white">
                    <Building2 size={14} className="text-yellow-500" />
                    <span className="text-xs font-bold uppercase">{user.tenant_name}</span>
                  </div>
               </div>
               <div className="flex items-center justify-between p-3 rounded-xl border border-gray-800 bg-black/20">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Role ID</span>
                  <span className="text-xs font-mono font-bold text-gray-300">Level {user.role_id}</span>
               </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Console Access</h3>
             <div className="flex items-center gap-3 text-gray-400 text-sm">
                <LayoutDashboard size={16} />
                <span className="font-bold">Full Access Permissions</span>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FORMS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* PERSONAL SETTINGS */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-md">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Fingerprint size={20} className="text-yellow-500" /> Identity Settings
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">First Name</label>
                  <input 
                    type="text"
                    value={profileForm.first_name}
                    onChange={(e) => setProfileForm({...profileForm, first_name: e.target.value})}
                    className="w-full bg-black border border-gray-800 focus:border-yellow-500 rounded-xl p-3 text-sm text-white outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Last Name</label>
                  <input 
                    type="text"
                    value={profileForm.last_name}
                    onChange={(e) => setProfileForm({...profileForm, last_name: e.target.value})}
                    className="w-full bg-black border border-gray-800 focus:border-yellow-500 rounded-xl p-3 text-sm text-white outline-none transition-all"
                  />
                </div>
              </div>

              <div className="bg-black/30 p-4 rounded-xl flex items-center gap-3 border border-gray-800/50">
                  <Mail size={16} className="text-gray-600" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Primary Admin Email</span>
                    <span className="text-sm font-bold text-gray-300">{user.email}</span>
                  </div>
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit" 
                  disabled={updatingProfile}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {updatingProfile ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                  Save Profile
                </button>
              </div>
            </form>
          </div>

          {/* SECURITY SECTION */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-md">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Lock size={20} className="text-yellow-500" /> Security Vault
            </h3>

            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Current Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={passForm.current_password}
                    onChange={(e) => setPassForm({...passForm, current_password: e.target.value})}
                    className="w-full bg-black border border-gray-800 focus:border-yellow-500 rounded-xl p-3 text-sm text-white outline-none pr-12"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">New Password</label>
                  <input 
                    type="password"
                    value={passForm.new_password}
                    onChange={(e) => setPassForm({...passForm, new_password: e.target.value})}
                    className="w-full bg-black border border-gray-800 focus:border-yellow-500 rounded-xl p-3 text-sm text-white outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Confirm New Password</label>
                  <input 
                    type="password"
                    value={passForm.confirm_password}
                    onChange={(e) => setPassForm({...passForm, confirm_password: e.target.value})}
                    className="w-full bg-black border border-gray-800 focus:border-yellow-500 rounded-xl p-3 text-sm text-white outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-gray-800 mt-4">
                <button 
                  type="submit" 
                  disabled={updatingPassword}
                  className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-8 py-3 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 border border-gray-700 cursor-pointer flex items-center gap-2"
                >
                  {updatingPassword ? <RefreshCw className="animate-spin" size={16} /> : <KeyRound size={16} />}
                  Update Credentials
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminProfile;