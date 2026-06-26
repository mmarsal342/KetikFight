import { useRef, useEffect } from "react";

interface InputFieldProps {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  partialMatch: string | null;
}

export default function InputField({ value, onChange, disabled, partialMatch }: InputFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  return (
    <div className="w-full max-w-md mx-auto">
      {partialMatch && (
        <div className="text-center font-mono text-sm md:text-lg mb-1 tracking-wider">
          {partialMatch.split("").map((char, i) => (
            <span
              key={i}
              className={i < value.length ? "text-green-400" : "text-gray-600"}
            >
              {char}
            </span>
          ))}
        </div>
      )}
      <input
        ref={inputRef}
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
        placeholder={disabled ? "" : "KETIK..."}
        className="w-full px-3 py-2 md:px-4 md:py-3 bg-gray-900 border-2 border-gray-700 rounded-lg font-mono text-white text-base md:text-xl text-center uppercase tracking-widest focus:outline-none focus:border-yellow-500 transition-colors"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="characters"
        spellCheck="false"
        enterKeyHint="done"
        inputMode="text"
      />
    </div>
  );
}
