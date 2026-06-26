import { useState } from "react";

interface TutorialOverlayProps {
  onClose: () => void;
}

const SLIDES = [
  {
    emoji: "⚔️",
    title: "KETIK FIGHT",
    body: "Game fighting di mana kata = jurus. Pilih karakter, ketik untuk menyerang & bertahan. Menangkan lawan dengan HP lebih tebal!",
  },
  {
    emoji: "🎯",
    title: "Slot System",
    body: "Lo punya 3 slot jurus yang muncul random dari deck karakter. Ketik kata yang muncul di slot untuk eksekusi. Setelah dipakai, slot refill otomatis dengan delay berbeda per tier.",
  },
  {
    emoji: "🛡️",
    title: "Defense",
    body: "TANGKIS hapus proyektil musuh. PERISAI beri shield charges (auto-block). LOMPAT dodge + counter damage. Tiap karakter punya defense berbeda!",
  },
  {
    emoji: "⚡",
    title: "Space = PARRY",
    body: "Tekan SPACE pas proyektil CPU udah deket (65-100%) untuk deflect. Berhasil = proyektil hilang, combo aman. Miss = input ke-clear! Cooldown 1 detik.",
  },
  {
    emoji: "🔥",
    title: "Combo System",
    body: "Tiap serangan yang landing = combo +1. Makin tinggi combo, makin besar damage: 3x (+10%), 5x (+20%), 8x (+35%), 12x (+50%). Kena damage = COMBO BREAK!",
  },
  {
    emoji: "✨",
    title: "GEBYAR (Resonance)",
    body: "Kalau 2 atau 3 slot punya kata yang sama, efeknya berlipat! Attack 2x/4x damage, defense dapat bonus counter/invuln. Slot yang sama otomatis ke-consume barengan.",
  },
  {
    emoji: "💥",
    title: "Ultimate",
    body: "Tiap 5 jurus berhasil = ultimate charge penuh. Ketik kata pamungkas karakter (10-17 huruf) untuk damage gede yang gak bisa di-block CPU. Unblockable!",
  },
];

export default function TutorialOverlay({ onClose }: TutorialOverlayProps) {
  const [slide, setSlide] = useState(0);
  const isLast = slide === SLIDES.length - 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-3 md:p-4">
      <div className="max-w-md w-full bg-gray-900 rounded-2xl border border-gray-700 p-5 md:p-8 font-mono">
        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-6">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === slide ? "bg-yellow-500 w-4" : "bg-gray-700"
              }`}
            />
          ))}
        </div>

        {/* Slide content */}
        <div className="text-center">
          <div className="text-4xl md:text-5xl mb-3 md:mb-4">{SLIDES[slide].emoji}</div>
          <h3 className="text-lg md:text-xl font-bold text-yellow-500 mb-2 md:mb-3">{SLIDES[slide].title}</h3>
          <p className="text-gray-300 text-xs md:text-sm leading-relaxed">{SLIDES[slide].body}</p>
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={onClose}
            className="text-gray-500 text-xs hover:text-gray-400 transition-colors"
          >
            SKIP
          </button>
          {!isLast ? (
            <button
              onClick={() => setSlide((s) => s + 1)}
              className="px-6 py-2 bg-yellow-500 text-black font-bold text-sm rounded-lg hover:bg-yellow-400 transition-all"
            >
              LANJUT →
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-green-500 text-black font-bold text-sm rounded-lg hover:bg-green-400 transition-all"
            >
              GAS! ⚔️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
