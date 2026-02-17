import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getGameCurrencies, updateGameCurrency } from "../../api/superGameSettings.api";
import { 
  Coins, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Banknote, 
  Search,
  Ban
} from "lucide-react";

const OwnerGameCurrencies = () => {
  const { gameId } = useParams();
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  
  // Filter State
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, [gameId]);

  const loadData = async () => {
    try {
      const res = await getGameCurrencies(gameId);
      setCurrencies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (curr) => {
    try {
      setUpdatingId(curr.currency_id);
      await updateGameCurrency(gameId, curr.currency_id, !curr.is_allowed);
      await loadData();
    } catch (err) {
      alert("Failed to update currency status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Client-side Filtering
  const filteredCurrencies = useMemo(() => {
    return currencies.filter(c => 
      c.currency_name.toLowerCase().includes(search.toLowerCase()) || 
      c.currency_code.toLowerCase().includes(search.toLowerCase())
    );
  }, [currencies, search]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <RefreshCw className="animate-spin mb-2" size={32} />
      <p className="text-[10px] font-black uppercase tracking-[4px]">Loading Finances...</p>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* CONTROL BAR */}
      <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            placeholder="Search currency name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-yellow-500 outline-none transition-all placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-gray-800 bg-black/20 flex justify-between items-center">
          <div className="flex items-center gap-2">
             <Coins size={18} className="text-yellow-500" />
             <h3 className="text-sm font-black text-white uppercase tracking-widest">Financial Access</h3>
          </div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            {filteredCurrencies.length} Currencies
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/50 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-800">
                <th className="px-6 py-4">Currency Name</th>
                <th className="px-6 py-4">ISO Code</th>
                <th className="px-6 py-4 text-center">Betting Status</th>
                <th className="px-6 py-4 text-right">Toggle Permission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredCurrencies.map((c) => (
                <tr key={c.currency_id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-800 rounded-lg text-green-500 group-hover:text-yellow-500 transition-colors">
                            <Banknote size={16} />
                        </div>
                        <span className="text-sm font-bold text-white">{c.currency_name}</span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">
                        {c.currency_code}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                      c.is_allowed 
                        ? "bg-green-500/10 text-green-500 border-green-500/20" 
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                    }`}>
                      {c.is_allowed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {c.is_allowed ? "Supported" : "Disabled"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleToggle(c)}
                      disabled={updatingId === c.currency_id}
                      className={`min-w-[100px] py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border ${
                        c.is_allowed 
                          ? "bg-gray-800 text-gray-400 border-gray-700 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50" 
                          : "bg-yellow-500 text-black border-yellow-500 hover:bg-yellow-400"
                      } disabled:opacity-50`}
                    >
                      {updatingId === c.currency_id ? (
                        <RefreshCw size={12} className="animate-spin mx-auto" />
                      ) : (
                        c.is_allowed ? "Disable" : "Enable"
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCurrencies.length === 0 && (
            <div className="p-12 text-center">
                <Ban size={32} className="mx-auto text-gray-700 mb-3" />
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">No currencies found</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default OwnerGameCurrencies;