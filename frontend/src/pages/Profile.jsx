import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { getWalletsByPlayerId } from "../api/wallet.api";
import { updateProfile, updatePassword } from "../api/user.api";
import { 
  User, ShieldCheck, Mail, Lock, 
  Building2, Fingerprint, Wallet, 
  Coins, Star, Gift, CheckCircle2, 
  RefreshCw, KeyRound, Eye, EyeOff ,Trophy
} from "lucide-react";

const Profile = () => {
  const { user, refreshUser } = useContext(AuthContext);
  
  // States
  const [wallets, setWallets] = useState([]);
  const [loadingWallets, setLoadingWallets] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

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

  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user?.user_id) fetchWallets();
  }, [user]);

  const fetchWallets = async () => {
    setLoadingWallets(true);
    try {
      const res = await getWalletsByPlayerId(user.user_id);
      setWallets(res.data);
    } catch (err) {
      console.error("Wallet error:", err);
    } finally {
      setLoadingWallets(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      await updateProfile(profileForm);
      await refreshUser();
      alert("Profile updated successfully!");
    } catch (err) {
      alert(err.response?.data?.detail || "Update failed");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passForm.new_password !== passForm.confirm_password) {
      alert("New passwords do not match!");
      return;
    }
    setUpdatingPassword(true);
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
      setUpdatingPassword(false);
    }
  };

  const getWalletIcon = (code) => {
    if (code === "CASH") return <Coins className="text-green-400" />;
    if (code === "POINTS") return <Star className="text-blue-400" />;
    return <Gift className="text-purple-400" />;
  };

  if (!user) return null;

  const kycConfig = {
    verified: "bg-green-500/10 text-green-500 border-green-500/20",
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    rejected: "bg-red-500/10 text-red-500 border-red-500/20",
    not_submitted: "bg-gray-800 text-gray-500 border-gray-700",
  }[user.kyc_status] || "bg-gray-800 text-gray-400";

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500/20 p-2 rounded-xl">
            <User className="text-yellow-500" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">My Profile</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Manage Identity & Wealth</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: Identity & Wallets */}
        <div className="space-y-6">
          {/* Identity Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-[2rem] p-8 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-yellow-500"></div>
            <div className="w-20 h-20 rounded-full bg-gray-800 border-2 border-yellow-500/50 flex items-center justify-center mx-auto mb-4 text-2xl font-black text-white shadow-xl">
              {user.first_name?.[0]}{user.last_name?.[0]}
            </div>
            <h2 className="text-xl font-bold text-white">{user.first_name} {user.last_name}</h2>
           {/* <div className="flex items-center justify-center gap-2 mt-1">
               <Trophy size={14} className="text-yellow-500" />
               <span className="text-[10px] font-black uppercase text-yellow-500 tracking-widest">Bronze Tier</span>
            </div> */}

            <div className="mt-8 space-y-3">
               <div className={`flex items-center justify-between p-3 rounded-xl border ${kycConfig}`}>
                  <span className="text-[9px] font-bold uppercase">KYC Status</span>
                  <span className="text-[10px] font-black uppercase tracking-wider">{user.kyc_status?.replace('_', ' ')}</span>
               </div>
               <div className="flex items-center justify-between p-3 rounded-xl border border-gray-800 bg-black/20">
                  <span className="text-[9px] font-bold text-gray-500 uppercase">Casino</span>
                  <span className="text-[10px] font-bold text-white uppercase">{user.tenant_name}</span>
               </div>
            </div>
          </div>

          {/* Wallets Hub */}
          <div className="bg-gray-900 border border-gray-800 rounded-[2rem] p-6 shadow-xl space-y-4">
             <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">My Wallets</h3>
                <button onClick={fetchWallets} className="text-gray-500 hover:text-white transition-colors">
                  <RefreshCw size={14} className={loadingWallets ? "animate-spin" : ""} />
                </button>
             </div>

             {loadingWallets ? (
               <div className="py-10 text-center text-gray-600 text-[10px] font-bold uppercase animate-pulse">Syncing...</div>
             ) : (
               wallets.map(w => (
                 <div key={w.wallet_id} className="bg-black/40 border border-gray-800 p-4 rounded-2xl flex items-center justify-between group hover:border-yellow-500/30 transition-all">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-gray-800 rounded-lg">{getWalletIcon(w.wallet_type)}</div>
                       <div>
                          <p className="text-[9px] font-black text-gray-500 uppercase leading-none mb-1">{w.wallet_type}</p>
                          <p className="text-lg font-mono font-black text-white">{user.currency_symbol}{w.balance.toLocaleString()}</p>
                       </div>
                    </div>
                 </div>
               ))
             )}
          </div>
        </div>

        {/* RIGHT: Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Profile Update */}
          <div className="bg-gray-900 border border-gray-800 rounded-[2rem] p-8 shadow-xl">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[3px] mb-8 flex items-center gap-2">
              <Fingerprint size={18} className="text-yellow-500" /> Identity Settings
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">First Name</label>
                  <input 
                    type="text"
                    value={profileForm.first_name}
                    onChange={(e) => setProfileForm({...profileForm, first_name: e.target.value})}
                    className="w-full bg-black border border-gray-800 focus:border-yellow-500 rounded-2xl p-4 text-white text-sm outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Last Name</label>
                  <input 
                    type="text"
                    value={profileForm.last_name}
                    onChange={(e) => setProfileForm({...profileForm, last_name: e.target.value})}
                    className="w-full bg-black border border-gray-800 focus:border-yellow-500 rounded-2xl p-4 text-white text-sm outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" disabled={updatingProfile} className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-8 py-3 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50">
                  {updatingProfile ? "Saving..." : "Update Identity"}
                </button>
              </div>
            </form>
          </div>

          {/* Password Update */}
          <div className="bg-gray-900 border border-gray-800 rounded-[2rem] p-8 shadow-xl">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[3px] mb-8 flex items-center gap-2">
              <KeyRound size={18} className="text-yellow-500" /> Security
            </h3>

            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-2 relative">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Current Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={passForm.current_password}
                    onChange={(e) => setPassForm({...passForm, current_password: e.target.value})}
                    className="w-full bg-black border border-gray-800 focus:border-yellow-500 rounded-2xl p-4 text-white text-sm outline-none pr-12"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
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
                    className="w-full bg-black border border-gray-800 focus:border-yellow-500 rounded-2xl p-4 text-white text-sm outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                  <input 
                    type="password"
                    value={passForm.confirm_password}
                    onChange={(e) => setPassForm({...passForm, confirm_password: e.target.value})}
                    className="w-full bg-black border border-gray-800 focus:border-yellow-500 rounded-2xl p-4 text-white text-sm outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-gray-800/50 mt-4">
                <button type="submit" disabled={updatingPassword} className="bg-gray-800 hover:bg-gray-700 text-white font-black px-8 py-3 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 border border-gray-700">
                  {updatingPassword ? "Processing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;