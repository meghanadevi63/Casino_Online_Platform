import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  LayoutDashboard,
  Gamepad2,
  History,
  ShieldCheck,
  FileCheck2,
  LogOut,
  X,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowRightLeft,
  Lock,
  Dices,
  User,
  Bell,
  Gift,
  Trophy
} from "lucide-react";

const PlayerSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useContext(AuthContext);

  // Business Logic: Check if withdraw is allowed
  const isKycVerified = user?.kyc_status === "verified";

  const navigationGroups = [
    {
      title: null, 
      links: [
        { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
        { name: "Game Lobby", path: "/games", icon: <Gamepad2 size={20} /> },
        { name: "Jackpot Hub", path: "/jackpots", icon: <Trophy size={20} /> },
        { name: "Notifications", path: "/notifications", icon: <Bell size={20} /> },
      ]
    },
    {
      title: "Finance",
      links: [
        { name: "Deposit", path: "/deposit", icon: <ArrowUpCircle size={20} /> },
        {
          name: "Withdraw",
          path: isKycVerified ? "/withdraw" : "#",
          icon: <ArrowDownCircle size={20} />,
          disabled: !isKycVerified,
          note: "Requires KYC"
        },
        { name: "Promotions", path: "/promotions", icon: <Gift size={20} /> },
      
      ]
    },
    {
      title: "Activity",
      links: [
        { name: "Game History", path: "/history", icon: <History size={20} /> },
        { name: "Transactions", path: "/transactions", icon: <ArrowRightLeft size={20} /> },
      ]
    },
    {
      title: "Account",
      links: [
        { name: "KYC Status", path: "/kyc", icon: <FileCheck2 size={20} /> },
        { name: "Responsible Gaming", path: "/responsible-gaming", icon: <ShieldCheck size={20} /> },
        { name: "Profile", path: "/profile", icon: <User size={20} /> },
        
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

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-50 transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static
      `}>
      
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <Dices className="text-yellow-500 flex-shrink-0" size={28} />
            <span className="text-lg font-bold text-white truncate tracking-tight">
              {user?.tenant_name || "CASINO"}
            </span>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white transition-colors">
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
                    onClick={(e) => {
                      if (link.disabled) {
                        e.preventDefault();
                        return;
                      }
                      onClose(); // Close mobile drawer
                    }}
                    className={({ isActive }) => `
                      relative flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
                      ${link.disabled ? "opacity-40 cursor-not-allowed grayscale" : ""}
                      ${isActive && !link.disabled
                        ? "bg-yellow-500 text-black font-bold shadow-lg shadow-yellow-500/20"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {link.icon}
                      <span className="text-sm">{link.name}</span>
                    </div>

                    {link.disabled && (
                      <Lock size={14} className="text-gray-500" />
                    )}

                    {/* Tooltip for disabled items */}
                    {link.disabled && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-red-600 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                        {link.note}
                      </div>
                    )}
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
            className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors font-medium text-sm"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 10px;
        }
      `}</style>
    </>
  );
};

export default PlayerSidebar;