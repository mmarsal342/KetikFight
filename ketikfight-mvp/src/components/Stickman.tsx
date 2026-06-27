import { YELLOW, RED, YELLOW_GLOW, RED_GLOW } from "../types";

interface StickmanProps {
  hp: number;
  maxHp: number;
  isPlayer: boolean;
  isGuarding: boolean;
}

export default function Stickman({ hp, maxHp, isPlayer, isGuarding }: StickmanProps) {
  const color = isPlayer ? YELLOW : RED;
  const glow = isPlayer ? YELLOW_GLOW : RED_GLOW;
  const isLowHP = hp / maxHp <= 0.25;

  return (
    <div
      className={`
        absolute top-[50%] md:bottom-20 md:top-auto transition-all duration-200
        ${isPlayer ? "left-[15%] md:left-[13%]" : "left-[85%] md:left-[87%]"}
      `}
      style={{
        color,
        textShadow: isLowHP ? `0 0 15px ${glow}, 0 0 30px ${glow}` : `0 0 8px ${glow}`,
        transform: `translateX(-50%) ${isGuarding ? "scale(1.1)" : ""}`,
      }}
    >
      <svg width="48" height="80" viewBox="0 0 60 100" fill="none" stroke="currentColor" strokeWidth="3" className="md:w-[60px] md:h-[100px]">
        <circle cx="30" cy="15" r="10" />
        <line x1="30" y1="25" x2="30" y2="60" />
        <line x1="10" y1="40" x2="50" y2="40" />
        <line x1="30" y1="60" x2="15" y2="95" />
        <line x1="30" y1="60" x2="45" y2="95" />
        {isGuarding && (
          <>
            <line x1="10" y1="35" x2="50" y2="35" strokeWidth="4" />
            <circle cx="30" cy="15" r="8" strokeWidth="4" />
          </>
        )}
      </svg>
    </div>
  );
}