import { useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom"; 
import { getWalletsByPlayerId } from "../api/wallet.api";
import { Bell, Menu, Wallet, Plus, X, Clock, ChevronRight } from "lucide-react";
import DepositModal from "./DepositModal";
import { getNotifications, markAsRead } from "../api/notification.api";

const PlayerTopbar = ({ onMenuClick }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate(); 
  const [balance, setBalance] = useState(0);
  const [showDeposit, setShowDeposit] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchNotifs = useCallback(async () => {
    if (!user) return;
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch notifications:", err);
    }
  }, [user]);

  const handleMarkAsRead = async (notifId) => {
    try {
      await markAsRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.notification_id === notifId ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBalanceFromServer = useCallback(async () => {
    if (user?.user_id) {
      try {
        const res = await getWalletsByPlayerId(user.user_id);
        const cash = res.data.find((w) => w.wallet_type === "CASH");
        setBalance(cash?.balance || 0);
      } catch (err) {
        console.error("Wallet load failed", err);
      }
    }
  }, [user?.user_id]);

  useEffect(() => {
    fetchBalanceFromServer();
    fetchNotifs();

    const handleBalanceUpdate = (event) => {
      if (event.detail?.newBalance !== undefined) {
        setBalance(event.detail.newBalance);
      } else {
        fetchBalanceFromServer();
      }
      fetchNotifs();
    };

    window.addEventListener("balanceUpdated", handleBalanceUpdate);
    return () => window.removeEventListener("balanceUpdated", handleBalanceUpdate);
  }, [fetchBalanceFromServer, fetchNotifs]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <header className="h-16 bg-gray-900/50 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden text-white p-1 hover:bg-gray-800 rounded">
          <Menu size={24} />
        </button>
        <h2 className="text-gray-400 hidden sm:block text-sm font-medium">
          Casino: <span className="text-white">{user?.tenant_name}</span>
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* NOTIFICATION BELL */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`p-2.5 rounded-full transition-all relative ${
              showDropdown ? "bg-yellow-500 text-black" : "text-gray-400 hover:text-white bg-gray-800/50"
            }`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-600 text-[10px] font-black text-white rounded-full flex items-center justify-center ring-2 ring-gray-900 animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40 bg-black/40 lg:bg-transparent" onClick={() => setShowDropdown(false)}></div>
              
              <div className="fixed inset-x-4 top-20 sm:absolute sm:inset-x-auto sm:right-0 sm:w-80 bg-gray-900 border border-gray-800 rounded-[2rem] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/20">
                  <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Live Updates</span>
                  <button onClick={() => setShowDropdown(false)} className="text-gray-500 hover:text-white lg:hidden">
                    <X size={18} />
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((n) => (
                      <div
                        key={n.notification_id}
                        className={`p-4 border-b border-gray-800/50 hover:bg-white/[0.02] transition-colors cursor-pointer relative ${
                          !n.is_read ? "bg-yellow-500/[0.03]" : "opacity-60"
                        }`}
                        onClick={() => {
                          handleMarkAsRead(n.notification_id);
                          setShowDropdown(false);
                          navigate("/notifications"); // Go to full view
                        }}
                      >
                        {!n.is_read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500"></div>}
                        <p className={`text-xs mb-1 ${!n.is_read ? "font-bold text-white" : "text-gray-400"}`}>{n.title}</p>
                        <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-1">{n.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-gray-600 text-xs italic">No new messages</div>
                  )}
                </div>

                {/*  VIEW ALL LINK */}
                <Link 
                  to="/notifications" 
                  onClick={() => setShowDropdown(false)}
                  className="p-3 text-center block text-[10px] font-black uppercase tracking-widest text-yellow-500 hover:bg-yellow-500 hover:text-black transition-colors"
                >
                  View All Notifications
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Balance Display */}
        <div className="flex items-center bg-black/40 border border-gray-700 rounded-full pl-4 pr-1 py-1 gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-gray-500 font-bold uppercase leading-none">Balance</span>
            <span className="text-sm font-mono font-bold text-yellow-400">
              {user?.currency_symbol} {Number(balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <button
            onClick={() => setShowDeposit(true)}
            className="bg-yellow-500 hover:bg-yellow-400 text-black p-1.5 rounded-full transition-transform active:scale-90"
          >
            <Plus size={16} strokeWidth={3} />
          </button>
        </div>

        {/* PROFILE AVATAR (Now uses navigate) */}
        <div 
          onClick={() => navigate("/profile")}
          className="w-9 h-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 ring-2 ring-transparent hover:ring-yellow-500/50 transition-all cursor-pointer"
        >
          {user?.first_name?.[0]}{user?.last_name?.[0]}
        </div>
      </div>

      {showDeposit && (
        <DepositModal
          onSuccess={() => {
            setShowDeposit(false);
            window.dispatchEvent(new CustomEvent("balanceUpdated"));
          }}
          onClose={() => setShowDeposit(false)}
        />
      )}
    </header>
  );
};

export default PlayerTopbar;