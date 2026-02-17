import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  ShoppingBag, 
  Gamepad2, 
  BarChart3, 
  LogOut, 
  X, 
  HandCoins, 
  Dices, 
  Bell,
  User,
  Gift,
  TrendingUp,
  Trophy,
  Zap
} from "lucide-react";

const AdminSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useContext(AuthContext);

  const navigationGroups = [
    {
      title: null, 
      links: [
        { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
        { 
          name: "Live Pulse", 
          path: "/admin/analytics/live", 
          icon: <Zap size={20}  /> 
        },
        { name: "Game Analytics", path: "/admin/analytics/games", icon: <BarChart3 size={20} /> },
      ]
    },
    {
      title: "Operations",
      links: [
        { name: "Players", path: "/admin/players", icon: <Users size={20} /> },
        { name: "KYC Requests", path: "/admin/kyc", icon: <ShieldCheck size={20} /> },
        { name: "Withdrawals Requests", path: "/admin/withdrawals", icon: <HandCoins size={20} /> },
      ]
    },
        {
      title: "Marketing", 
      links: [
        { name: "Bonus Campaigns", path: "/admin/bonuses", icon: <Gift size={20} /> },
        { name: "Player Progress", path: "/admin/bonus-progress", icon: <TrendingUp size={20} /> },
        { name: "Jackpot Raffle", path: "/admin/jackpots", icon: <Trophy size={20} /> },
      ]
    },
    {
      title: "Inventory",
      links: [
        { name: "Marketplace", path: "/admin/marketplace", icon: <ShoppingBag size={20} /> },
        { name: "Games Library", path: "/admin/games", icon: <Gamepad2 size={20} /> },
        { name: "My Requests", path: "/admin/requests", icon: <Bell size={20} /> },
      ]
    },
     {
      title: "My Account",
      links: [
        { name: "My Profile", path: "/admin/profile", icon: <User size={20} /> },
       
      ]
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" 
          onClick={onClose} 
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-50 transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static
      `}>
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <Dices className="text-yellow-500 flex-shrink-0" size={28} />
            <span className="text-lg font-bold text-white truncate tracking-tight">
              {user?.tenant_name || "ADMIN"}
            </span>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white transition-colors cursor-pointer">
            <X size={24} />
          </button>
        </div>

        {/* Navigation Area */}
        <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {navigationGroups.map((group, gIdx) => (
            <div key={gIdx} className="mb-6">
              {group.title && (
                <h3 className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-[2px] mb-2">
                  {group.title}
                </h3>
              )}
              <div className="space-y-1">
                {group.links.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={onClose}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                      ${isActive 
                        ? "bg-yellow-500 text-black font-bold shadow-lg shadow-yellow-500/20" 
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      }
                    `}
                  >
                    {link.icon}
                    <span className="text-sm">{link.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-gray-800 bg-gray-900 flex-shrink-0">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors font-medium text-sm cursor-pointer"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 10px; }
      `}</style>
    </>
  );
};

export default AdminSidebar;