import { CHARACTERS } from "../characters";
import { DIFFICULTIES } from "../gameData";
import type { Difficulty } from "../gameData";

interface CharacterSelectProps {
  selectedChar: string;
  difficulty: Difficulty;
  onSelectChar: (id: string) => void;
  onSelectDifficulty: (d: Difficulty) => void;
  onFight: () => void;
}

export default function CharacterSelect({
  selectedChar,
  difficulty,
  onSelectChar,
  onSelectDifficulty,
  onFight,
}: CharacterSelectProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-8">
      <div className="text-center font-mono max-w-3xl w-full px-4">
        <h2 className="text-3xl font-bold text-white mb-1">PILIH KARAKTER</h2>
        <p className="text-gray-500 text-xs mb-6">Tiap karakter punya jurus & passive berbeda</p>

        {/* Character cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {CHARACTERS.map((char) => {
            const selected = selectedChar === char.id;
            return (
              <button
                key={char.id}
                onClick={() => onSelectChar(char.id)}
                className={`
                  text-left p-4 rounded-xl border-2 transition-all
                  ${selected ? "scale-105" : "border-gray-800 hover:border-gray-600"}
                `}
                style={
                  selected
                    ? { borderColor: char.color, boxShadow: `0 0 16px ${char.color}40`, background: `${char.color}10` }
                    : { background: "rgba(17, 24, 39, 0.6)" }
                }
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl">{char.emoji}</span>
                  <div>
                    <div className="font-bold" style={{ color: selected ? char.color : "#fff" }}>
                      {char.name}
                    </div>
                    <div className="text-[10px] text-gray-500">{char.title}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-2">{char.description}</p>
                <div className="text-[10px] text-gray-600 mb-2 italic">{char.passive}</div>

                {/* Jurus preview */}
                <div className="flex flex-wrap gap-1">
                  {char.jurus.map((j) => (
                    <span
                      key={j.word}
                      className={`
                        text-[9px] px-1.5 py-0.5 rounded
                        ${j.type === "defense" ? "bg-cyan-950/50 text-cyan-500" : "bg-gray-800 text-gray-400"}
                      `}
                    >
                      {j.word}
                    </span>
                  ))}
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-950/50 text-orange-500 font-bold">
                    {char.ultimate.word}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Difficulty */}
        <div className="mb-6">
          <p className="text-gray-500 text-xs mb-2">DIFFICULTY</p>
          <div className="flex gap-2 justify-center">
            {(Object.keys(DIFFICULTIES) as Difficulty[]).map((key) => {
              const d = DIFFICULTIES[key];
              const selected = difficulty === key;
              return (
                <button
                  key={key}
                  onClick={() => onSelectDifficulty(key)}
                  className={`
                    px-4 py-2 rounded font-bold text-sm transition-all
                    ${selected ? "bg-yellow-500 text-black scale-110" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}
                  `}
                >
                  {d.emoji} {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fight button */}
        <button
          onClick={onFight}
          className="px-12 py-4 bg-red-600 text-white font-bold text-xl rounded-lg hover:bg-red-500 transition-all"
          style={{ boxShadow: "0 0 20px rgba(220, 38, 38, 0.4)" }}
        >
          FIGHT! ⚔️
        </button>
      </div>
    </div>
  );
}
