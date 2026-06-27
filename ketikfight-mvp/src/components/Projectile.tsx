import type { Projectile as ProjectileType } from "../types";
import { YELLOW, RED, YELLOW_GLOW, RED_GLOW, TRAVEL_MS } from "../types";

interface ProjectileProps {
  p: ProjectileType;
}

export default function Projectile({ p }: ProjectileProps) {
  const progress = Math.min(1, (Date.now() - p.t0) / TRAVEL_MS);

  const x = p.fromPlayer ? 13 + progress * 74 : 87 - progress * 74;
  const arc = Math.sin(progress * Math.PI) * -12;

  const color = p.fromPlayer ? YELLOW : RED;
  const glow = p.fromPlayer ? YELLOW_GLOW : RED_GLOW;

  return (
    <div
      className="absolute font-mono font-bold text-base md:text-lg pointer-events-none transition-transform whitespace-nowrap z-15"
      style={{
        left: `${x}%`,
        top: `calc(20% + ${arc}px)`,
        color,
        textShadow: `0 0 10px ${glow}, 0 0 20px ${glow}`,
        transform: "translateX(-50%) translateY(-50%)",
      }}
    >
      {p.word}
    </div>
  );
}
