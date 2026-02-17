import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSuperTenant } from "../../api/superTenants.api";

const OwnerCreateTenant = () => {
  const navigate = useNavigate();

  const [tenantName, setTenantName] = useState("");
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tenantName.trim()) {
      setError("Tenant name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createSuperTenant({
        tenant_name: tenantName,
        domain: domain || null,
      });

      navigate("/owner/tenants");
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Failed to create tenant"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">
        ➕ Create Tenant
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4"
      >
        {error && (
          <div className="bg-red-900 border border-red-600 p-3 rounded text-sm">
            🚫 {error}
          </div>
        )}

        <div>
          <label className="text-sm text-gray-400 block mb-1">
            Tenant Name *
          </label>
          <input
            value={tenantName}
            onChange={(e) => setTenantName(e.target.value)}
            className="w-full bg-black border border-gray-700 px-3 py-2 rounded"
            placeholder="e.g. Royal Casino"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 block mb-1">
            Domain (optional)
          </label>
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full bg-black border border-gray-700 px-3 py-2 rounded"
            placeholder="royalcasino.com"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Tenant"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/owner/tenants")}
            className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default OwnerCreateTenant;
