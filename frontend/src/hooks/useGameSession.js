import { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { startGameSession, endGameSession } from "../api/game.api";
import { AuthContext } from "../context/AuthContext";

const useGameSession = (gameId) => {
  const navigate = useNavigate();
  const { user, refreshUser, loadingUser } = useContext(AuthContext);
  
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Wait for Auth to be ready
    if (loadingUser) return;
    if (!user) {
      navigate("/login");
      return;
    }
    if (!gameId) return;

    let mounted = true;
    setLoading(true); // Reset loading on effect run

    const start = async () => {
      try {
        console.log(`🎮 Requesting Session for Game ID: ${gameId}`);
        const res = await startGameSession(gameId);
        
        if (mounted) {
          console.log("✅ Session Active:", res.data.session_id);
          setSessionId(res.data.session_id);
          setLoading(false); // Stop loading ONLY if mounted
        }
      } catch (err) {
        console.error("❌ Session Start Error:", err);
        if (mounted) {
          setError(err.response?.data?.detail || "Could not start session");
          setLoading(false);
        }
      }
    };

    start();

    // Cleanup function
    return () => {
      mounted = false;
      // Note: We don't automatically end the session here because 
      // a simple page refresh would kill the session. 
      // We let exitGame() handle that explicit action.
    };
  }, [gameId, user, loadingUser, navigate]); 

  const exitGame = async () => {
    if (sessionId) {
      try {
        console.log("🛑 Exiting Session:", sessionId);
        await endGameSession(sessionId);
      } catch (err) {
        console.warn("Exit warning:", err);
      }
    }
    navigate("/games");
  };

  const refreshBalance = useCallback(async () => {
    await refreshUser();
  }, [refreshUser]);

  return { 
    sessionId, 
    loading, 
    error, 
    currency: user?.currency_symbol || "₹",
    refreshBalance,
    exitGame
  };
};

export default useGameSession;