import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext"; 
import { Wallet, ArrowRight, CheckCircle2 } from "lucide-react";
import {depositToWallet} from "../api/wallet.api"
const Deposit = () => {
  const { user } = useContext(AuthContext); 
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  
  const currencySymbol = user?.currency_symbol || "₹";

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  const handleDeposit = async (e) => {
    if (e) e.preventDefault();
    if (!amount || amount <= 0) return;

    setLoading(true);
    try {
      await depositToWallet(Number(amount));
      setSuccess(true);
      
     
      window.dispatchEvent(new CustomEvent("balanceUpdated"));
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Deposit Error:", err);
      alert("Deposit failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-yellow-500/20 p-2 rounded-lg">
          <Wallet className="text-yellow-500" size={24} />
        </div>
        <h1 className="text-2xl font-bold">Deposit Funds</h1>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {success ? (
          <div className="text-center py-10 animate-fade-in">
            <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white">Deposit Successful!</h2>
            <p className="text-gray-400 mt-2">
              Your balance has been updated by {currencySymbol}{amount} instantly.
            </p>
            <button 
              onClick={() => setSuccess(false)} 
              className="mt-6 text-yellow-500 font-bold hover:underline"
            >
              Make another deposit
            </button>
          </div>
        ) : (
          <form onSubmit={handleDeposit} className="space-y-8">
            {/* Amount Input */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-4">
                Enter Amount Manually ({user?.currency_code || 'CASH'})
              </label>
              <div className="relative">
                {/*  Dynamic Currency Symbol Displayed Here */}
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-bold text-yellow-500">
                  {currencySymbol}
                </span>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-black border-2 border-gray-800 focus:border-yellow-500 rounded-2xl py-6 pl-14 pr-6 text-4xl font-black outline-none transition-all"
                />
              </div>
            </div>

            {/* Quick Select */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-4">Quick Select</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {quickAmounts.map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`py-3 rounded-xl font-bold border-2 transition-all ${
                      Number(amount) === amt 
                      ? "bg-yellow-500 border-yellow-400 text-black shadow-lg" 
                      : "bg-gray-800 border-transparent text-gray-400 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>

            <button 
              disabled={loading || !amount || Number(amount) <= 0}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-black py-5 rounded-2xl text-xl shadow-xl transition-transform active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? "Processing..." : <>Confirm Deposit <ArrowRight size={20}/></>}
            </button>
          </form>
        )}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex gap-4">
        <div className="text-blue-400 font-bold">ℹ️</div>
        <p className="text-sm text-blue-200/70 leading-relaxed">
          This is currently a simulation for <strong>{user?.tenant_name}</strong>. In a live environment, you would be redirected to a secure payment gateway to complete the transaction in <strong>{user?.currency_code}</strong>.
        </p>
      </div>
    </div>
  );
};

export default Deposit;