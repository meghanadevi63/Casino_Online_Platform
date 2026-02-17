import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { playCoinToss } from "../api/coinToss.api";
import { getSessionRounds } from "../api/game.api";
import useGameSession from "../hooks/useGameSession";

const CoinTossGame = () => {
  const { gameId } = useParams();
  const { sessionId, loading, error, currency, exitGame } = useGameSession(gameId);

  // Input States
  const [betAmount, setBetAmount] = useState(10);
  const [selectedChoice, setSelectedChoice] = useState("HEAD"); 

  // UI / Animation States
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState(null); 
  const [history, setHistory] = useState([]);

  // Load History on Session Start
  useEffect(() => {
    if (!sessionId) return;

    const fetchHistory = async () => {
      try {
        console.log("📜 Initializing: Fetching session history for:", sessionId);
        const res = await getSessionRounds(sessionId);
        setHistory(res.data);
      } catch (err) {
        console.error("❌ History fetch failed", err);
      }
    };

    fetchHistory();
  }, [sessionId]);

  const handlePlayRound = async () => {
    if (flipping || !sessionId || betAmount <= 0) return;

    console.log("🚀 Round Started");
    console.log("📤 Payload:", { game_id: gameId, choice: selectedChoice, bet_amount: betAmount });

    setFlipping(true);
    setResult(null); 

    try {
      const res = await playCoinToss({
        game_id: gameId,
        choice: selectedChoice,
        bet_amount: Number(betAmount),
      });

      console.log("📥 Server Response Received:", res.data);

      // Wait for the coin animation duration (1s)
      setTimeout(() => {
        const data = res.data;
        
        // 1. Update Result View
        setResult(data);
        
        // 2. Stop Animation
        setFlipping(false);
        
      
        window.dispatchEvent(new CustomEvent("balanceUpdated", { 
          detail: { newBalance: data.balance_after } 
        }));

        // 4. Update History (Right Side)
        setHistory((prev) => [data, ...prev]);
        
        console.log("✅ Round Completed & UI Updated");
      }, 1000);

    } catch (err) {
      console.error("❌ API Error:", err.response?.data || err.message);
      alert(err.response?.data?.detail || "Bet failed");
      setFlipping(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-yellow-500 font-bold animate-pulse">Initializing Table...</div>;

  if (error) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-4">
      <p className="text-red-500">{error}</p>
      <button onClick={exitGame} className="bg-gray-800 px-4 py-2 rounded border border-gray-700">Back</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4 font-sans flex flex-col">

      {/* HEADER */}
      <div className="w-full max-w-5xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-bold text-yellow-400 flex items-center gap-2">🪙 Super Flip</h1>
          <span className="text-xs text-gray-500 font-mono">Session: {sessionId?.slice(0, 8)}</span>
        </div>
        <button onClick={exitGame} className="text-xs bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded border border-gray-700 text-gray-300 transition cursor-pointer">
          End Game
        </button>
      </div>

      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* LEFT COLUMN: GAME AREA */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          <div className="flex flex-col items-center justify-center bg-gray-900/50 border border-gray-800 rounded-3xl p-8 shadow-2xl relative min-h-[400px]">

            {/* COIN ANIMATION */}
            <div className="relative w-full h-48 flex items-center justify-center perspective-1000 mb-6">
              <div className={`relative w-40 h-40 transition-transform duration-1000 transform-style-3d ${flipping ? 'animate-spin-y' : ''}`}>
                <div className={`w-full h-full rounded-full border-4 flex items-center justify-center text-6xl font-bold bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 text-yellow-900 shadow-2xl
                  ${!flipping && result ? (result.win ? "border-green-400 text-green-400" : "border-red-500 text-red-500") : "border-yellow-600 text-yellow-600"}
                `}>
                  {result && !flipping ? (result.outcome === "HEAD" ? "H" : "T") : "$"}
                </div>
              </div>
            </div>

            {/* RESULT MESSAGE */}
            <div className="h-12 text-center mb-4">
              {result && !flipping ? (
                <div className="animate-fade-in-up">
                  <p className={`text-3xl font-black italic ${result.win ? "text-green-400" : "text-red-500"}`}>
                    {result.win ? `WIN +${currency}${result.win_amount}` : "LOST"}
                  </p>
                </div>
              ) : flipping ? (
                <p className="text-yellow-500 font-mono animate-pulse">COIN IN AIR...</p>
              ) : null}
            </div>

            {/* CONTROLS PANEL */}
            <div className="w-full max-w-md bg-black/40 border border-gray-700 p-6 rounded-2xl backdrop-blur-sm shadow-xl">
              
              {/* 1. SELECTION AREA */}
              <div className="flex gap-4 mb-6">
                <button 
                  onClick={() => setSelectedChoice("HEAD")}
                  disabled={flipping}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all border-2 ${selectedChoice === "HEAD" ? "bg-blue-600 border-blue-400 text-white shadow-lg" : "bg-gray-800 border-transparent text-gray-400"}`}
                >
                  🦁 HEAD
                </button>
                <button 
                  onClick={() => setSelectedChoice("TAIL")}
                  disabled={flipping}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all border-2 ${selectedChoice === "TAIL" ? "bg-purple-600 border-purple-400 text-white shadow-lg" : "bg-gray-800 border-transparent text-gray-400"}`}
                >
                  🦅 TAIL
                </button>
              </div>

              {/* 2. AMOUNT AREA */}
              <div className="mb-6 relative">
                <label className="text-[10px] text-gray-500 uppercase font-bold absolute -top-2 left-3 bg-black px-1 z-10">Bet Amount</label>
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{currency}</span>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl py-4 pl-10 pr-4 text-white focus:border-yellow-500 outline-none text-xl font-mono"
                  disabled={flipping}
                />
              </div>

              {/* 3. PLAY ACTION */}
              <button
                onClick={handlePlayRound}
                disabled={flipping || betAmount <= 0}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-xl text-xl shadow-xl transition-transform active:scale-95 disabled:opacity-50"
              >
                {flipping ? "WAITING..." : "FLIP COIN"}
              </button>
            </div>
          </div>

          {/* CLEAN ROUND RESULT DISPLAY */}
          {result && !flipping && (
            <div className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-xl animate-fade-in-up">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Your Pick</p>
                  <p className="text-lg font-bold text-white">{result.player_choice}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Result</p>
                  <p className="text-lg font-bold text-yellow-400">{result.outcome}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Status</p>
                  <p className={`text-lg font-bold ${result.win ? "text-green-400" : "text-red-500"}`}>
                    {result.win ? `WON ${currency}${result.win_amount}` : "LOST"}
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-3 border-t border-gray-800 pt-4 mt-2">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Wallet Balance After Round</p>
                  <p className="text-2xl font-mono font-black text-white">{currency}{result.balance_after}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: HISTORY */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 h-[600px] overflow-hidden flex flex-col shadow-2xl">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Round History</h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {history.map((h, i) => {
              const outcome = h.outcome || "?";
              const isWin = h.win !== undefined ? h.win : (h.win_amount > 0);
              const amountDisplay = h.win_amount > 0 ? `+${h.win_amount}` : `-${h.bet_amount}`;

              return (
                <div key={i} className="flex justify-between items-center bg-gray-800/40 p-3 rounded-lg text-xs hover:bg-gray-800 transition border border-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border ${isWin ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
                      {outcome === "HEAD" ? "H" : "T"}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-300 font-bold">{outcome}</span>
                      <span className="text-gray-600 text-[10px]">
                        {h.player_choice ? `Pick: ${h.player_choice}` : `Round #${h.round_number || "-"}`}
                      </span>
                    </div>
                  </div>
                  <div className={`font-mono font-bold ${isWin ? "text-green-400" : "text-gray-500"}`}>
                    {amountDisplay}
                  </div>
                </div>
              );
            })}
            {history.length === 0 && (
              <div className="text-center text-gray-600 text-xs mt-10 italic">No rounds recorded in this session.</div>
            )}
          </div>
        </div>

      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .animate-spin-y { animation: spinY 0.5s linear infinite; }
        @keyframes spinY { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(1800deg); } }
        .animate-fade-in-up { animation: fadeInUp 0.3s ease-out forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #111; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #444; }
      `}</style>
    </div>
  );
};

export default CoinTossGame;