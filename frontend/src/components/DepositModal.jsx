import { useState } from "react";
import { depositToWallet } from "../api/wallet.api";

const DepositModal = ({ onSuccess, onClose }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDeposit = async () => {
    if (!amount || Number(amount) <= 0) {
      setError("Enter a valid amount");
      return;
    }

    setLoading(true);
    setError("");

    console.log("📤 Deposit amount:", amount);

    try {
      const res = await depositToWallet(Number(amount));
      console.log("✅ Deposit success:", res.data);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("❌ Deposit error:", err);
      setError(err.response?.data?.detail || "Deposit failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-xl w-96">
        <h2 className="text-xl font-bold text-yellow-400 mb-4">
          Deposit to Cash Wallet
        </h2>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-2 rounded mb-3 text-sm">
            {error}
          </div>
        )}

        <input
          type="number"
          placeholder="Enter amount"
          className="input"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleDeposit}
            disabled={loading}
            className="flex-1 bg-yellow-400 text-black font-semibold py-2 rounded disabled:opacity-50"
          >
            {loading ? "Processing..." : "Deposit"}
          </button>

          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 text-white py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositModal;
