import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Menu, User, Settings, Bell, X } from "lucide-react";

const AdminTopbar = ({ onMenuClick }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-gray-900/50 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 flex-shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden text-white p-1 hover:bg-gray-800 rounded transition-colors cursor-pointer">
          <Menu size={24} />
        </button>
        <h2 className="text-gray-400 hidden sm:block text-sm font-medium">
          Management Console: <span className="text-white font-bold">{user?.tenant_name}</span>
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Admin Notification / Status */}
        <div className="hidden md:flex items-center gap-2 bg-black/40 border border-gray-700 px-4 py-1.5 rounded-full mr-2">
           <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Admin Mode Active</span>
        </div>

        {/* Profile Avatar - Updated Navigation */}
        <div 
          onClick={() => navigate("/admin/profile")}
          className="w-9 h-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 ring-2 ring-transparent hover:ring-yellow-500/50 transition-all cursor-pointer overflow-hidden"
        >
          {user?.first_name?.[0]}{user?.last_name?.[0]}
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;