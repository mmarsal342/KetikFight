import type { GamePhase } from "../types";

interface HPBarProps {
  hp: number;
  maxHp: number;
  isPlayer: boolean;
  phase: GamePhase;
}

export default function HPBar({ hp, maxHp, isPlayer, phase }: HPBarProps) {
  const percentage = (hp / maxHp) * 100;
  const barColor = percentage > 50 ? "bg-green-500" : percentage > 25 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className={`absolute ${isPlayer ? "bottom-4 left-4" : "bottom-4 right-4"} w-48`}>
      <div className={`
        flex items-center gap-2 mb-1 font-mono font-bold text-sm
        ${isPlayer ? "justify-start text-yellow" : "justify-end text-red"}
      `}>
        <span>{isPlayer ? "PLAYER" : "CPU"}</span>
        <span>{hp}/{maxHp}</span>
      </div>
      <div className="w-full h-3 bg-gray-800 rounded overflow-hidden border border-gray-700">
        <div
          className={`h-full ${barColor} transition-all duration-300 ${phase === "playing" ? "animate-pulse" : ""}`}
          style={{ width: `${Math.max(0, percentage)}%` }}
        />
      </div>
    </div>
  );
}