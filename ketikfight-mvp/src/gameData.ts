import type { AttackWord, DefenseMap } from "./types";

export const ATTACKS: AttackWord[] = [
  { word: "HAJAR", dmg: 18, tier: 1 },
  { word: "SIKAT", dmg: 18, tier: 1 },
  { word: "GADA", dmg: 15, tier: 1 },
  { word: "BURU", dmg: 14, tier: 1 },
  { word: "PUKUL", dmg: 20, tier: 1 },
  { word: "TINJU", dmg: 20, tier: 1 },
  { word: "GEBUK", dmg: 20, tier: 1 },
  { word: "HANTAM", dmg: 26, tier: 2 },
  { word: "BANTAI", dmg: 26, tier: 2 },
  { word: "SERANG", dmg: 24, tier: 2 },
  { word: "GEBRAK", dmg: 26, tier: 2 },
  { word: "GILAS", dmg: 22, tier: 2 },
  { word: "LABRAK", dmg: 26, tier: 2 },
  { word: "TEBAS", dmg: 22, tier: 2 },
  { word: "TENDANG", dmg: 33, tier: 3 },
  { word: "TERJANG", dmg: 33, tier: 3 },
  { word: "GEBARAN", dmg: 33, tier: 3 },
  { word: "TUMBANG", dmg: 33, tier: 3 },
  { word: "GEMPITA", dmg: 33, tier: 3 },
];

export const DEFENSES: DefenseMap = {
  TANGKIS: { type: "block", word: "TANGKIS" },
  PERISAI: { type: "shield", charges: 2, word: "PERISAI" },
  LOMPAT: { type: "dodge_counter", counter: 5, word: "LOMPAT" },
};

export const CPU_POOL: AttackWord[] = [
  { word: "PUKUL", dmg: 15, tier: 1 },
  { word: "HAJAR", dmg: 18, tier: 1 },
  { word: "SIKAT", dmg: 15, tier: 1 },
  { word: "HANTAM", dmg: 22, tier: 2 },
  { word: "TENDANG", dmg: 28, tier: 3 },
  { word: "TERJANG", dmg: 28, tier: 3 },
];

export const MIN_CPU_DELAY = 3000;
export const MAX_CPU_DELAY = 5000;
export const MAX_PERISAI_CHARGES = 3;

export const CPU_DEFENSE_TIERS = [
  { hpThreshold: 20, blockChance: 0.45 },
  { hpThreshold: 40, blockChance: 0.30 },
  { hpThreshold: 70, blockChance: 0.15 },
];

export function getRandomAttack(pool: AttackWord[]): AttackWord {
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getCpuBlockChance(cpuHP: number): number {
  for (const tier of CPU_DEFENSE_TIERS) {
    if (cpuHP <= tier.hpThreshold) return tier.blockChance;
  }
  return 0;
}