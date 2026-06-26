interface ParryIndicatorProps {
  cdEnd: number;
}

export default function ParryIndicator({ cdEnd }: ParryIndicatorProps) {
  const remaining = Math.max(0, cdEnd - Date.now());
  const onCooldown = remaining > 0;

  return (
    <div
      className={`px-2 py-1 rounded font-mono text-xs font-bold transition-all ${
        onCooldown
          ? "bg-gray-800 text-gray-600"
          : "bg-cyan-900/50 text-cyan-400 animate-pulse"
      }`}
    >
      {onCooldown ? `PARRY ${(remaining / 1000).toFixed(1)}s` : "PARRY [SPACE]"}
    </div>
  );
}
