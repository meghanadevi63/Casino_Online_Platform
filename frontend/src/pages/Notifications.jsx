import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getNotifications, markAsRead } from "../api/notification.api";
import { Bell, Search, Filter, CheckCircle2, Clock, ShieldAlert, CreditCard, Trash2 ,Trophy} from "lucide-react";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifs(); }, []);

  const getTypeIcon = (type) => {
    switch (type) {
      case "KYC": return <ShieldAlert className="text-blue-400" size={18} />;
      case "WITHDRAWAL": return <CreditCard className="text-orange-400" size={18} />;
      case "DEPOSIT": return <CheckCircle2 className="text-green-400" size={18} />;
      case "JACKPOT":
      return <Trophy className="text-orange-400" size={18} />;
      default: return <Bell className="text-yellow-400" size={18} />;
    }
  };

  // Logic for filtering and searching
  const filtered = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                          n.message.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === "ALL" || n.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500/20 p-2 rounded-xl">
            <Bell className="text-yellow-500" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Notification Center</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Stay updated with your account</p>
          </div>
        </div>
        <button 
          onClick={fetchNotifs}
          className="text-[10px] font-black uppercase tracking-widest bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-all"
        >
          Refresh Feed
        </button>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 flex flex-wrap gap-2">
          {["ALL", "KYC", "WITHDRAWAL", "DEPOSIT","JACKPOT"].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                activeFilter === f ? "bg-yellow-500 text-black border-yellow-500" : "bg-gray-900 text-gray-500 border-gray-800 hover:border-gray-600"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text"
            placeholder="Search alerts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:border-yellow-500 outline-none"
          />
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-20 text-center text-gray-600 animate-pulse font-bold uppercase tracking-widest text-xs">Synchronizing alerts...</div>
        ) : filtered.length > 0 ? (
          filtered.map(n => (
            <div 
              key={n.notification_id}
              className={`group flex items-start gap-4 p-5 rounded-[1.5rem] border transition-all ${
                !n.is_read ? "bg-yellow-500/[0.03] border-yellow-500/20" : "bg-gray-900/40 border-gray-800 opacity-70 hover:opacity-100"
              }`}
            >
              <div className={`p-3 rounded-2xl ${!n.is_read ? 'bg-yellow-500/10' : 'bg-gray-800'}`}>
                {getTypeIcon(n.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`text-sm font-bold ${!n.is_read ? 'text-white' : 'text-gray-400'}`}>{n.title}</h3>
                  <span className="text-[9px] font-mono text-gray-600 font-bold uppercase">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">{n.message}</p>
                
                {!n.is_read && (
                  <button 
                    onClick={() => { markAsRead(n.notification_id); fetchNotifs(); }}
                    className="text-[9px] font-black uppercase tracking-widest text-yellow-500 hover:text-yellow-400 flex items-center gap-1"
                  >
                    <CheckCircle2 size={12} /> Mark as seen
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-gray-900 border border-dashed border-gray-800 rounded-[2rem] p-20 text-center">
            <Bell size={40} className="mx-auto text-gray-800 mb-4" />
            <p className="text-gray-600 text-sm font-medium italic">No notifications found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;