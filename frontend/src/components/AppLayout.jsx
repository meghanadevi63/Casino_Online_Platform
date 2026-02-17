import { useState, useContext } from "react";
import { Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import PlayerSidebar from "./PlayerSidebar";
import PlayerTopbar from "./PlayerTopbar";

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useContext(AuthContext);

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <PlayerSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        logout={logout}
      />

      {/* Main UI Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0f1b]">
        {/* Top bar with balance & menu toggle */}
        <PlayerTopbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto relative">
          {/* Outlet renders the Dashboard, Games, History etc */}
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;