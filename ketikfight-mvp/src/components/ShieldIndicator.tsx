import { MAX_PERISAI_CHARGES } from "../gameData";

interface ShieldIndicatorProps {
  charges: number;
}

export default function ShieldIndicator({ charges }: ShieldIndicatorProps) {
  if (charges === 0) return null;

  return (
    <div className="absolute top-20 left-[13%] -translate-x-1/2">
      <div className="flex flex-col items-center gap-1">
        <div className="font-mono font-bold text-blue-400 text-sm">SHIELD</div>
        <div className="flex gap-1">
          {[...Array(Math.min(charges, MAX_PERISAI_CHARGES))].map((_, i) => (
            <div
              key={i}
              className="w-4 h-6 bg-blue-500 rounded-sm animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}