import type { GamePhase } from "../types";

interface HUDBarProps {
  wpm: number;
  phase: GamePhase;
}

export default function HUDBar({ wpm, phase }: HUDBarProps) {
  if (phase !== "playing") return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
      <div className="flex items-center gap-3 px-4 py-1.5 bg-black/50 rounded-lg">
        <span className="text-gray-500 text-xs font-mono">WPM</span>
        <span className="text-yellow-500 font-mono font-bold text-lg">{wpm}</span>
      </div>
    </div>
  );
}