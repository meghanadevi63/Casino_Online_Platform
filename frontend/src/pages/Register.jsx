import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerPlayer } from "../api/auth.api";
import { fetchTenants } from "../api/tenant.api";
import axios from "../api/axios";
import SearchableSelect from "../components/SearchableSelect";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    tenant_domain: "",
    country_code: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchTenants().then(res => setTenants(res.data.map(t => ({ label: t.tenant_name, value: t.domain }))));
  }, []);

  const handleTenantSelect = async (domain) => {
    setForm({ ...form, tenant_domain: domain, country_code: "" });
    setLoadingCountries(true);
    try {
      const res = await axios.get(`/tenants/by-domain/${domain}/countries`);
      setCountries(res.data.map(c => ({ label: c.country_name, value: c.country_code })));
    } catch (e) { console.error(e); }
    finally { setLoadingCountries(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerPlayer(form);
      navigate("/login");
    } catch (err) { setError(err.response?.data?.detail || "Error"); }
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Mobile Back Button */}
      <button 
        onClick={() => navigate("/")} 
        className="md:hidden absolute top-4 left-4 z-50 p-2 bg-gray-900 rounded-full cursor-pointer hover:bg-gray-800"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Left: Branding */}
      <div className="hidden md:flex w-1/3 bg-yellow-500 p-12 flex-col justify-between text-black">
        <div className="flex items-center gap-2 font-bold text-xl cursor-pointer" onClick={() => navigate("/")}>
          <ArrowLeft size={20}/> BACK TO HOME
        </div>
        <div>
          <h2 className="text-6xl font-black tracking-tighter leading-[0.9] mb-6 uppercase">BECOME<br/>THE NEXT<br/>LEGEND.</h2>
          <p className="font-bold uppercase text-xs tracking-widest opacity-70">Join 10,000+ players across our global network.</p>
        </div>
        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-tighter">
            <ShieldCheck size={16}/> Secured by AES-256 Encryption
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-gray-900 to-black overflow-y-auto">
        
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-[10px] font-black uppercase">{error}</div>}
          <div className="text-center mb-10">
          <h1 className="text-2xl font-bold mb-2">Create Your Account</h1>
          <p className="text-gray-500 text-xs font-black uppercase tracking-[3px]">Join our global network of players</p>
        </div>
          <div className="space-y-3">
            <SearchableSelect 
              label="1. Choose Your Casino"
              options={tenants} 
              value={form.tenant_domain}
              onSelect={handleTenantSelect}
              placeholder="Search casino name..."
            />

            <SearchableSelect 
              label="2. Your Location"
              options={countries} 
              value={form.country_code}
              onSelect={(val) => setForm({...form, country_code: val})}
              placeholder={loadingCountries ? "Loading..." : "Select Country"}
              disabled={!form.tenant_domain}
            />

            <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" onChange={v => setForm({...form, first_name: v})} />
                <Input label="Last Name" onChange={v => setForm({...form, last_name: v})} />
            </div>

            <Input label="Email Address" type="email" onChange={v => setForm({...form, email: v})} />
            <Input label="Security Password" type="password" onChange={v => setForm({...form, password: v})} />
          </div>

          <button className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-2xl text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-yellow-500/10 cursor-pointer">
            Create Free Account
          </button>

          <p className="text-center text-xs text-gray-500 font-bold uppercase">
            Already a member? <span onClick={() => navigate("/login")} className="text-yellow-500 cursor-pointer hover:underline">Sign In</span>
          </p>
        </form>
      </div>
    </div>
  );
};

const Input = ({ label, type="text", onChange }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">{label}</label>
        <input 
            type={type}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-yellow-500 outline-none transition-all"
        />
    </div>
);

export default Register;