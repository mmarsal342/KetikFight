import type { AttackWord } from "../types";

interface WordCheatsheetProps {
  attacks: AttackWord[];
  defenses: { word: string; type: string }[];
}

const tierColors: Record<number, string> = {
  1: "text-gray-400",
  2: "text-blue-400",
  3: "text-purple-400",
  4: "text-orange-400",
};

export default function WordCheatsheet({ attacks, defenses }: WordCheatsheetProps) {
  return (
    <div className="flex flex-col gap-2 text-xs font-mono max-w-md mx-auto">
      <div className="flex flex-wrap gap-1 justify-center">
        {attacks.map((a) => (
          <span key={a.word} className={`${tierColors[a.tier]} bg-gray-800/50 px-1.5 py-0.5 rounded`}>
            {a.word} <span className="text-gray-600">{a.dmg}</span>
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-1 justify-center">
        {defenses.map((d) => (
          <span key={d.word} className="text-cyan-400 bg-gray-800/50 px-1.5 py-0.5 rounded">
            {d.word}
          </span>
        ))}
      </div>
    </div>
  );
}