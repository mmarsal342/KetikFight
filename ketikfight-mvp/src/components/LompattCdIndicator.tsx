interface LompattCdIndicatorProps {
  lompattCdEnd: number;
}

export default function LompattCdIndicator({ lompattCdEnd }: LompattCdIndicatorProps) {
  if (lompattCdEnd === 0) return null;

  const remaining = Math.max(0, lompattCdEnd - Date.now()) / 1000;

  return (
    <div className="absolute top-32 left-[13%] -translate-x-1/2">
      <div className="font-mono font-bold text-orange-400 text-sm">
        LOMPAT: {remaining.toFixed(1)}s
      </div>
    </div>
  );
}