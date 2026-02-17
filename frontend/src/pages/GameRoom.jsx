import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { playEvenOddRound, getSessionRounds } from "../api/game.api"; 
import useGameSession from "../hooks/useGameSession";

const GameRoom = () => {
  const { gameId } = useParams();
  const { sessionId, loading, error, currency, exitGame } = useGameSession(gameId);

  const [betAmount, setBetAmount] = useState(10);
  const [betChoice, setBetChoice] = useState("EVEN");
  const [rolling, setRolling] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [history, setHistory] = useState([]);

  //  Load History on Session Start
  useEffect(() => {
    if (!sessionId) return;
    const fetchHistory = async () => {
      try {
        const res = await getSessionRounds(sessionId);
        setHistory(res.data);
      } catch (err) {
        console.error("History fetch failed", err);
      }
    };
    fetchHistory();
  }, [sessionId]);

  const handlePlay = async () => {
    if (rolling || !sessionId || betAmount <= 0) return;

    setRolling(true);
    setLastResult(null); // Clear previous result to trigger animation

    try {
      const res = await playEvenOddRound({
        game_id: gameId,
        bet_choice: betChoice,
        amount: Number(betAmount),
      });

      setTimeout(() => {
        const result = res.data;
        setLastResult(result);
        setHistory((prev) => [result, ...prev]); 
        
        //  Option B: Dispatch event with new balance data to update Topbar
        window.dispatchEvent(new CustomEvent("balanceUpdated", { 
          detail: { newBalance: result.balance_after } 
        }));

        setRolling(false);
      }, 600);

    } catch (err) {
      alert(err.response?.data?.detail || "Bet failed");
      setRolling(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-yellow-500 font-bold animate-pulse">Initializing Table...</div>;
  
  if (error) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-red-500 gap-4">
      <p className="text-xl">{error}</p>
      <button onClick={exitGame} className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700 transition">Back to Lobby</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-4 font-sans flex flex-col">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-6 max-w-5xl mx-auto w-full">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-yellow-400">🎲 Dice Master</h1>
          <span className="text-xs text-gray-500 font-mono">ID: {sessionId?.slice(0, 8)}</span>
        </div>
        <button 
          onClick={exitGame} 
          className="bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-800 px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer"
        >
          End Game
        </button>
      </header>

      <main className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        
        {/* LEFT COLUMN: GAME BOARD & RESULTS */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* DICE VISUALIZER */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl h-64 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
            <div className={`text-9xl transition-transform duration-500 ${rolling ? 'animate-spin blur-sm' : ''}`}>
              {lastResult ? (
                <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                  {['⚀','⚁','⚂','⚃','⚄','⚅'][lastResult.dice_roll - 1]}
                </span>
              ) : <span className="text-gray-600 opacity-50">🎲</span>}
            </div>
            {!rolling && lastResult && (
              <div className="absolute bottom-4 text-center animate-fade-in-up">
                <div className={`text-3xl font-black italic uppercase ${lastResult.win ? "text-green-400" : "text-red-500"}`}>
                  {lastResult.win ? "WINNER!" : "YOU LOST"}
                </div>
              </div>
            )}
            {rolling && <div className="absolute bottom-4 text-yellow-500 font-mono animate-pulse">ROLLING...</div>}
          </div>

          {/* CONTROLS */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-xl">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button 
                onClick={() => setBetChoice("EVEN")}
                disabled={rolling}
                className={`py-4 rounded-xl font-bold text-xl border-2 transition-all ${
                  betChoice === "EVEN" ? "border-blue-500 bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "border-gray-700 bg-gray-800 text-gray-500 hover:border-gray-600"
                }`}
              >
                EVEN <div className="text-[10px] font-normal opacity-60">2, 4, 6</div>
              </button>
              <button 
                onClick={() => setBetChoice("ODD")}
                disabled={rolling}
                className={`py-4 rounded-xl font-bold text-xl border-2 transition-all ${
                  betChoice === "ODD" ? "border-purple-500 bg-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]" : "border-gray-700 bg-gray-800 text-gray-500 hover:border-gray-600"
                }`}
              >
                ODD <div className="text-[10px] font-normal opacity-60">1, 3, 5</div>
              </button>
            </div>

            <div className="flex gap-4">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{currency}</span>
                <input 
                  type="number" 
                  value={betAmount} 
                  onChange={(e) => setBetAmount(e.target.value)}
                  disabled={rolling}
                  className="w-full bg-black border border-gray-700 rounded-xl py-4 pl-10 pr-4 text-white focus:border-yellow-500 outline-none font-mono text-xl"
                />
              </div>
              <button 
                onClick={handlePlay}
                disabled={rolling || betAmount <= 0}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-black px-8 py-4 rounded-xl shadow-lg disabled:opacity-50 transition-transform active:scale-95 text-xl"
              >
                {rolling ? "..." : "ROLL"}
              </button>
            </div>
          </div>

          {/* CLEAN ROUND RESULT DISPLAY (Same style as Coin Toss) */}
          {lastResult && !rolling && (
            <div className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-xl animate-fade-in-up">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Your Pick</p>
                  <p className="text-lg font-bold text-white">{lastResult.bet_choice}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Result</p>
                  <p className="text-lg font-bold text-yellow-400">
                    {lastResult.dice_roll} ({lastResult.outcome})
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Status</p>
                  <p className={`text-lg font-bold ${lastResult.win ? "text-green-400" : "text-red-500"}`}>
                    {lastResult.win ? `WON ${currency}${lastResult.win_amount}` : "LOST"}
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-3 border-t border-gray-800 pt-4 mt-2">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Wallet Balance After Round</p>
                  <p className="text-2xl font-mono font-black text-white">
                    {currency}{Number(lastResult.balance_after).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: HISTORY */}
        <div className="hidden md:block bg-gray-900 border border-gray-800 rounded-2xl p-4 h-full overflow-hidden flex flex-col shadow-2xl">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Session History</h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {history.map((h, i) => (
              <div key={i} className="flex justify-between items-center bg-gray-800/40 p-3 rounded-lg text-xs border border-gray-800/50">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${h.win || h.win_amount > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                    {h.dice_roll || "?"}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-300 font-semibold">{h.outcome}</span>
                    <span className="text-gray-600 text-[10px] font-bold">{h.bet_choice || h.player_choice || "-"}</span>
                  </div>
                </div>
                <div className={`font-mono font-bold ${h.win || h.win_amount > 0 ? "text-green-400" : "text-gray-500"}`}>
                  {h.win_amount > 0 ? `+${h.win_amount}` : `-${h.bet_amount}`}
                </div>
              </div>
            ))}
            {history.length === 0 && <div className="text-center text-gray-600 text-xs mt-10 italic">No history yet</div>}
          </div>
        </div>
      </main>

      <style>{`
        .animate-fade-in-up { 
          animation: fadeInUp 0.4s ease-out forwards; 
        }
        @keyframes fadeInUp { 
          from { opacity: 0; transform: translateY(10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default GameRoom;