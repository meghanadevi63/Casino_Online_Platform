import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getWalletsByPlayerId } from "../api/wallet.api";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [cashBalance, setCashBalance] = useState(0);


  const isPlayer = user?.role === "PLAYER";

  useEffect(() => {
    const loadCashWallet = async () => {
      if (!user || user.role !== "PLAYER") return;
      try {
        const walletsRes = await getWalletsByPlayerId(user.user_id);
        const cashWallet = walletsRes.data.find(
          (w) => w.wallet_type === "CASH"
        );
        setCashBalance(cashWallet?.balance ?? 0);
      } catch (err) {
        console.error("Navbar wallet error", err);
      }
    };
    loadCashWallet();
  }, [user]);

  if (!user) return null;

  //  Status Colors
  const kycColor = {
    verified: "text-green-400",
    pending: "text-yellow-400",
    rejected: "text-red-400",
    not_submitted: "text-red-400",
    expired: "text-red-400",
  }[user.kyc_status] || "text-gray-400";

  return (
    <nav className="bg-gray-900 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
      {/* LEFT: Logo & Player Links */}
      <div className="flex items-center gap-6">
        <h1
          onClick={() => navigate("/")}
          className="text-yellow-400 font-bold text-lg cursor-pointer"
        >
          {user.tenant_name}
        </h1>

        {isPlayer && (
          <>
            <button onClick={() => navigate("/")} className="text-sm hover:text-yellow-400 transition">
              Dashboard
            </button>
            <button onClick={() => navigate("/games")} className="text-sm hover:text-yellow-400 transition">
              Games
            </button>
            <button onClick={() => navigate("/history")} className="text-sm hover:text-yellow-400 transition">
              History
            </button>
          </>
        )}
      </div>

      {/* RIGHT: Balance & Profile */}
      <div className="flex items-center gap-6 text-sm">
        {isPlayer ? (
          <>
            <div className="bg-gray-800 px-3 py-1 rounded border border-gray-700">
              💰 <span className="text-yellow-400 font-bold ml-1">{user.currency_symbol} {cashBalance}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-400">KYC:</span>
              <span className={`font-semibold uppercase text-xs ${kycColor}`}>
                {user.kyc_status?.replace("_", " ")}
              </span>
            </div>
          </>
        ) : (
          // Fallback for Admin viewing AppLayout (Shouldn't happen with new routing)
          <span className="px-3 py-1 bg-blue-900 text-blue-300 text-xs rounded">ADMIN VIEW</span>
        )}

        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-xs font-semibold transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;