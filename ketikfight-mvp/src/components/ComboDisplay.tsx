import { getComboMultiplier } from "../characters";

interface ComboDisplayProps {
  combo: number;
}

export default function ComboDisplay({ combo }: ComboDisplayProps) {
  const { tier } = getComboMultiplier(combo);
  if (!tier) return null;

  return (
    <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
      <div
        className="font-mono font-bold text-2xl animate-pulse"
        style={{
          color: tier.color,
          textShadow: `0 0 12px ${tier.color}`,
        }}
      >
        {combo}× {tier.label}
      </div>
      <div className="text-center text-xs font-mono mt-0.5" style={{ color: tier.color }}>
        +{Math.round((tier.multiplier - 1) * 100)}% DMG
      </div>
    </div>
  );
}
