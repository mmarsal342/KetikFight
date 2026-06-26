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
  { word: "GEBUK", dmg: 20, tier: 1 },
  { word: "TENDANG", dmg: 28, tier: 3 },
  { word: "TERJANG", dmg: 28, tier: 3 },
  { word: "BANTAI", dmg: 26, tier: 2 },
  { word: "SERANGAN", dmg: 35, tier: 3 },
];

export type Difficulty = "mudah" | "normal" | "keras" | "gila";

export interface DifficultyConfig {
  label: string;
  emoji: string;
  minDelay: number;
  maxDelay: number;
  pool: AttackWord[];
  maxProjs: number;
  cpuHP: number;
  damageReduction: number;
  blockMult: number;
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  mudah: {
    label: "MUDAH",
    emoji: "🟢",
    minDelay: 5000,
    maxDelay: 8000,
    pool: CPU_POOL.filter((a) => a.tier === 1),
    maxProjs: 1,
    cpuHP: 80,
    damageReduction: 0,
    blockMult: 0.6,
  },
  normal: {
    label: "NORMAL",
    emoji: "🟡",
    minDelay: 3000,
    maxDelay: 5000,
    pool: CPU_POOL.filter((a) => a.tier === 1 || a.tier === 2),
    maxProjs: 2,
    cpuHP: 120,
    damageReduction: 0.10,
    blockMult: 0.8,
  },
  keras: {
    label: "KERAS",
    emoji: "🔴",
    minDelay: 2000,
    maxDelay: 3500,
    pool: [...CPU_POOL],
    maxProjs: 2,
    cpuHP: 160,
    damageReduction: 0.20,
    blockMult: 1.0,
  },
  gila: {
    label: "GILA",
    emoji: "💀",
    minDelay: 1500,
    maxDelay: 2500,
    pool: [...CPU_POOL],
    maxProjs: 3,
    cpuHP: 200,
    damageReduction: 0.30,
    blockMult: 1.2,
  },
};

export const MAX_PERISAI_CHARGES = 3;

export const CPU_DEFENSE_TIERS = [
  { hpThreshold: 20, blockChance: 0.45 },
  { hpThreshold: 40, blockChance: 0.30 },
  { hpThreshold: 70, blockChance: 0.15 },
];

export function getRandomAttack(pool: AttackWord[]): AttackWord {
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getCpuBlockChance(cpuHP: number, maxHP: number, blockMult: number): number {
  const ratio = cpuHP / maxHP;
  let baseChance: number;
  if (ratio <= 0.2) baseChance = 0.45;
  else if (ratio <= 0.4) baseChance = 0.30;
  else if (ratio <= 0.7) baseChance = 0.15;
  else baseChance = 0;
  return Math.min(0.6, baseChance * blockMult);
}