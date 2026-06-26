import type { Projectile } from "../types";
import { TRAVEL_MS } from "../types";

interface IncomingWarningProps {
  projectiles: Projectile[];
}

export default function IncomingWarning({ projectiles }: IncomingWarningProps) {
  const cpuProjs = projectiles.filter((p) => !p.fromPlayer);
  if (cpuProjs.length === 0) return null;

  const now = Date.now();

  return (
    <div className="flex gap-1 justify-center items-center mb-1">
      {cpuProjs.map((p) => {
        const progress = (now - p.t0) / TRAVEL_MS;

        let color = "bg-green-500";
        let label = "";
        if (progress >= 0.85) {
          color = "bg-red-500 animate-pulse";
          label = "PARRY!";
        } else if (progress >= 0.65) {
          color = "bg-yellow-500";
        }

        return (
          <div key={p.id} className="flex flex-col items-center gap-0.5">
            <div className="w-20 md:w-24 h-1.5 bg-gray-800 rounded overflow-hidden">
              <div
                className={`h-full ${color} transition-all duration-75`}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            {label && (
              <span className="text-[8px] md:text-[9px] font-mono font-bold text-red-400 animate-pulse">
                {label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
