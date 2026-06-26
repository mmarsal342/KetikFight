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
    <div className={`
      absolute bottom-20 md:bottom-4
      ${isPlayer ? "left-2 md:left-4" : "right-2 md:right-4"}
      w-32 md:w-48 z-10
    `}>
      <div className={`
        flex items-center gap-1 md:gap-2 mb-1 font-mono font-bold text-[10px] md:text-sm
        ${isPlayer ? "justify-start text-yellow" : "justify-end text-red"}
      `}>
        <span>{isPlayer ? "YOU" : "CPU"}</span>
        <span>{hp}/{maxHp}</span>
      </div>
      <div className="w-full h-2 md:h-3 bg-gray-800 rounded overflow-hidden border border-gray-700">
        <div
          className={`h-full ${barColor} transition-all duration-300 ${phase === "playing" ? "animate-pulse" : ""}`}
          style={{ width: `${Math.max(0, percentage)}%` }}
        />
      </div>
    </div>
  );
}
