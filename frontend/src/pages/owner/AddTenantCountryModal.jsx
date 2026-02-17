import { useEffect, useState } from "react";
import { addTenantCountry } from "../../api/superTenantCountries.api";
import axios from "../../api/axios";
import { Plus, X, Globe, Coins, RefreshCw, ChevronDown, AlertCircle } from "lucide-react";

const AddTenantCountryModal = ({ tenantId, onClose, onSuccess, existingCountries = [] }) => {
  // Store full country data (including currency) from API
  const [allCountries, setAllCountries] = useState([]);
  const [availableCountries, setAvailableCountries] = useState([]);
  
  const [form, setForm] = useState({
    country_code: "",
    currency_code: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [fetchingMeta, setFetchingMeta] = useState(true);

  // 1. Fetch Global Country Metadata
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await axios.get("/meta/countries");
        setAllCountries(res.data || []);
      } catch (err) {
        console.error("Failed to fetch country metadata", err);
      } finally {
        setFetchingMeta(false);
      }
    };
    fetchMeta();
  }, []);

  // 2. Filter out countries already added to this tenant
  useEffect(() => {
    if (allCountries.length > 0) {
      const existingCodes = new Set(existingCountries.map(c => c.country_code));
      const available = allCountries.filter(c => !existingCodes.has(c.country_code));
      setAvailableCountries(available);
    }
  }, [allCountries, existingCountries]);

  // AUTO-FILL LOGIC
  const handleCountryChange = (e) => {
    const selectedCode = e.target.value;
    
    // Find the full country object from our API data
    const countryData = allCountries.find(c => c.country_code === selectedCode);
    
    setForm({
      country_code: selectedCode,
      // If found, use its default_currency, otherwise empty string
      currency_code: countryData?.default_currency || "" 
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.country_code || !form.currency_code) {
      return alert("Country and currency code are required");
    }

    try {
      setLoading(true);
      await addTenantCountry(tenantId, form);
      onSuccess();
      onClose();
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to add country");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-gray-900 border border-gray-800 rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-3">
                <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500">
                    <Plus size={24} strokeWidth={3} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Add Operational Region</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Enable a new country for this tenant</p>
                </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors cursor-pointer"><X size={20}/></button>
        </div>
        
        {/* Loading State for Metadata */}
        {fetchingMeta ? (
          <div className="py-10 text-center text-gray-500 animate-pulse text-xs font-bold uppercase tracking-widest">
            Loading geographical data...
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-6">
            
            {/* Country Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Globe size={12} /> Country
              </label>
              <div className="relative">
                  <select
                      className="w-full bg-black border border-gray-800 rounded-xl py-4 px-4 text-sm text-white focus:border-yellow-500 outline-none appearance-none cursor-pointer disabled:opacity-50"
                      onChange={handleCountryChange} 
                      value={form.country_code}
                      disabled={availableCountries.length === 0}
                      required
                  >
                      <option value="">{availableCountries.length === 0 ? "No new countries available" : "Select an available country..."}</option>
                      {availableCountries.map((c) => (
                          <option key={c.country_code} value={c.country_code}>
                              {c.country_name} ({c.country_code})
                          </option>
                      ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
              </div>
              {availableCountries.length === 0 && (
                <div className="flex items-center gap-2 text-[10px] text-yellow-500 mt-2">
                    <AlertCircle size={12} />
                    <span>All supported countries are already added.</span>
                </div>
              )}
            </div>

            {/* Currency Input (Auto-filled) */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Coins size={12} /> Default Currency Code
              </label>
              <input
                placeholder="e.g. INR"
                className="w-full bg-black border border-gray-800 rounded-xl py-4 px-4 text-sm text-white focus:border-yellow-500 outline-none uppercase font-mono tracking-widest placeholder:normal-case placeholder:font-sans"
                value={form.currency_code}
                onChange={(e) => setForm({ ...form, currency_code: e.target.value.toUpperCase() })}
                maxLength={3}
                required
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || availableCountries.length === 0 || !form.country_code}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <RefreshCw className="animate-spin" size={16} /> : "Confirm & Add"}
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
        )}
      </div>
    </div>
  );
};

export default AddTenantCountryModal;