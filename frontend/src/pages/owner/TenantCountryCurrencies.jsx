import { useEffect, useState } from "react";
import {
  getTenantCountryCurrencies,
  updateTenantCountryCurrency,
} from "../../api/superTenantCountries.api";
import AddCurrencyModal from "./AddCurrencyModal";
import { 
  X, 
  Plus, 
  Coins, 
  CheckCircle2, 
  Ban, 
  Power, 
  Star,
  SearchX
} from "lucide-react";

const TenantCountryCurrencies = ({ tenantId, country, onClose }) => {
  const [currencies, setCurrencies] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getTenantCountryCurrencies(tenantId, country.country_code);
      setCurrencies(res.data);
    } catch (err) {
      console.error("Failed to load currencies", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (c) => {
    try {
      await updateTenantCountryCurrency(
        tenantId,
        country.country_code,
        c.currency_id,
        { is_active: !c.is_active }
      );
      load();
    } catch (err) {
      alert("Failed to update currency status");
    }
  };

  const setDefault = async (c) => {
    try {
      await updateTenantCountryCurrency(
        tenantId,
        country.country_code,
        c.currency_id,
        { is_default: true }
      );
      load();
    } catch (err) {
      alert("Failed to set default currency");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-gray-900 border border-gray-800 rounded-[2rem] w-full max-w-4xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-800 flex justify-between items-start bg-black/20">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500">
              <Coins size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Regional Finance</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                Managing currencies for <span className="text-white">{country.country_name}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-white transition-colors cursor-pointer p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Currency List</h3>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={16} strokeWidth={3} /> Add Currency
            </button>
          </div>

          <div className="bg-black border border-gray-800 rounded-2xl overflow-hidden shadow-inner">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-900/50 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800">
                  <th className="px-6 py-4">Currency Name</th>
                  <th className="px-6 py-4 text-center">ISO Code</th>
                  <th className="px-6 py-4 text-center">Primary</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {currencies.map((c) => (
                  <tr key={c.currency_id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-bold text-white text-sm">{c.currency_name}</span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="font-mono text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">
                          {c.currency_code}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      {c.is_default ? (
                        <div className="inline-flex items-center gap-1 text-green-500 bg-green-500/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-500/20">
                            <CheckCircle2 size={12} /> Default
                        </div>
                      ) : (
                        <span className="text-gray-600 text-xs">-</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                        c.is_active 
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20" 
                          : "bg-red-500/10 text-red-500 border-red-500/20"
                      }`}>
                        {c.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {!c.is_default && (
                          <button
                            onClick={() => setDefault(c)}
                            className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-gray-700 transition-all font-bold text-[10px] uppercase cursor-pointer"
                            title="Set as Default"
                          >
                            <Star size={12} /> Make Default
                          </button>
                        )}
                        <button
                          onClick={() => toggle(c)}
                          className={`p-2 rounded-lg border transition-all cursor-pointer ${
                            c.is_active 
                            ? "bg-red-600/10 text-red-500 border-red-600/20 hover:bg-red-600 hover:text-white" 
                            : "bg-green-600/10 text-green-500 border-green-600/20 hover:bg-green-600 hover:text-white"
                          }`}
                          title={c.is_active ? "Disable" : "Enable"}
                        >
                          {c.is_active ? <Ban size={14} /> : <Power size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!loading && currencies.length === 0 && (
                <div className="p-12 text-center flex flex-col items-center">
                    <SearchX className="text-gray-800 mb-3" size={40} />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No currencies configured yet</p>
                </div>
            )}
          </div>
        </div>
      </div>

      {showAdd && (
        <AddCurrencyModal
          tenantId={tenantId}
          countryCode={country.country_code}
          onClose={() => setShowAdd(false)}
          onSuccess={load}
        />
      )}
    </div>
  );
};

export default TenantCountryCurrencies;