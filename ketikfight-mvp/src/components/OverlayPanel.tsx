import type { GamePhase } from "../types";

interface OverlayPanelProps {
  phase: GamePhase;
  wpm: number;
  onStart: () => void;
  onRestart: () => void;
}

export default function OverlayPanel({ phase, wpm, onStart, onRestart }: OverlayPanelProps) {
  if (phase === "playing") return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="text-center font-mono">
        {phase === "idle" && (
          <>
            <h1 className="text-6xl font-bold text-yellow-500 mb-4" style={{ textShadow: "0 0 20px rgba(253, 224, 71, 0.8)" }}>
              KETIK FIGHT
            </h1>
            <p className="text-white text-xl mb-8">Fight with words. Type Indonesian attacks, defend from projectiles.</p>
            <button
              onClick={onStart}
              className="px-8 py-4 bg-yellow-500 text-black font-bold text-xl rounded-lg hover:bg-yellow-400 transition-all"
            >
              START
            </button>
          </>
        )}
        {phase === "win" && (
          <>
            <h2 className="text-6xl font-bold text-green-500 mb-4">🏆 MENANG!</h2>
            <p className="text-white text-2xl mb-2">WPM Final: <span className="text-yellow-500 font-bold">{wpm}</span></p>
            <p className="text-white text-xl mb-8">CPU defeated!</p>
            <button
              onClick={onRestart}
              className="px-8 py-4 bg-green-500 text-black font-bold text-xl rounded-lg hover:bg-green-400 transition-all"
            >
              PLAY AGAIN
            </button>
          </>
        )}
        {phase === "lose" && (
          <>
            <h2 className="text-6xl font-bold text-red-500 mb-4">💀 KALAH!</h2>
            <p className="text-white text-2xl mb-2">WPM Final: <span className="text-yellow-500 font-bold">{wpm}</span></p>
            <p className="text-white text-xl mb-8">CPU was too fast!</p>
            <button
              onClick={onRestart}
              className="px-8 py-4 bg-red-500 text-black font-bold text-xl rounded-lg hover:bg-red-400 transition-all"
            >
              TRY AGAIN
            </button>
          </>
        )}
      </div>
    </div>
  );
}