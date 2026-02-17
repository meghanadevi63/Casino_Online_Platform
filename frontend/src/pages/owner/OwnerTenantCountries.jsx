import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  getTenantCountries,
  updateTenantCountry,
} from "../../api/superTenantCountries.api";
import AddTenantCountryModal from "./AddTenantCountryModal";
import TenantCountryCurrencies from "./TenantCountryCurrencies";
import { 
  Globe, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  Ban, 
  Power, 
  Coins, 
  Search, 
  SearchX,
  Settings2
} from "lucide-react";

const OwnerTenantCountries = () => {
  const { tenantId } = useParams();
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [updatingCode, setUpdatingCode] = useState(null);
  const [search, setSearch] = useState("");

  const loadCountries = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTenantCountries(tenantId);
      setCountries(res.data);
    } catch (err) {
      console.error("Failed to load countries", err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  const toggleCountry = async (country) => {
    try {
        setUpdatingCode(country.country_code);
        await updateTenantCountry(tenantId, country.country_code, {
            is_active: !country.is_active,
        });
        loadCountries();
    } finally {
        setUpdatingCode(null);
    }
  };

  const filteredCountries = useMemo(() => {
    return countries.filter(c =>
      c.country_name.toLowerCase().includes(search.toLowerCase()) ||
      c.country_code.toLowerCase().includes(search.toLowerCase())
    );
  }, [countries, search]);

  if (loading && countries.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <RefreshCw className="animate-spin mb-2" size={32} />
      <p className="font-bold text-xs uppercase tracking-widest">Loading Regions...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Globe className="text-yellow-500" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-white">Regional Presence</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Manage countries and currencies</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 cursor-pointer"
        >
          <Plus size={18} strokeWidth={3} /> Add Region
        </button>
      </div>

      <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 shadow-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            placeholder="Search by country name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-yellow-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-black/50 text-xs font-bold text-gray-500 border-b border-gray-800 uppercase tracking-widest">
                <th className="px-6 py-4">Country</th>
                <th className="px-6 py-4 hidden sm:table-cell">Default Currency</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredCountries.map((c) => (
                <tr key={c.country_code} className="hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="font-bold text-white text-sm">{c.country_name}</div>
                      <div className="text-xs font-mono text-gray-600">({c.country_code})</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-2 text-sm text-yellow-500 font-mono font-bold">
                        {c.currency_code}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                      c.is_active
                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                    }`}>
                      {c.is_active ? <CheckCircle2 size={10} /> : <Ban size={10} />}
                      {c.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelectedCountry(c)}
                        className="p-2 bg-gray-800 hover:bg-gray-700 text-yellow-500 rounded-lg border border-gray-700 transition-all cursor-pointer"
                        title="Manage Currencies"
                      >
                        <Coins size={16} />
                      </button>
                      <button
                        onClick={() => toggleCountry(c)}
                        disabled={updatingCode === c.country_code}
                        className={`p-2 rounded-lg border transition-all cursor-pointer ${
                          c.is_active 
                          ? "bg-red-600/10 text-red-500 border-red-600/20 hover:bg-red-600 hover:text-white" 
                          : "bg-green-600/10 text-green-500 border-green-600/20 hover:bg-green-600 hover:text-white"
                        } disabled:opacity-30`}
                      >
                        {updatingCode === c.country_code ? <RefreshCw size={16} className="animate-spin" /> : <Power size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCountries.length === 0 && !loading && (
          <div className="p-20 text-center flex flex-col items-center">
            <SearchX className="text-gray-800 mb-4" size={48} />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No matching countries found</p>
          </div>
        )}
      </div>

      {showAdd && (
        <AddTenantCountryModal
          tenantId={tenantId}
          existingCountries={countries}
          onClose={() => setShowAdd(false)}
          onSuccess={loadCountries}
        />
      )}

      {selectedCountry && (
        <TenantCountryCurrencies
          tenantId={tenantId}
          
          country={selectedCountry}
          onClose={() => setSelectedCountry(null)}
        />
      )}
    </div>
  );
};

export default OwnerTenantCountries;