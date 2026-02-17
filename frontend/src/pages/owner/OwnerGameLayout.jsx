import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Globe, Coins, Gamepad2, Settings2 } from "lucide-react";

const OwnerGameLayout = () => {
  const navigate = useNavigate();
  const { gameId } = useParams(); 

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-800 pb-8">
        <div className="flex items-center gap-4">
          <div className="bg-yellow-500/20 p-3 rounded-2xl">
            <Settings2 className="text-yellow-500" size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Game Configuration</h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[3px] mt-2">Regional & Financial Restrictions</p>
          </div>
        </div>
        <button 
          onClick={() => navigate("/owner/games")} 
          className="flex items-center gap-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-400 hover:text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Library
        </button>
      </div>

      {/* TABS (Segmented Control Style) */}
      <div>
        <div className="inline-flex items-center gap-1 bg-gray-900 p-1.5 rounded-xl border border-gray-800">
          <NavLink 
            to="countries" 
            className={({isActive}) => `
              flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all
              ${isActive 
                ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20" 
                : "text-gray-500 hover:text-white hover:bg-gray-800"
              }
            `}
          >
            <Globe size={14} /> Allowed Countries
          </NavLink>
          
          <NavLink 
            to="currencies" 
            className={({isActive}) => `
              flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all
              ${isActive 
                ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20" 
                : "text-gray-500 hover:text-white hover:bg-gray-800"
              }
            `}
          >
            <Coins size={14} /> Allowed Currencies
          </NavLink>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Outlet />
      </div>
    </div>
  );
};

export default OwnerGameLayout;