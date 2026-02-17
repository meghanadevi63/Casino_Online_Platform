import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { 
  LayoutDashboard, 
  Building2, 
  Gamepad2, 
  BarChart3, 
  LogOut, 
  X, 
  Box, 
  ShieldAlert, 
  Cpu, 
  Bell,
  User,
  Mail
} from "lucide-react";

const OwnerSidebar = ({ isOpen, onClose }) => {
  const { logout } = useContext(AuthContext);

  const navigationGroups = [
    {
      title: null, 
      links: [
        { name: "Global Overview", path: "/owner", icon: <LayoutDashboard size={20} /> },
        { name: "Access Requests", path: "/owner/requests", icon: <Bell size={20} /> },
      ]
    },
    {
      title: "Partners",
      links: [
         { name: "Partnership Leads", path: "/owner/inquiries", icon: <Mail size={20} /> },
        { name: "Tenants (Casinos)", path: "/owner/tenants", icon: <Building2 size={20} /> },
        { name: "Game Providers", path: "/owner/game-providers", icon: <Cpu size={20} /> },
      ]
    },
    {
      title: "Global Catalog",
      links: [
        { name: "Master Games", path: "/owner/games", icon: <Gamepad2 size={20} /> },
      ]
    },
    {
      title: "Intelligence",
      links: [
        { name: "Tenant Analytics", path: "/owner/analytics/tenants", icon: <BarChart3 size={20} /> },
        { name: "Game Performance", path: "/owner/analytics/games", icon: <Box size={20} /> },
      ]
    },
        {
      title: "My Account",
      links: [
        { name: "My Profile", path: "/owner/profile", icon: <User size={20} /> }
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
            <ShieldAlert className="text-yellow-500 flex-shrink-0" size={28} />
            <span className="text-lg font-bold text-white truncate tracking-tight">
              Core<span className="text-yellow-500"> Admin</span>
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
                    end={link.path === "/owner"}
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

        {/* Footer Area */}
        <div className="p-4 border-t border-gray-800 bg-gray-900 flex-shrink-0">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium text-sm cursor-pointer"
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

export default OwnerSidebar;