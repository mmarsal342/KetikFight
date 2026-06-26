import type { SlotState, Character } from "../characters";
import { ULT_THRESHOLD } from "../characters";

interface JurusSlotsProps {
  slots: SlotState[];
  character: Character;
  ultCharge: number;
  ultReady: boolean;
  typedInput: string;
  invulnEnd: number;
}

const tierColors: Record<number, string> = {
  1: "border-gray-600 text-gray-300",
  2: "border-blue-500 text-blue-400",
  3: "border-purple-500 text-purple-400",
};

const tierBg: Record<number, string> = {
  1: "bg-gray-800/60",
  2: "bg-blue-950/40",
  3: "bg-purple-950/40",
};

function getResonance(slots: SlotState[], idx: number): number {
  const slot = slots[idx];
  if (!slot.jurus) return 0;
  const word = slot.jurus.word;
  let count = 0;
  for (const s of slots) {
    if (s.jurus && s.jurus.word === word) count++;
  }
  if (count >= 3) return 3;
  if (count === 2) return 2;
  return 0;
}

export default function JurusSlots({
  slots,
  character,
  ultCharge,
  ultReady,
  typedInput,
  invulnEnd,
}: JurusSlotsProps) {
  const invulnActive = invulnEnd > Date.now();

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Invuln indicator */}
      {invulnActive && (
        <div className="text-[10px] font-mono font-bold text-cyan-400 animate-pulse">
          🛡️ INVULNERABLE {((invulnEnd - Date.now()) / 1000).toFixed(1)}s
        </div>
      )}

      {/* Regular slots */}
      <div className="flex gap-1.5 md:gap-2 justify-center">
        {slots.map((slot, i) => {
          if (!slot.jurus) {
            const progress = Math.min(
              1,
              Math.max(0, 1 - (slot.refillAt - Date.now()) / slot.refillDuration),
            );
            return (
              <div
                key={i}
                className="w-[5.5rem] md:w-28 h-12 md:h-14 rounded-lg border border-gray-800 bg-gray-900/50 flex items-center justify-center"
              >
                <div className="w-20 h-1 bg-gray-800 rounded overflow-hidden">
                  <div
                    className="h-full bg-gray-600 transition-all"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>
            );
          }

          const j = slot.jurus;
          const isDefense = j.type === "defense";
          const matched = typedInput.length > 0 && j.word.startsWith(typedInput);
          const resonance = getResonance(slots, i);
          const hasResonance = resonance >= 2;

          return (
            <div
              key={i}
              className={`
                relative w-[5.5rem] md:w-28 h-12 md:h-14 rounded-lg border-2 px-1.5 md:px-2 py-1 flex flex-col items-center justify-center
                transition-all ${tierBg[j.tier]}
                ${matched ? "scale-105 " + tierColors[j.tier] : "border-gray-700"}
                ${isDefense ? "ring-1 ring-cyan-500/50" : ""}
                ${hasResonance ? "ring-2 ring-yellow-400 animate-pulse" : ""}
              `}
              style={{
                borderColor: matched ? character.color : hasResonance ? "#fde047" : undefined,
                boxShadow: matched
                  ? `0 0 8px ${character.color}40`
                  : hasResonance
                    ? "0 0 12px rgba(253, 224, 71, 0.5)"
                    : undefined,
              }}
            >
              {/* Resonance badge */}
              {hasResonance && (
                <div className="absolute -top-2 -right-1 px-1 py-0.5 bg-yellow-500 text-black text-[8px] font-bold rounded">
                  GEBYAR x{resonance}
                </div>
              )}

              <div className="flex items-center gap-1">
                {matched ? (
                  <span className="font-mono font-bold text-xs md:text-sm tracking-wider">
                    {j.word.split("").map((ch, ci) => (
                      <span key={ci} className={ci < typedInput.length ? "text-green-400" : "text-gray-600"}>
                        {ch}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className={`font-mono font-bold text-xs md:text-sm tracking-wider ${isDefense ? "text-cyan-400" : ""}`}>
                    {j.word}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-gray-500">
                {isDefense
                  ? j.defenseType === "block"
                    ? "BLOCK"
                    : j.defenseType === "shield"
                      ? "SHIELD"
                      : "DODGE"
                  : `${Math.round(j.dmg * character.damageMod)} DMG`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Ultimate slot */}
      <div className="flex flex-col items-center gap-1">
        {ultReady ? (
          <div
            className="w-44 h-12 rounded-lg border-2 border-orange-500 bg-orange-950/40 px-3 py-1 flex flex-col items-center justify-center animate-pulse"
            style={{ boxShadow: "0 0 12px rgba(249, 115, 22, 0.5)" }}
          >
            <span className="font-mono font-bold text-sm text-orange-400 tracking-wider">
              {character.ultimate.word}
            </span>
            <span className="text-[10px] text-orange-600">
              {Math.round(character.ultimate.dmg * character.damageMod)} DMG • ULTIMATE
            </span>
          </div>
        ) : (
          <div className="w-44 h-12 rounded-lg border border-gray-800 bg-gray-900/50 px-3 py-1 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1">
              {[...Array(ULT_THRESHOLD)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${i < ultCharge ? "bg-orange-500" : "bg-gray-700"}`}
                />
              ))}
            </div>
            <span className="text-[9px] text-gray-600 mt-0.5">ULTIMATE</span>
          </div>
        )}
      </div>
    </div>
  );
}
