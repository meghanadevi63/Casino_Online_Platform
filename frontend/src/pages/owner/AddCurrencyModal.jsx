import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { addTenantCountryCurrency } from "../../api/superTenantCountries.api";
import { 
  Plus, 
  X, 
  Coins, 
  Check, 
  RefreshCw, 
  ChevronDown 
} from "lucide-react";

const AddCurrencyModal = ({
  tenantId,
  countryCode,
  onClose,
  onSuccess,
}) => {
  const [currencies, setCurrencies] = useState([]);
  const [currencyId, setCurrencyId] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await axios.get("/meta/currencies");
        setCurrencies(res.data || []);
      } catch (err) {
        console.error("Failed to load currencies", err);
      } finally {
        setFetching(false);
      }
    };
    fetchCurrencies();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!currencyId) return alert("Please select a currency");

    try {
      setLoading(true);
      await addTenantCountryCurrency(
        tenantId,
        countryCode,
        {
          currency_id: Number(currencyId),
          is_default: isDefault,
        }
      );

      onSuccess();
      onClose();
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to add currency");
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
                    <h2 className="text-2xl font-bold">Add Currency</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Expand financial support for {countryCode}</p>
                </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors cursor-pointer"><X size={20}/></button>
        </div>

        <form onSubmit={submit} className="space-y-6">
          
          {/* Select Currency */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Coins size={12} /> Select Currency
            </label>
            <div className="relative">
                <select
                  className="w-full bg-black border border-gray-800 rounded-xl py-4 px-4 text-sm text-white focus:border-yellow-500 outline-none appearance-none cursor-pointer disabled:opacity-50"
                  onChange={(e) => setCurrencyId(e.target.value)}
                  value={currencyId}
                  disabled={fetching}
                  required
                >
                  <option value="">{fetching ? "Loading options..." : "-- Choose Currency --"}</option>
                  {currencies.map((c) => (
                    <option key={c.currency_id} value={c.currency_id}>
                      {c.currency_name} ({c.currency_code})
                    </option>
                  ))}
                </select>
                {/* Custom Chevron */}
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
            </div>
          </div>

          {/* Default Checkbox (Styled) */}
          <div 
            className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                isDefault 
                ? "bg-yellow-500/10 border-yellow-500/50" 
                : "bg-black border-gray-800 hover:border-gray-600"
            }`}
            onClick={() => setIsDefault(!isDefault)}
          >
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                isDefault ? "bg-yellow-500 border-yellow-500 text-black" : "border-gray-600 bg-gray-900"
            }`}>
                {isDefault && <Check size={14} strokeWidth={4} />}
            </div>
            <div>
                <p className={`text-xs font-bold uppercase tracking-wide ${isDefault ? "text-yellow-500" : "text-gray-400"}`}>
                    Set as Default
                </p>
                <p className="text-[9px] text-gray-600 font-medium">
                    This currency will be pre-selected for new players in {countryCode}.
                </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || !currencyId}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <RefreshCw className="animate-spin" size={16} /> : "Enable Currency"}
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

export default AddCurrencyModal;