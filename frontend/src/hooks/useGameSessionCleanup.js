import { useEffect } from "react";

const useGameSessionCleanup = (sessionId) => {
  useEffect(() => {
    if (!sessionId) return;

    const cleanup = () => {
      navigator.sendBeacon(
        `${import.meta.env.VITE_API_BASE_URL}/games/sessions/${sessionId}/end`
      );
    };

    window.addEventListener("beforeunload", cleanup);

    return () => {
      cleanup();
      window.removeEventListener("beforeunload", cleanup);
    };
  }, [sessionId]);
};

export default useGameSessionCleanup;
