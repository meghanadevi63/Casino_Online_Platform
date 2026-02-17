import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginPlayer } from "../api/auth.api";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { ArrowLeft, LogIn, Mail, Fingerprint, Building2 } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenants, setTenants] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Detect Casinos registered with this email
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (email.includes("@") && email.includes(".")) {
        setLoadingTenants(true);
        try {
          const res = await api.get(`/auth/lookup-tenants?email=${email}`);
          setTenants(res.data);
          if (res.data.length === 1) setSelectedDomain(res.data[0].domain);
        } catch (e) { console.error(e); }
        finally { setLoadingTenants(false); }
      } else {
        setTenants([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await loginPlayer({ tenant_domain: selectedDomain, email, password });
      login(res.data.access_token);
      navigate("/post-login", { replace: true }); 
    } catch (err) { setError(err?.response?.data?.detail || "Invalid credentials"); }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]">
      <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
        
        {/* Top Accents */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
        <button onClick={() => navigate("/")} className="absolute top-8 left-8 text-gray-600 hover:text-white transition-colors"><ArrowLeft size={20}/></button>

        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-gray-500 text-xs font-black uppercase tracking-[3px]">Login Into Your Account </p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase mb-6 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-4">Email Address</label>
            <div className="relative group">
               <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500 transition-colors" size={18}/>
               <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black border border-gray-800 focus:border-yellow-500 rounded-2xl py-4 pl-12 pr-6 text-sm outline-none transition-all"
                  placeholder="Enter your registered email"
                  required
               />
            </div>
          </div>

          {/* SMART TENANT SUGGESTIONS */}
          {loadingTenants ? (
            <div className="text-center py-2 animate-pulse text-[10px] font-black text-yellow-500/50 uppercase tracking-widest">Searching registered casinos...</div>
          ) : tenants.length > 0 ? (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
               <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-4">Account found in:</label>
               <div className="grid grid-cols-2 gap-2">
                 {tenants.map(t => (
                   <div 
                      key={t.domain}
                      onClick={() => setSelectedDomain(t.domain)}
                      className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${selectedDomain === t.domain ? 'bg-yellow-500 border-yellow-400 text-black shadow-lg shadow-yellow-500/20' : 'bg-black border-gray-800 text-gray-400 hover:border-gray-600'}`}
                   >
                     <Building2 size={14}/>
                     <span className="text-[10px] font-black uppercase truncate">{t.tenant_name}</span>
                   </div>
                 ))}
               </div>
            </div>
          ) : email.includes("@") && !loadingTenants && (
            <div className="text-center text-[10px] font-bold text-red-500/50 uppercase">No accounts found with this email</div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-4">Password</label>
            <div className="relative group">
               <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-500 transition-colors" size={18}/>
               <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black border border-gray-800 focus:border-yellow-500 rounded-2xl py-4 pl-12 pr-6 text-sm outline-none transition-all"
                  placeholder="••••••••"
                  required
               />
            </div>
          </div>

          <button 
            disabled={!selectedDomain}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-5 rounded-[2rem] text-sm uppercase tracking-widest transition-all active:scale-[0.98] shadow-2xl shadow-yellow-500/10 disabled:opacity-20 flex items-center justify-center gap-2"
          >
            Authorize Access <LogIn size={18}/>
          </button>

          <p className="text-center text-[10px] font-bold text-gray-500 uppercase">
            Not registered? <span onClick={() => navigate("/register")} className="text-yellow-500 cursor-pointer hover:underline">Create an account</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;