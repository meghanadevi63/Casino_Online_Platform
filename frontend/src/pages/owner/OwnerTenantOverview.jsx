import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTenantOverview } from "../../api/superTenantAdmins.api";
import { 
  Users, 
  Activity, 
  Gamepad2, 
  Cpu, 
  Calendar, 
  Hash, 
  RefreshCw
} from "lucide-react";

const OwnerTenantOverview = () => {
  const { tenantId } = useParams();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOverview = async () => {
    setLoading(true);
    try {
      const res = await getTenantOverview(tenantId);
      setOverview(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, [tenantId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <RefreshCw className="animate-spin mb-2" size={32} />
      <p className="font-bold text-xs uppercase tracking-widest">Loading Data...</p>
    </div>
  );

  if (!overview) return <div className="text-red-500 p-10 font-bold">Failed to load overview.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      
      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Players" 
          value={overview.total_players} 
          icon={<Users size={20} />} 
          color="text-blue-400" 
        />
        <StatCard 
          label="Active Now" 
          value={overview.active_players} 
          icon={<Activity size={20} />} 
          color="text-green-400" 
        />
        <StatCard 
          label="Games Live" 
          value={overview.total_games} 
          icon={<Gamepad2 size={20} />} 
          color="text-yellow-400" 
        />
        <StatCard 
          label="Providers" 
          value={overview.total_providers} 
          icon={<Cpu size={20} />} 
          color="text-purple-400" 
        />
      </div>

      {/* METADATA SECTION */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-sm">
        <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6 border-b border-gray-800 pb-2">System Metadata</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Identity */}
            <div className="flex items-center gap-4">
                <div className="bg-black border border-gray-800 p-3 rounded-xl text-gray-400">
                    <Hash size={24} />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">System UUID</p>
                    <p className="text-sm font-mono text-white">
                        {overview.tenant_id}
                    </p>
                </div>
            </div>

            {/* Timestamps */}
            <div className="flex items-center gap-4">
                <div className="bg-black border border-gray-800 p-3 rounded-xl text-gray-400">
                    <Calendar size={24} />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Onboarding Date</p>
                    <p className="text-sm font-bold text-white">
                        {new Date(overview.created_at).toLocaleDateString(undefined, { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </p>
                </div>
            </div>
        </div>
      </div>

    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-sm hover:border-gray-700 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</p>
      <div className={`p-2 bg-black rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
    <p className={`text-3xl font-black ${color} tracking-tight`}>{value.toLocaleString()}</p>
  </div>
);

export default OwnerTenantOverview;