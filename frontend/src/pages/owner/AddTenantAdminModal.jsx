import { useEffect, useState } from "react";
import { createTenantAdmin } from "../../api/superTenantAdmins.api";
import { getTenantCountries } from "../../api/superTenantCountries.api";
import { 
  Plus, 
  X, 
  User, 
  Mail, 
  Lock, 
  MapPin, 
  ChevronDown,
  RefreshCw,
  CheckCircle2
} from "lucide-react";

const AddTenantAdminModal = ({ tenantId, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    country_code: "",
    first_name: "",
    last_name: "",
  });
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getTenantCountries(tenantId).then((res) =>
      setCountries(res.data.filter((c) => c.is_active))
    );
  }, [tenantId]);

  const submit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      await createTenantAdmin(tenantId, form);
      onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to create admin");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-gray-900 border border-gray-800 rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
        
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500">
              <Plus size={24} strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Add Administrator</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Create Operator Account</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors cursor-pointer"><X size={20}/></button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input name="first_name" label="First Name" onChange={handleInputChange} icon={<User size={14}/>} />
            <Input name="last_name" label="Last Name" onChange={handleInputChange} icon={<User size={14}/>} />
          </div>
          
          <Input name="email" label="Email Address" type="email" onChange={handleInputChange} icon={<Mail size={14}/>} />
          <Input name="password" label="Password" type="password" onChange={handleInputChange} icon={<Lock size={14}/>} />
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2"><MapPin size={12}/> Country</label>
            <div className="relative">
              <select
                name="country_code"
                onChange={handleInputChange}
                className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-sm text-white focus:border-yellow-500 outline-none appearance-none cursor-pointer"
                required
              >
                <option value="">Select Country</option>
                {countries.map((c) => (
                  <option key={c.country_code} value={c.country_code}>
                    {c.country_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <RefreshCw className="animate-spin" size={16}/> : <><CheckCircle2 size={16}/> Add Administrator</>}
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="w-full py-2 text-gray-500 hover:text-white font-bold text-[10px] uppercase tracking-widest transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Input = ({ name, label, type = "text", onChange, icon }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">{icon} {label}</label>
        <input 
            name={name}
            type={type}
            onChange={onChange}
            className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-sm text-white focus:border-yellow-500 outline-none transition-all"
            required
        />
    </div>
);

export default AddTenantAdminModal;