import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getGameCountries, updateGameCountry } from "../../api/superGameSettings.api";
import { 
  Globe, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  Ban, 
  MapPin,
  XCircle 
} from "lucide-react";

const OwnerGameCountries = () => {
  const { gameId } = useParams();
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingCode, setUpdatingCode] = useState(null);

  // Filter States
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadData();
  }, [gameId]);

  const loadData = async () => {
    try {
      const res = await getGameCountries(gameId);
      setCountries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (country) => {
    try {
      setUpdatingCode(country.country_code);
      await updateGameCountry(gameId, country.country_code, !country.is_allowed);
      await loadData();
    } catch (err) {
      alert("Failed to update country status");
    } finally {
      setUpdatingCode(null);
    }
  };

  // Client-side Filtering
  const filteredCountries = useMemo(() => {
    return countries.filter(c => {
      const matchesSearch = c.country_name.toLowerCase().includes(search.toLowerCase()) || 
                            c.country_code.toLowerCase().includes(search.toLowerCase());
      
      const matchesFilter = filterStatus === "all" 
        ? true 
        : filterStatus === "allowed" ? c.is_allowed : !c.is_allowed;

      return matchesSearch && matchesFilter;
    });
  }, [countries, search, filterStatus]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <RefreshCw className="animate-spin mb-2" size={32} />
      <p className="text-[10px] font-black uppercase tracking-[4px]">Loading Regions...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* CONTROL BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-900 p-4 rounded-2xl border border-gray-800">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            placeholder="Search country or ISO code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-yellow-500 outline-none transition-all placeholder:text-gray-600"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 pointer-events-none" size={18} />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-yellow-500 outline-none appearance-none cursor-pointer"
          >
            <option value="all">All Regions</option>
            <option value="allowed">Allowed Only</option>
            <option value="restricted">Restricted Only</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-black/20">
          <div className="flex items-center gap-2">
             <Globe size={18} className="text-yellow-500" />
             <h3 className="text-sm font-black text-white uppercase tracking-widest">Regional Access</h3>
          </div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            {filteredCountries.length} Locations
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/50 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-800">
                <th className="px-6 py-4">Country Name</th>
                <th className="px-6 py-4">ISO Code</th>
                <th className="px-6 py-4 text-center">Access Status</th>
                <th className="px-6 py-4 text-right">Toggle Permission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredCountries.map((c) => (
                <tr key={c.country_code} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <MapPin size={16} className="text-gray-600 group-hover:text-yellow-500 transition-colors" />
                        <span className="text-sm font-bold text-white">{c.country_name}</span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-gray-400 bg-black/40 px-2 py-1 rounded border border-gray-700">
                        {c.country_code}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                      c.is_allowed 
                        ? "bg-green-500/10 text-green-500 border-green-500/20" 
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                    }`}>
                      {c.is_allowed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {c.is_allowed ? "Allowed" : "Restricted"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleToggle(c)}
                      disabled={updatingCode === c.country_code}
                      className={`min-w-[100px] py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border ${
                        c.is_allowed 
                          ? "bg-gray-800 text-gray-400 border-gray-700 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50" 
                          : "bg-yellow-500 text-black border-yellow-500 hover:bg-yellow-400"
                      } disabled:opacity-50`}
                    >
                      {updatingCode === c.country_code ? (
                        <RefreshCw size={12} className="animate-spin mx-auto" />
                      ) : (
                        c.is_allowed ? "Restrict" : "Allow Access"
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCountries.length === 0 && (
            <div className="p-12 text-center">
                <Ban size={32} className="mx-auto text-gray-700 mb-3" />
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">No countries match your filter</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default OwnerGameCountries;