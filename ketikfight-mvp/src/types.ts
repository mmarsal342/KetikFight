export type GamePhase = "idle" | "select" | "playing" | "win" | "lose";

export interface Projectile {
  id: number;
  word: string;
  dmg: number;
  fromPlayer: boolean;
  t0: number;
}

export interface AttackWord {
  word: string;
  dmg: number;
  tier: 1 | 2 | 3 | 4;
}

export interface DefenseWord {
  type: "block" | "shield" | "dodge_counter";
  charges?: number;
  counter?: number;
  word: string;
}

export type DefenseMap = Record<string, DefenseWord>;

export const LOMPAT_COOLDOWN = 8000;

export const MAX_HP = 100;
export const TRAVEL_MS = 2200;

export const YELLOW = "#fde047";
export const YELLOW_GLOW = "rgba(253, 224, 71, 0.8)";
export const RED = "#f87171";
export const RED_GLOW = "rgba(248, 113, 113, 0.8)";