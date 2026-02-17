import { useEffect, useState, useCallback, useContext } from "react";
import { AuthContext } from "../context/AuthContext"; 
import { getTransactionHistory } from "../api/wallet.api";
import { ArrowRightLeft, Search, Calendar, Filter, RefreshCw, X } from "lucide-react";

const Transactions = () => {
    const { user } = useContext(AuthContext); 
    const [txns, setTxns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Filter States
    const [days, setDays] = useState(""); // Range (Last 7, 30 days)
    const [specificDate, setSpecificDate] = useState(""); // Specific YYYY-MM-DD
    const [type, setType] = useState("");

    // Derived currency data with fallbacks
    const currencySymbol = user?.currency_symbol || "₹";
    const currencyCode = user?.currency_code || "INR";

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            
            if (specificDate) {
                params.specific_date = specificDate; 
            } else if (days) {
                params.days = days;
            }

            if (type) params.txn_type = type;

            const res = await getTransactionHistory(params);
            setTxns(res.data);
        } catch (err) {
            console.error("Error loading transactions:", err);
        } finally {
            setLoading(false);
        }
    }, [days, specificDate, type]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const resetFilters = () => {
        setSearch("");
        setDays("");
        setSpecificDate("");
        setType("");
    };

    const filteredTxns = txns.filter(t =>
        t.transaction_id.toLowerCase().includes(search.toLowerCase()) ||
        t.type.toLowerCase().includes(search.toLowerCase())
    );

    const isNegative = (type) => ["BET", "WITHDRAWAL","JACKPOT_ENTRY"].includes(type.toUpperCase());

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500">
                        <ArrowRightLeft size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Transaction Ledger</h1>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Financial History & Tracking</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-2 bg-gray-800/50 hover:bg-gray-800 text-gray-400 px-4 py-2 rounded-xl transition-all text-sm"
                    >
                        <X size={16} />
                        Clear
                    </button>
                    <button
                        onClick={loadData}
                        className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 py-2 rounded-xl transition-all active:scale-95 text-sm"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        {loading ? "Syncing..." : "Refresh"}
                    </button>
                </div>
            </div>

            {/* FILTERS BAR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-900/50 p-4 rounded-2xl border border-gray-800 shadow-lg">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search ID or Type..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-black border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-yellow-500 outline-none transition-all"
                    />
                </div>

                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 pointer-events-none" size={18} />
                    <input 
                        type="date"
                        value={specificDate}
                        onChange={(e) => {
                            setSpecificDate(e.target.value);
                            setDays(""); 
                        }}
                        style={{ colorScheme: 'dark' }}
                        className="w-full bg-black border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-yellow-500 outline-none transition-all"
                    />
                </div>

                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 pointer-events-none" size={18} />
                    <select
                        value={days}
                        onChange={(e) => {
                            setDays(e.target.value);
                            setSpecificDate(""); 
                        }}
                        className="w-full bg-black border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-yellow-500 outline-none appearance-none cursor-pointer"
                    >
                        <option value="">Range: All Time</option>
                        <option value="1">Last 24 Hours</option>
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                    </select>
                </div>

                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 pointer-events-none">
                        <ArrowRightLeft size={18} />
                    </div>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full bg-black border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-yellow-500 outline-none appearance-none cursor-pointer"
                    >
                        <option value="">All Types</option>
                        <option value="DEPOSIT">Deposits</option>
                        <option value="WITHDRAWAL">Withdrawals</option>
                        <option value="BET">Bets</option>
                        <option value="WIN">Wins</option>
                        <option value="WITHDRAWAL_REFUND">Withdrawals Refunds</option>
                        <option value="BONUS_CONVERSION">Bonus Conversion</option>
                        <option value="JACKPOT_WIN">Jackpot Wins</option>
                        <option value="JACKPOT_ENTRY">Jackpot Entries</option>
                    </select>
                </div>
            </div>

            {/* DATA TABLE CONTAINER */}
            <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-black/50 text-[10px] uppercase font-bold text-gray-500 tracking-[2px] border-b border-gray-800">
                                <th className="px-6 py-5">Timestamp</th>
                                <th className="px-6 py-5">Transaction ID</th>
                                <th className="px-6 py-5">Type</th>
                                <th className="px-6 py-5 text-right">Amount</th>
                                <th className="px-6 py-5 text-right">Balance After</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {filteredTxns.map((t) => {
                                const neg = isNegative(t.type);
                                return (
                                    <tr key={t.transaction_id} className="hover:bg-yellow-500/[0.03] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-white font-medium">
                                                {new Date(t.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="text-[10px] text-gray-500 font-mono">
                                                {new Date(t.created_at).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-[10px] text-gray-500 group-hover:text-gray-300 transition-colors">
                                            {t.transaction_id}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider ${
                                                neg ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                                                    : "bg-green-500/10 text-green-500 border border-green-500/20"
                                                }`}>
                                                {t.type}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-right font-mono font-bold text-base ${neg ? "text-red-400" : "text-green-400"}`}>
                                            {neg ? "-" : "+"}{Math.abs(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-sm text-gray-300">
                                            {/* Dynamic currency symbol used here */}
                                            {currencySymbol}{t.balance_after.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="p-24 text-center flex flex-col items-center justify-center gap-4 bg-gray-900/80 absolute inset-0 z-10">
                        <RefreshCw className="text-yellow-500 animate-spin" size={40} />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing transactions...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredTxns.length === 0 && (
                    <div className="p-24 text-center">
                        <div className="bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <ArrowRightLeft className="text-gray-600" size={32} />
                        </div>
                        <h3 className="text-white font-bold text-lg">No Results Found</h3>
                    </div>
                )}
            </div>
            
            {/* FOOTER INFO */}
            <div className="flex justify-between items-center text-[10px] text-gray-600 font-bold uppercase tracking-widest px-2">
                <span>Displaying last 100 records</span>
                {/* Dynamic currency code used here */}
                <span>All values in {currencyCode} ({currencySymbol})</span>
            </div>
        </div>
    );
};

export default Transactions;