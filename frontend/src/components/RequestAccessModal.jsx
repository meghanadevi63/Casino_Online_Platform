import { useState } from "react";
import { requestAccess } from "../api/adminMarketplace.api";

const RequestAccessModal = ({ game, onClose }) => {
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    try {
      setLoading(true);
      
      
      const payload = { 
        provider_id: game.provider_id, 
        proposed_start_date: date || null 
      };

      await requestAccess(payload);
      
      alert("Request sent! Waiting for Super Admin approval.");
      onClose();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl w-96 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-2">Request {game.provider_name}</h3>
        <p className="text-sm text-gray-400 mb-4">
          To enable <b>{game.game_name}</b>, you need a contract with <b>{game.provider_name}</b>.
        </p>

        <label className="text-xs text-gray-500 block mb-1">Proposed Contract Start</label>
        <input 
          type="date" 
          className="w-full bg-black border border-gray-700 p-2 rounded text-white mb-6 focus:border-blue-500 outline-none"
          style={{colorScheme: "dark"}}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="text-gray-400 hover:text-white text-sm">Cancel</button>
          <button 
            onClick={handleRequest} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold text-sm transition"
          >
            {loading ? "Sending..." : "Send Request"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default RequestAccessModal;