import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Menu, ShieldCheck, Globe, Settings } from "lucide-react";

const OwnerTopbar = ({ onMenuClick }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-gray-900/50 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 flex-shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden text-white p-1 hover:bg-gray-800 rounded transition-colors cursor-pointer">
          <Menu size={24} />
        </button>
        <div className="hidden sm:flex items-center gap-2">
           <div className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[2px]">
             Platform Master Control
           </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Global Network Status Pill */}
        <div className="hidden md:flex items-center gap-2 bg-black/40 border border-gray-700 px-4 py-1.5 rounded-full mr-2">
           <Globe size={14} className="text-green-500" />
           <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Network Nodes Online</span>
        </div>

        {/* Profile Avatar */}
        <div 
          onClick={() => navigate("/owner/profile")} // ✅ Changed to point to profile
          className="w-10 h-10 rounded-full bg-yellow-600 border border-gray-700 flex items-center justify-center text-xs font-black text-white ring-2 ring-transparent hover:ring-yellow-500/50 transition-all cursor-pointer overflow-hidden uppercase"
        >
          {user?.email?.[0]}
        </div>
      </div>
    </header>
  );
};

export default OwnerTopbar;