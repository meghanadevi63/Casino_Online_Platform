import { useState } from "react";
import { createGameProvider } from "../../api/superGameProviders.api";

const AddGameProviderModal = ({ onClose, onSuccess }) => {
  const [providerName, setProviderName] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!providerName.trim()) return;

    try {
      setLoading(true);
      await createGameProvider({
        provider_name: providerName,
        website,
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to add provider");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-yellow-400 mb-4">
          Add Game Provider
        </h2>

        <input
          placeholder="Provider Name"
          value={providerName}
          onChange={(e) => setProviderName(e.target.value)}
          className="w-full bg-black border border-gray-700 px-3 py-2 rounded mb-3"
        />

        <input
          placeholder="Website (optional)"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="w-full bg-black border border-gray-700 px-3 py-2 rounded mb-4"
        />

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-gray-700 px-4 py-2 rounded"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={handleSubmit}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded font-semibold"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddGameProviderModal;
