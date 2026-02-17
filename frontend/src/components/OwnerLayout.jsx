import { useState, useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import OwnerSidebar from "./owner/OwnerSidebar";
import OwnerTopbar from "./owner/OwnerTopbar";

const OwnerLayout = () => {
  const { user, loadingUser } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loadingUser) return <div className="min-h-screen bg-black" />;
  
  // Security Check: role_id 4 = SUPER_ADMIN (Platform Owner)
  if (!user || user.role_id !== 4) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
      <OwnerSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0f1b]">
        <OwnerTopbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto relative custom-scrollbar">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            {/* Pages will render here */}
            <Outlet />
          </div>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4b5563; }
      `}</style>
    </div>
  );
};

export default OwnerLayout;