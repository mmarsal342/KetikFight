import { useState, useRef, useEffect, useCallback } from "react";
import type { GamePhase, Projectile } from "../types";
import { LOMPAT_COOLDOWN, MAX_HP, TRAVEL_MS } from "../types";
import {
  DIFFICULTIES,
  getRandomAttack,
} from "../gameData";
import type { Difficulty } from "../gameData";
import {
  CHARACTERS,
  ULT_THRESHOLD,
  getComboMultiplier,
  createDeckManager,
  getRefillDelay,
  detectResonance,
  RESONANCE_CONFIG,
} from "../characters";
import type { Character, Jurus, SlotState, ResonanceLevel } from "../characters";
import { sfx, setSoundEnabled, initAudio } from "../sound";

import HPBar from "./HPBar";
import Stickman from "./Stickman";
import ProjectileEl from "./Projectile";
import OverlayPanel from "./OverlayPanel";
import ArenaBackground from "./ArenaBackground";
import ShieldIndicator from "./ShieldIndicator";
import LompattCdIndicator from "./LompattCdIndicator";
import InputField from "./InputField";
import HUDBar from "./HUDBar";
import ComboDisplay from "./ComboDisplay";
import ParryIndicator from "./ParryIndicator";
import JurusSlots from "./JurusSlots";
import CharacterSelect from "./CharacterSelect";
import TutorialOverlay from "./TutorialOverlay";
import Footer from "./Footer";
import IncomingWarning from "./IncomingWarning";

const PARRY_WINDOW = 0.65;
const PARRY_COOLDOWN = 1000;

export default function KetikFight() {
  // Refs — game logic source of truth
  const pHPRef = useRef<number>(MAX_HP);
  const cHPRef = useRef<number>(MAX_HP);
  const cMaxHPRef = useRef<number>(120);
  const dmgReduceRef = useRef<number>(0.10);
  const blockMultRef = useRef<number>(0.8);
  const comboRef = useRef<number>(0);
  const projsRef = useRef<Projectile[]>([]);
  const shieldRef = useRef<number>(0);
  const phaseRef = useRef<GamePhase>("idle");
  const lompattCdRef = useRef<number>(0);
  const parryCdRef = useRef<number>(0);
  const invulnRef = useRef<number>(0);
  const maxShieldRef = useRef<number>(3);
  const pidRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const cpuTimerRef = useRef<number>(0);
  const msgTimerRef = useRef<number>(0);
  const countdownTimerRef = useRef<number>(0);
  const totalCharsRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const diffRef = useRef<Difficulty>("normal");

  // Character / slot refs
  const charRef = useRef<Character>(CHARACTERS[0]);
  const deckMgrRef = useRef<{ draw: () => Jurus; reset: () => void } | null>(null);
  const slotsRef = useRef<SlotState[]>([]);
  const ultChargeRef = useRef<number>(0);
  const ultReadyRef = useRef<boolean>(false);

  // State — render triggers
  const [playerHP, setPlayerHP] = useState(MAX_HP);
  const [cpuHP, setCpuHP] = useState(120);
  const [cpuMaxHP, setCpuMaxHP] = useState(120);
  const [projs, setProjs] = useState<Projectile[]>([]);
  const [shield, setShield] = useState(0);
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [wpm, setWpm] = useState(0);
  const [input, setInput] = useState("");
  const [frame, setFrame] = useState(0);
  const [lompattCdEnd, setLompattCdEnd] = useState(0);
  const [playerGuarding, setPlayerGuarding] = useState(false);
  const [cpuGuarding, setCpuGuarding] = useState(false);
  const [toast, setToast] = useState<{ id: number; text: string; type: string } | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [selectedChar, setSelectedChar] = useState<string>("pendekar");
  const [slots, setSlots] = useState<SlotState[]>([]);
  const [ultCharge, setUltCharge] = useState(0);
  const [ultReady, setUltReady] = useState(false);
  const [combo, setCombo] = useState(0);
  const [parryFlash, setParryFlash] = useState<"success" | "miss" | null>(null);
  const [parryCdEnd, setParryCdEnd] = useState(0);
  const [invulnEnd, setInvulnEnd] = useState(0);
  const [showTutorial, setShowTutorial] = useState(() => {
    return typeof localStorage !== "undefined" && !localStorage.getItem("ketikfight_tutorial_done");
  });

  const character = charRef.current;

  const stopAll = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    clearTimeout(cpuTimerRef.current);
    clearTimeout(msgTimerRef.current);
    clearTimeout(countdownTimerRef.current);
  }, []);

  const showToast = useCallback((text: string, type: string = "info") => {
    const id = Date.now();
    setToast({ id, text, type });
    clearTimeout(msgTimerRef.current);
    msgTimerRef.current = window.setTimeout(() => setToast(null), 1200);
  }, []);

  const updateWPM = useCallback((charsTyped: number) => {
    const now = Date.now();
    if (!startTimeRef.current) {
      startTimeRef.current = now;
      return;
    }
    const elapsedSec = (now - startTimeRef.current) / 1000;
    if (elapsedSec < 5) return;
    totalCharsRef.current += charsTyped;
    const elapsedMin = elapsedSec / 60;
    setWpm(Math.round(totalCharsRef.current / 5 / elapsedMin));
  }, []);

  const checkWinLose = useCallback(() => {
    if (cHPRef.current <= 0) {
      phaseRef.current = "win";
      setPhase("win");
      stopAll();
      sfx.win();
    } else if (pHPRef.current <= 0) {
      phaseRef.current = "lose";
      setPhase("lose");
      stopAll();
      sfx.lose();
    }
  }, [stopAll]);

  const syncSlots = useCallback(() => {
    setSlots(slotsRef.current.map((s) => ({ ...s })));
  }, []);

  const addCombo = useCallback(() => {
    const prev = comboRef.current;
    comboRef.current++;
    setCombo(comboRef.current);
    const prevTier = getComboMultiplier(prev);
    const newTier = getComboMultiplier(comboRef.current);
    if (newTier.tier && (!prevTier.tier || newTier.tier.threshold > prevTier.tier.threshold)) {
      showToast(`${newTier.tier.label}! x${newTier.tier.multiplier}`, "success");
      sfx.ultReady();
    }
  }, [showToast]);

  const resetCombo = useCallback(() => {
    if (comboRef.current >= 3) {
      showToast("COMBO BREAK!", "error");
      sfx.playerHit();
    }
    comboRef.current = 0;
    setCombo(0);
  }, [showToast]);

  const addUltCharge = useCallback(() => {
    if (ultReadyRef.current) return;
    ultChargeRef.current++;
    setUltCharge(ultChargeRef.current);
    if (ultChargeRef.current >= ULT_THRESHOLD) {
      ultReadyRef.current = true;
      setUltReady(true);
      sfx.ultReady();
    }
  }, []);

  // CPU attack scheduler
  const scheduleCpuAttack = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    const diff = DIFFICULTIES[diffRef.current];
    const attack = getRandomAttack(diff.pool);
    const proj: Projectile = {
      id: ++pidRef.current,
      word: attack.word,
      dmg: attack.dmg,
      fromPlayer: false,
      t0: Date.now(),
    };
    projsRef.current = [...projsRef.current, proj];
    setProjs([...projsRef.current]);
    const delay = diff.minDelay + Math.random() * (diff.maxDelay - diff.minDelay);
    cpuTimerRef.current = window.setTimeout(scheduleCpuAttack, delay);
  }, []);

  // RAF loop
  useEffect(() => {
    if (phase !== "playing") return;
    const tick = () => {
      if (phaseRef.current !== "playing") return;
      setFrame((f) => f + 1);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  // Hit detection + slot refill check
  useEffect(() => {
    if (phase !== "playing") return;
    const now = Date.now();
    const done = new Set<number>();
    let playerTookDamage = false;

    for (const p of projsRef.current) {
      const progress = (now - p.t0) / TRAVEL_MS;
      if (progress < 1) continue;
      done.add(p.id);

      if (p.fromPlayer) {
        if (p.isUltimate) {
          cHPRef.current = Math.max(0, cHPRef.current - p.dmg);
          setCpuHP(cHPRef.current);
          showToast(`ULTIMATE! -${p.dmg}!`, "success");
          sfx.ultFire();
        } else {
          const blockChance = getCpuBlockChance(cHPRef.current, cMaxHPRef.current, blockMultRef.current);
          if (Math.random() < blockChance) {
            setCpuGuarding(true);
            setTimeout(() => setCpuGuarding(false), 200);
            showToast("CPU BLOCK!", "error");
            sfx.cpuBlock();
          } else {
            const finalDmg = Math.max(1, Math.round(p.dmg * (1 - dmgReduceRef.current)));
            cHPRef.current = Math.max(0, cHPRef.current - finalDmg);
            setCpuHP(cHPRef.current);
            showToast(`-${finalDmg}!`, "success");
            sfx.hit();
            addCombo();
          }
        }
      } else if (now < invulnRef.current) {
        // Invulnerable from PERISAI resonance — shield halves instead of 1
        if (shieldRef.current > 0) {
          shieldRef.current = Math.floor(shieldRef.current / 2);
          setShield(shieldRef.current);
          showToast("INVULN! Shield halved", "info");
          sfx.shield();
        }
      } else if (shieldRef.current > 0) {
        shieldRef.current--;
        setShield(shieldRef.current);
        showToast("BLOCKED!", "info");
        sfx.shield();
      } else {
        pHPRef.current = Math.max(0, pHPRef.current - p.dmg);
        setPlayerHP(pHPRef.current);
        sfx.playerHit();
        playerTookDamage = true;
      }
    }

    if (playerTookDamage) resetCombo();

    if (done.size > 0) {
      projsRef.current = projsRef.current.filter((p) => !done.has(p.id));
      setProjs([...projsRef.current]);
      checkWinLose();
    }

    // Slot refill check
    let slotsChanged = false;
    for (const slot of slotsRef.current) {
      if (!slot.jurus && now >= slot.refillAt && deckMgrRef.current) {
        slot.jurus = deckMgrRef.current.draw();
        slotsChanged = true;
        sfx.slotRefill();
      }
    }
    if (slotsChanged) syncSlots();
  }, [frame, phase, checkWinLose, showToast, syncSlots, addCombo, resetCombo]);

  const firePlayerAttack = useCallback(
    (word: string, dmg: number, isUltimate: boolean = false) => {
      let finalDmg = dmg;
      if (!isUltimate) {
        const { mult } = getComboMultiplier(comboRef.current);
        finalDmg = Math.round(dmg * mult);
      }
      const proj: Projectile = {
        id: ++pidRef.current,
        word,
        dmg: finalDmg,
        fromPlayer: true,
        t0: Date.now(),
        isUltimate,
      };
      projsRef.current = [...projsRef.current, proj];
      setProjs([...projsRef.current]);
      setPlayerGuarding(true);
      setTimeout(() => setPlayerGuarding(false), 150);
      if (!isUltimate) sfx.whoosh();
    },
    [],
  );

  const executeDefense = useCallback(
    (jurus: Jurus, resonance: ResonanceLevel) => {
      setPlayerGuarding(true);
      setTimeout(() => setPlayerGuarding(false), 200);
      const lvl = (resonance || 1) as 1 | 2 | 3;

      if (jurus.defenseType === "block") {
        const cfg = RESONANCE_CONFIG.block[lvl];
        const cpuProjs = projsRef.current.filter((p) => !p.fromPlayer);
        const removeCount = Math.min(cfg.removeCount, cpuProjs.length);
        const removed = cpuProjs.slice(0, removeCount);
        const removedIds = new Set(removed.map((p) => p.id));
        projsRef.current = projsRef.current.filter((p) => !removedIds.has(p.id));
        setProjs([...projsRef.current]);
        let label = removed.length > 1 ? `TANGKIS x${removed.length}!` : "TANGKIS!";
        if (cfg.counter > 0) {
          const counterDmg = Math.round(cfg.counter * charRef.current.damageMod);
          cHPRef.current = Math.max(0, cHPRef.current - counterDmg);
          setCpuHP(cHPRef.current);
          label += ` Counter -${counterDmg}!`;
        }
        showToast(cfg.label || label, cfg.counter > 0 ? "success" : "info");
        sfx.clang();
        if (resonance >= 2) sfx.resonance();
        checkWinLose();
      } else if (jurus.defenseType === "shield") {
        const cfg = RESONANCE_CONFIG.shield[lvl];
        maxShieldRef.current = Math.max(maxShieldRef.current, cfg.charges);
        if (shieldRef.current >= maxShieldRef.current && cfg.invulnMs === 0) {
          showToast("SHIELD MAX!", "error");
          return false;
        }
        const newCharges = Math.min(shieldRef.current + cfg.charges, maxShieldRef.current);
        shieldRef.current = newCharges;
        setShield(newCharges);
        if (cfg.invulnMs > 0) {
          invulnRef.current = Date.now() + cfg.invulnMs;
          setInvulnEnd(invulnRef.current);
          showToast(`SHIELD ${newCharges} + INVULN ${(cfg.invulnMs / 1000).toFixed(0)}s`, "info");
        } else {
          showToast(`SHIELD +${cfg.charges} (${newCharges})`, "info");
        }
        sfx.shield();
        if (resonance >= 2) sfx.resonance();
      } else if (jurus.defenseType === "dodge_counter") {
        const cfg = RESONANCE_CONFIG.dodge_counter[lvl];
        if (Date.now() < lompattCdRef.current && !cfg.resetCd) {
          showToast("LOMPAT cooldown!", "error");
          return false;
        }
        const cpuProjs = projsRef.current.filter((p) => !p.fromPlayer);
        for (let i = 0; i < cfg.dodgeCount && i < cpuProjs.length; i++) {
          projsRef.current = projsRef.current.filter((p) => p.id !== cpuProjs[i].id);
        }
        setProjs([...projsRef.current]);
        if (cfg.counter > 0) {
          const counterDmg = Math.round(cfg.counter * charRef.current.damageMod);
          cHPRef.current = Math.max(0, cHPRef.current - counterDmg);
          setCpuHP(cHPRef.current);
          showToast(`LOMPAT! -${counterDmg}`, "success");
        }
        if (cfg.resetCd) {
          lompattCdRef.current = 0;
          setLompattCdEnd(0);
        } else {
          lompattCdRef.current = Date.now() + LOMPAT_COOLDOWN;
          setLompattCdEnd(lompattCdRef.current);
        }
        sfx.lompat();
        if (resonance >= 2) sfx.resonance();
        checkWinLose();
      }
      return true;
    },
    [showToast, checkWinLose],
  );

  const useSlot = useCallback(
    (slotIdx: number) => {
      const slot = slotsRef.current[slotIdx];
      if (!slot.jurus) return;
      const jurus = slot.jurus;
      const resonance = detectResonance(slotsRef.current, slotIdx);
      const lvl = (resonance || 1) as 1 | 2 | 3;

      if (jurus.type === "defense") {
        const success = executeDefense(jurus, resonance);
        if (success === false) return;
      } else {
        const cfg = RESONANCE_CONFIG.attack[lvl];
        const baseDmg = Math.round(jurus.dmg * charRef.current.damageMod * cfg.dmgMult);
        firePlayerAttack(jurus.word, baseDmg);
        if (resonance >= 2) {
          showToast(cfg.label, "success");
          sfx.resonance();
        }
      }

      // Consume all matching slots
      const delay = getRefillDelay(jurus, charRef.current.refillMod);
      for (let i = 0; i < slotsRef.current.length; i++) {
        const s = slotsRef.current[i];
        if (s.jurus && s.jurus.word === jurus.word) {
          s.jurus = null;
          s.refillAt = Date.now() + delay + (i * 100);
          s.refillDuration = delay + (i * 100);
        }
      }
      syncSlots();
      addUltCharge();
    },
    [firePlayerAttack, executeDefense, syncSlots, addUltCharge],
  );

  const useUltimate = useCallback(() => {
    if (!ultReadyRef.current) return;
    const ult = charRef.current.ultimate;
    const dmg = Math.round(ult.dmg * charRef.current.damageMod);
    firePlayerAttack(ult.word, dmg, true);
    showToast(`${ult.word}!`, "success");

    ultChargeRef.current = 0;
    ultReadyRef.current = false;
    setUltCharge(0);
    setUltReady(false);
  }, [firePlayerAttack, showToast]);

  const handleInput = useCallback(
    (v: string) => {
      setInput(v);
      if (phaseRef.current !== "playing") return;
      if (v.length > input.length) sfx.type();

      const slotIdx = slotsRef.current.findIndex((s) => s.jurus && s.jurus.word === v);
      if (slotIdx >= 0) {
        useSlot(slotIdx);
        setInput("");
        updateWPM(v.length);
        return;
      }

      if (ultReadyRef.current && charRef.current.ultimate.word === v) {
        useUltimate();
        setInput("");
        updateWPM(v.length);
      }
    },
    [input.length, useSlot, useUltimate, updateWPM],
  );

  const beginPlay = useCallback(() => {
    const diff = DIFFICULTIES[diffRef.current];

    pHPRef.current = MAX_HP;
    cHPRef.current = diff.cpuHP;
    cMaxHPRef.current = diff.cpuHP;
    dmgReduceRef.current = diff.damageReduction;
    blockMultRef.current = diff.blockMult;
    projsRef.current = [];
    shieldRef.current = 0;
    lompattCdRef.current = 0;
    parryCdRef.current = 0;
    invulnRef.current = 0;
    maxShieldRef.current = 3;
    phaseRef.current = "playing";
    totalCharsRef.current = 0;
    startTimeRef.current = 0;
    pidRef.current = 0;
    ultChargeRef.current = 0;
    ultReadyRef.current = false;
    comboRef.current = 0;

    deckMgrRef.current = createDeckManager(charRef.current);
    slotsRef.current = [
      { jurus: deckMgrRef.current.draw(), refillAt: 0, refillDuration: 0 },
      { jurus: deckMgrRef.current.draw(), refillAt: 0, refillDuration: 0 },
      { jurus: deckMgrRef.current.draw(), refillAt: 0, refillDuration: 0 },
    ];

    setPlayerHP(MAX_HP);
    setCpuHP(diff.cpuHP);
    setCpuMaxHP(diff.cpuHP);
    setProjs([]);
    setShield(0);
    setWpm(0);
    setInput("");
    setFrame(0);
    setLompattCdEnd(0);
    setUltCharge(0);
    setUltReady(false);
    setCombo(0);
    setParryCdEnd(0);
    setInvulnEnd(0);
    syncSlots();
    setPhase("playing");

    cpuTimerRef.current = window.setTimeout(scheduleCpuAttack, 2000);
    sfx.start();
  }, [scheduleCpuAttack, syncSlots]);

  const startCountdown = useCallback(() => {
    initAudio();
    stopAll();

    const diff = DIFFICULTIES[diffRef.current];
    pHPRef.current = MAX_HP;
    cHPRef.current = diff.cpuHP;
    setPlayerHP(MAX_HP);
    setCpuHP(diff.cpuHP);
    setCpuMaxHP(diff.cpuHP);
    setProjs([]);
    setPhase("idle");
    setCountdown(3);
    sfx.type();

    let n = 3;
    const tick = () => {
      n--;
      if (n > 0) {
        setCountdown(n);
        sfx.type();
        countdownTimerRef.current = window.setTimeout(tick, 700);
      } else {
        setCountdown(null);
        beginPlay();
      }
    };
    countdownTimerRef.current = window.setTimeout(tick, 700);
  }, [stopAll, beginPlay]);

  const goToSelect = useCallback(() => {
    stopAll();
    phaseRef.current = "select";
    setPhase("select");
    setCountdown(null);
  }, [stopAll]);

  const toggleSound = useCallback(() => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) {
      initAudio();
      sfx.select();
    }
  }, [soundOn]);

  // Parry — Spacebar to deflect closest CPU projectile in timing window
  const tryParry = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    const now = Date.now();
    if (now < parryCdRef.current) return;

    parryCdRef.current = now + PARRY_COOLDOWN;

    let bestProj: Projectile | null = null;
    let bestProgress = 0;

    for (const p of projsRef.current) {
      if (p.fromPlayer) continue;
      const progress = (now - p.t0) / TRAVEL_MS;
      if (progress >= PARRY_WINDOW && progress < 1) {
        if (!bestProj || progress > bestProgress) {
          bestProj = p;
          bestProgress = progress;
        }
      }
    }

    if (bestProj) {
      projsRef.current = projsRef.current.filter((p) => p.id !== bestProj!.id);
      setProjs([...projsRef.current]);
      showToast("PARRY!", "success");
      sfx.parry();
      setParryFlash("success");
      setTimeout(() => setParryFlash(null), 300);
    } else {
      setInput("");
      showToast("PARRY MISS!", "error");
      sfx.parryMiss();
      setParryFlash("miss");
      setTimeout(() => setParryFlash(null), 300);
    }
    setParryCdEnd(parryCdRef.current);
  }, [showToast]);

  // Spacebar listener
  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        tryParry();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, tryParry]);

  const closeTutorial = useCallback(() => {
    setShowTutorial(false);
    localStorage.setItem("ketikfight_tutorial_done", "1");
  }, []);

  const partialMatch = (() => {
    if (!input || input.length < 1) return null;
    for (const slot of slotsRef.current) {
      if (slot.jurus && slot.jurus.word.startsWith(input) && slot.jurus.word !== input) {
        return slot.jurus.word;
      }
    }
    if (ultReadyRef.current && charRef.current.ultimate.word.startsWith(input) && charRef.current.ultimate.word !== input) {
      return charRef.current.ultimate.word;
    }
    return null;
  })();

  return (
    <div className="relative w-full h-screen bg-gray-950 overflow-hidden font-mono select-none">
      <ArenaBackground />
      <HUDBar wpm={wpm} phase={phase} />

      {/* Sound Toggle + Help */}
      <div className="absolute top-4 right-4 z-30 flex gap-2">
        <button
          onClick={() => setShowTutorial(true)}
          className="px-3 py-1.5 bg-black/50 rounded-lg font-mono text-sm hover:bg-black/70 transition-colors"
        >
          ?
        </button>
        <button
          onClick={toggleSound}
          className="px-3 py-1.5 bg-black/50 rounded-lg font-mono text-sm hover:bg-black/70 transition-colors"
        >
          {soundOn ? "🔊 ON" : "🔇 OFF"}
        </button>
      </div>

      {/* Character indicator during play */}
      {phase === "playing" && (
        <div className="absolute top-4 left-4 z-20">
          <span className="font-mono text-sm" style={{ color: character.color }}>
            {character.emoji} {character.name}
          </span>
        </div>
      )}

      {/* Combo Display */}
      {phase === "playing" && combo >= 3 && (
        <ComboDisplay combo={combo} />
      )}

      {/* Parry cooldown indicator (desktop) */}
      {phase === "playing" && (
        <div className="absolute top-4 right-24 z-20 hidden md:block">
          <ParryIndicator cdEnd={parryCdEnd} />
        </div>
      )}

      {/* Mobile parry button */}
      {phase === "playing" && (
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            tryParry();
          }}
          onMouseDown={(e) => e.preventDefault()}
          className="md:hidden absolute bottom-40 right-4 z-30 w-16 h-16 rounded-full bg-cyan-600/80 border-2 border-cyan-400 font-mono font-bold text-white text-xs flex items-center justify-center active:scale-90 transition-transform touch-none"
          style={{ boxShadow: "0 0 10px rgba(34, 211, 238, 0.4)" }}
        >
          PARRY
        </button>
      )}

      {/* Parry flash overlay */}
      {parryFlash && (
        <div
          className={`fixed inset-0 z-40 pointer-events-none transition-opacity duration-300 ${
            parryFlash === "success" ? "bg-cyan-400/20" : "bg-red-500/20"
          }`}
        />
      )}

      {/* Arena */}
      <div className="absolute inset-0">
        <Stickman hp={playerHP} maxHp={MAX_HP} isPlayer={true} isGuarding={playerGuarding} />
        <Stickman hp={cpuHP} maxHp={cpuMaxHP} isPlayer={false} isGuarding={cpuGuarding} />
        {projs.map((p) => (
          <ProjectileEl key={p.id} p={p} />
        ))}
      </div>

      {/* HP Bars */}
      <HPBar hp={playerHP} maxHp={MAX_HP} isPlayer={true} phase={phase} />
      <HPBar hp={cpuHP} maxHp={cpuMaxHP} isPlayer={false} phase={phase} />

      {/* Indicators */}
      <ShieldIndicator charges={shield} />
      <LompattCdIndicator lompattCdEnd={lompattCdEnd} />

      {/* Toast */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50">
          <div
            className={`px-4 py-2 rounded font-mono font-bold text-white shadow-lg ${
              toast.type === "success"
                ? "bg-green-600"
                : toast.type === "error"
                  ? "bg-red-600"
                  : "bg-blue-600"
            }`}
          >
            {toast.text}
          </div>
        </div>
      )}

      {/* Bottom UI — Warning + Slots + Input */}
      {phase === "playing" && (
        <div className="absolute bottom-0 left-0 right-0 p-2 md:p-4 space-y-2">
          <IncomingWarning projectiles={projs} />
          <JurusSlots
            slots={slots}
            character={character}
            ultCharge={ultCharge}
            ultReady={ultReady}
            typedInput={input}
            invulnEnd={invulnEnd}
          />
          <InputField
            value={input}
            onChange={handleInput}
            disabled={phase !== "playing"}
            partialMatch={partialMatch}
          />
        </div>
      )}

      {/* Countdown */}
      {countdown !== null && phase !== "playing" && (
        <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
          <div
            key={countdown}
            className="text-6xl md:text-9xl font-mono font-bold text-yellow-500 animate-ping"
            style={{ textShadow: "0 0 30px rgba(253, 224, 71, 0.8)" }}
          >
            {countdown}
          </div>
        </div>
      )}

      {/* Character Select */}
      {phase === "select" && (
        <CharacterSelect
          selectedChar={selectedChar}
          difficulty={difficulty}
          onSelectChar={(id) => {
            setSelectedChar(id);
            charRef.current = CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
            sfx.select();
          }}
          onSelectDifficulty={(d) => {
            setDifficulty(d);
            diffRef.current = d;
            sfx.select();
          }}
          onFight={startCountdown}
        />
      )}

      {/* Overlay — idle / win / lose */}
      {phase !== "select" && phase !== "playing" && countdown === null && (
        <OverlayPanel
          phase={phase}
          wpm={wpm}
          difficulty={difficulty}
          onStart={goToSelect}
          onRestart={goToSelect}
        />
      )}

      {/* Footer */}
      <Footer />

      {/* Tutorial */}
      {showTutorial && <TutorialOverlay onClose={closeTutorial} />}
    </div>
  );
}

function getCpuBlockChance(cpuHP: number, maxHP: number, blockMult: number): number {
  const ratio = cpuHP / maxHP;
  let baseChance: number;
  if (ratio <= 0.2) baseChance = 0.45;
  else if (ratio <= 0.4) baseChance = 0.30;
  else if (ratio <= 0.7) baseChance = 0.15;
  else baseChance = 0;
  return Math.min(0.6, baseChance * blockMult);
}
