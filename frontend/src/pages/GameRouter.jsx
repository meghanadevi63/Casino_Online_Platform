import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGameById } from "../api/game.api";

// Import Game Components
import GameRoom from "./GameRoom";           // Dice & Even/Odd
import CoinTossGame from "./CoinTossGame";   // Coin Toss

// ... imports

const GameRouter = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadGame = async () => {
      try {
        const res = await getGameById(gameId);
        console.log("Game Metadata Loaded:", res.data); 
        setGame(res.data);
      } catch (err) {
        console.error("Failed to load game metadata", err);
        setError("Game not found or access denied.");
      } finally {
        setLoading(false);
      }
    };
    loadGame();
  }, [gameId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-yellow-500 font-bold">
        Loading Game Environment...
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <p className="text-red-500 text-lg mb-4">{error || "Game not found"}</p>
        <button onClick={() => navigate("/games")} className="bg-gray-800 px-4 py-2 rounded">
          Return to Lobby
        </button>
      </div>
    );
  }

  // 🔎 Log the game code to Console to verify matching
  console.log("Routing for Game Code:", game.game_code);

  switch (game.game_code) {
    case "Coin_2": // Ensure this matches DB exactly
    case "COIN_TOSS": // Handle variations just in case
      return <CoinTossGame />;

    case "EVEN_ODD":
    case "DICE_6":
      return <GameRoom />;

    default:
      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
          <p className="text-red-400 mb-4">Unsupported Game Type: {game.game_code}</p>
          <button onClick={() => navigate("/games")} className="bg-gray-800 px-4 py-2 rounded">Back</button>
        </div>
      );
  }
};

export default GameRouter;