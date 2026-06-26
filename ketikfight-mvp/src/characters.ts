export type JurusTier = 1 | 2 | 3;
export type JurusType = "attack" | "defense";
export type DefenseType = "block" | "shield" | "dodge_counter";

export interface Jurus {
  word: string;
  dmg: number;
  tier: JurusTier;
  type: JurusType;
  defenseType?: DefenseType;
  counter?: number;
  shieldCharges?: number;
}

export interface Character {
  id: string;
  name: string;
  title: string;
  emoji: string;
  color: string;
  description: string;
  passive: string;
  damageMod: number;
  refillMod: number;
  jurus: Jurus[];
  ultimate: Jurus;
}

export interface SlotState {
  jurus: Jurus | null;
  refillAt: number;
  refillDuration: number;
}

export const ULT_THRESHOLD = 5;

export const REFILL_DELAYS: Record<number, number> = {
  1: 500,
  2: 1000,
  3: 1500,
};

export type ResonanceLevel = 0 | 1 | 2 | 3;

export function detectResonance(slots: SlotState[], usedIdx: number): ResonanceLevel {
  const slot = slots[usedIdx];
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

export const RESONANCE_CONFIG = {
  attack: {
    1: { dmgMult: 1, label: "" },
    2: { dmgMult: 2, label: "GEBYAR x2" },
    3: { dmgMult: 4, label: "GEBYAR x4!" },
  },
  block: {
    1: { removeCount: 2, counter: 0, label: "" },
    2: { removeCount: 3, counter: 10, label: "GEBYAR x2" },
    3: { removeCount: 999, counter: 30, label: "GEBYAR x3!" },
  },
  shield: {
    1: { charges: 2, invulnMs: 0, label: "" },
    2: { charges: 3, invulnMs: 3000, label: "GEBYAR x2" },
    3: { charges: 5, invulnMs: 5000, label: "GEBYAR x3!" },
  },
  dodge_counter: {
    1: { dodgeCount: 1, counter: 5, resetCd: false, label: "" },
    2: { dodgeCount: 1, counter: 10, resetCd: true, label: "GEBYAR x2" },
    3: { dodgeCount: 2, counter: 30, resetCd: true, label: "GEBYAR x3!" },
  },
};

export interface ComboTier {
  threshold: number;
  label: string;
  multiplier: number;
  color: string;
}

export const COMBO_TIERS: ComboTier[] = [
  { threshold: 3, label: "Beruntun", multiplier: 1.10, color: "#4ade80" },
  { threshold: 5, label: "Ganas", multiplier: 1.20, color: "#fbbf24" },
  { threshold: 8, label: "Badai", multiplier: 1.35, color: "#fb923c" },
  { threshold: 12, label: "LAGA SEMPURNA", multiplier: 1.50, color: "#ef4444" },
];

export function getComboMultiplier(combo: number): { mult: number; tier: ComboTier | null } {
  let result: { mult: number; tier: ComboTier | null } = { mult: 1.0, tier: null };
  for (const t of COMBO_TIERS) {
    if (combo >= t.threshold) result = { mult: t.multiplier, tier: t };
  }
  return result;
}

export const CHARACTERS: Character[] = [
  {
    id: "pendekar",
    name: "PENDEKAR",
    title: "Heavy Hitter",
    emoji: "🥋",
    color: "#f97316",
    description: "Master silat. Damage gede, tapi reload lama.",
    passive: "+20% damage, refill 30% lebih lama",
    damageMod: 1.2,
    refillMod: 1.3,
    jurus: [
      { word: "SABET", dmg: 20, tier: 1, type: "attack" },
      { word: "BANTING", dmg: 26, tier: 2, type: "attack" },
      { word: "TENDANG", dmg: 33, tier: 2, type: "attack" },
      { word: "GEBRAK", dmg: 26, tier: 2, type: "attack" },
      { word: "TERJANG", dmg: 33, tier: 3, type: "attack" },
      { word: "TANGKIS", dmg: 0, tier: 2, type: "defense", defenseType: "block" },
    ],
    ultimate: { word: "MENGHANCURKAN", dmg: 65, tier: 3, type: "attack" },
  },
  {
    id: "ninja",
    name: "NINJA",
    title: "Speed Demon",
    emoji: "🥷",
    color: "#06b6d4",
    description: "Cepet, lincah, damage kecil tapi spamable.",
    passive: "Refill 30% lebih cepat, damage -15%",
    damageMod: 0.85,
    refillMod: 0.7,
    jurus: [
      { word: "TIKAM", dmg: 16, tier: 1, type: "attack" },
      { word: "TEBAS", dmg: 16, tier: 1, type: "attack" },
      { word: "ILUSI", dmg: 18, tier: 1, type: "attack" },
      { word: "SAYAT", dmg: 16, tier: 1, type: "attack" },
      { word: "PEDANG", dmg: 24, tier: 2, type: "attack" },
      { word: "LOMPAT", dmg: 5, tier: 1, type: "defense", defenseType: "dodge_counter", counter: 5 },
    ],
    ultimate: { word: "MENGHABISI", dmg: 48, tier: 3, type: "attack" },
  },
  {
    id: "berandal",
    name: "BERANDAL",
    title: "Street Berserker",
    emoji: "👊",
    color: "#dc2626",
    description: "Brawler agresif. Damage medium, refill cepet.",
    passive: "+10% damage, refill 10% lebih cepat",
    damageMod: 1.1,
    refillMod: 0.9,
    jurus: [
      { word: "HAJAR", dmg: 18, tier: 1, type: "attack" },
      { word: "GEBUK", dmg: 18, tier: 1, type: "attack" },
      { word: "PUKUL", dmg: 20, tier: 1, type: "attack" },
      { word: "BANTAI", dmg: 26, tier: 2, type: "attack" },
      { word: "LABRAK", dmg: 26, tier: 2, type: "attack" },
      { word: "PERISAI", dmg: 0, tier: 2, type: "defense", defenseType: "shield", shieldCharges: 2 },
    ],
    ultimate: { word: "MEMBERONDONG", dmg: 58, tier: 3, type: "attack" },
  },
];

export function getCharacterById(id: string): Character | undefined {
  return CHARACTERS.find((c) => c.id === id);
}

export function shuffleDeck(jurus: Jurus[]): Jurus[] {
  const arr = [...jurus];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getRefillDelay(jurus: Jurus, refillMod: number): number {
  const base = REFILL_DELAYS[jurus.tier] ?? 1000;
  return Math.round(base * refillMod);
}

export function createDeckManager(character: Character) {
  let deck: Jurus[] = shuffleDeck(character.jurus);
  let idx = 0;

  return {
    draw(): Jurus {
      if (idx >= deck.length) {
        deck = shuffleDeck(character.jurus);
        idx = 0;
      }
      return deck[idx++];
    },
    reset() {
      deck = shuffleDeck(character.jurus);
      idx = 0;
    },
  };
}
