import type { GamePhase } from "../types";
import { DIFFICULTIES } from "../gameData";
import type { Difficulty } from "../gameData";

interface OverlayPanelProps {
  phase: GamePhase;
  wpm: number;
  difficulty: Difficulty;
  onStart: () => void;
  onRestart: () => void;
  onSelectDifficulty: (d: Difficulty) => void;
}

export default function OverlayPanel({
  phase,
  wpm,
  difficulty,
  onStart,
  onRestart,
  onSelectDifficulty,
}: OverlayPanelProps) {
  if (phase === "playing") return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="text-center font-mono">
        {phase === "idle" && (
          <>
            <h1
              className="text-6xl font-bold text-yellow-500 mb-2"
              style={{ textShadow: "0 0 20px rgba(253, 224, 71, 0.8)" }}
            >
              KETIK FIGHT
            </h1>
            <p className="text-white text-sm mb-6">
              Ketik kata serangan untuk nembak proyektil. Tangkis pakai TANGKIS, PERISAI, LOMPAT.
            </p>

            <div className="mb-6">
              <p className="text-gray-400 text-xs mb-2">PILIH DIFFICULTY</p>
              <div className="flex gap-2 justify-center">
                {(Object.keys(DIFFICULTIES) as Difficulty[]).map((key) => {
                  const d = DIFFICULTIES[key];
                  const selected = difficulty === key;
                  return (
                    <button
                      key={key}
                      onClick={() => onSelectDifficulty(key)}
                      className={`
                        px-4 py-2 rounded font-bold text-sm transition-all
                        ${selected
                          ? "bg-yellow-500 text-black scale-110"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                        }
                      `}
                    >
                      {d.emoji} {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

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
            <p className="text-white text-2xl mb-2">
              WPM Final: <span className="text-yellow-500 font-bold">{wpm}</span>
            </p>
            <p className="text-white text-sm mb-1">
              Difficulty: {DIFFICULTIES[difficulty].emoji} {DIFFICULTIES[difficulty].label}
            </p>
            <p className="text-white text-xl mb-8">CPU kalah!</p>
            <button
              onClick={onRestart}
              className="px-8 py-4 bg-green-500 text-black font-bold text-xl rounded-lg hover:bg-green-400 transition-all"
            >
              MAIN LAGI
            </button>
          </>
        )}
        {phase === "lose" && (
          <>
            <h2 className="text-6xl font-bold text-red-500 mb-4">💀 KALAH!</h2>
            <p className="text-white text-2xl mb-2">
              WPM Final: <span className="text-yellow-500 font-bold">{wpm}</span>
            </p>
            <p className="text-white text-sm mb-1">
              Difficulty: {DIFFICULTIES[difficulty].emoji} {DIFFICULTIES[difficulty].label}
            </p>
            <p className="text-white text-xl mb-8">CPU terlalu cepat!</p>
            <button
              onClick={onRestart}
              className="px-8 py-4 bg-red-500 text-black font-bold text-xl rounded-lg hover:bg-red-400 transition-all"
            >
              COBA LAGI
            </button>
          </>
        )}
      </div>
    </div>
  );
}
