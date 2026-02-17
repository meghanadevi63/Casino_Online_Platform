import { useState, useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

const AdminLayout = () => {
  const { user, loadingUser } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loadingUser) return <div className="min-h-screen bg-black" />;
  
  // Security: role_id 2 = TENANT_ADMIN
  if (!user || user.role_id !== 2) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0f1b]">
        <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto relative custom-scrollbar">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
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

export default AdminLayout;