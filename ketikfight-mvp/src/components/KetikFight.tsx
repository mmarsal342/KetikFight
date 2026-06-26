import { useState, useRef, useEffect, useCallback } from "react";
import type { GamePhase, Projectile } from "../types";
import {
  LOMPAT_COOLDOWN,
  MAX_HP,
  TRAVEL_MS,
} from "../types";
import {
  ATTACKS,
  DEFENSES,
  CPU_POOL,
  MAX_PERISAI_CHARGES,
  getRandomAttack,
} from "../gameData";

import { sfx, setSoundEnabled, initAudio } from "../sound";
import HPBar from "./HPBar";
import Stickman from "./Stickman";
import ProjectileEl from "./Projectile";
import OverlayPanel from "./OverlayPanel";
import ArenaBackground from "./ArenaBackground";
import ShieldIndicator from "./ShieldIndicator";
import LompattCdIndicator from "./LompattCdIndicator";
import InputField from "./InputField";
import WordCheatsheet from "./WordCheatsheet";
import HUDBar from "./HUDBar";

const CPU_MIN_DELAY = 3000;
const CPU_MAX_DELAY = 5000;

export default function KetikFight() {
  // Refs — source of truth for game logic
  const pHPRef = useRef<number>(MAX_HP);
  const cHPRef = useRef<number>(MAX_HP);
  const projsRef = useRef<Projectile[]>([]);
  const shieldRef = useRef<number>(0);
  const phaseRef = useRef<GamePhase>("idle");
  const lompattCdRef = useRef<number>(0);
  const pidRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const cpuTimerRef = useRef<number>(0);
  const msgTimerRef = useRef<number>(0);
  const totalCharsRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // State — render triggers
  const [playerHP, setPlayerHP] = useState(MAX_HP);
  const [cpuHP, setCpuHP] = useState(MAX_HP);
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

  const stopAll = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    clearTimeout(cpuTimerRef.current);
    clearTimeout(msgTimerRef.current);
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
    const calculated = Math.round(totalCharsRef.current / 5 / elapsedMin);
    setWpm(calculated);
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

  // CPU attack scheduler
  const scheduleCpuAttack = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    const attack = getRandomAttack(CPU_POOL);
    const proj: Projectile = {
      id: ++pidRef.current,
      word: attack.word,
      dmg: attack.dmg,
      fromPlayer: false,
      t0: Date.now(),
    };
    projsRef.current = [...projsRef.current, proj];
    setProjs([...projsRef.current]);
    const delay = CPU_MIN_DELAY + Math.random() * (CPU_MAX_DELAY - CPU_MIN_DELAY);
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

  // Hit detection — runs on every frame
  useEffect(() => {
    if (phase !== "playing") return;
    const now = Date.now();
    const done = new Set<number>();

    for (const p of projsRef.current) {
      const progress = (now - p.t0) / TRAVEL_MS;
      if (progress < 1) continue;
      done.add(p.id);

      if (p.fromPlayer) {
        // CPU passive defense
        const blockChance = getCpuBlockChance(cHPRef.current);
        if (Math.random() < blockChance) {
          setCpuGuarding(true);
          setTimeout(() => setCpuGuarding(false), 200);
          showToast("CPU BLOCK!", "error");
          sfx.cpuBlock();
        } else {
          cHPRef.current = Math.max(0, cHPRef.current - p.dmg);
          setCpuHP(cHPRef.current);
          showToast(`-${p.dmg}!`, "success");
          sfx.hit();
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
      }
    }

    if (done.size > 0) {
      projsRef.current = projsRef.current.filter((p) => !done.has(p.id));
      setProjs([...projsRef.current]);
      checkWinLose();
    }
  }, [frame, phase, checkWinLose, showToast]);

  const firePlayerAttack = useCallback(
    (word: string, dmg: number) => {
      const proj: Projectile = {
        id: ++pidRef.current,
        word,
        dmg,
        fromPlayer: true,
        t0: Date.now(),
      };
      projsRef.current = [...projsRef.current, proj];
      setProjs([...projsRef.current]);
      setPlayerGuarding(true);
      setTimeout(() => setPlayerGuarding(false), 150);
      sfx.whoosh();
    },
    [],
  );

  const executeDefense = useCallback(
    (word: string) => {
      const defense = DEFENSES[word];
      if (!defense) return;

      if (defense.type === "dodge_counter") {
        if (Date.now() < lompattCdRef.current) {
          showToast("LOMPAT cooldown!", "error");
          return;
        }
      }

      setPlayerGuarding(true);
      setTimeout(() => setPlayerGuarding(false), 200);

      if (defense.type === "block") {
        const cpuProjs = projsRef.current.filter((p) => !p.fromPlayer);
        const removed = cpuProjs.slice(0, 2);
        const removedIds = new Set(removed.map((p) => p.id));
        projsRef.current = projsRef.current.filter((p) => !removedIds.has(p.id));
        setProjs([...projsRef.current]);
        showToast(removed.length > 1 ? "TANGKIS x2!" : "TANGKIS!", "info");
        sfx.clang();
      } else if (defense.type === "shield") {
        if (shieldRef.current >= MAX_PERISAI_CHARGES) {
          showToast("SHIELD MAX!", "error");
          return;
        }
        const newCharges = Math.min(shieldRef.current + 2, MAX_PERISAI_CHARGES);
        shieldRef.current = newCharges;
        setShield(newCharges);
        showToast(`SHIELD +2 (${newCharges})`, "info");
        sfx.shield();
      } else if (defense.type === "dodge_counter") {
        const cpuProjs = projsRef.current.filter((p) => !p.fromPlayer);
        if (cpuProjs.length > 0) {
          projsRef.current = projsRef.current.filter((p) => p.id !== cpuProjs[0].id);
          setProjs([...projsRef.current]);
        }
        if (defense.counter) {
          cHPRef.current = Math.max(0, cHPRef.current - defense.counter);
          setCpuHP(cHPRef.current);
          showToast(`LOMPAT! -${defense.counter}`, "success");
        }
        lompattCdRef.current = Date.now() + LOMPAT_COOLDOWN;
        setLompattCdEnd(lompattCdRef.current);
        sfx.lompat();
        checkWinLose();
      }
    },
    [showToast, checkWinLose],
  );

  const handleInput = useCallback(
    (v: string) => {
      setInput(v);
      if (phaseRef.current !== "playing") return;
      if (v.length > input.length) sfx.type();

      const attack = ATTACKS.find((a) => a.word === v);
      if (attack) {
        firePlayerAttack(attack.word, attack.dmg);
        setInput("");
        updateWPM(attack.word.length);
        return;
      }

      if (DEFENSES[v]) {
        executeDefense(v);
        setInput("");
        updateWPM(v.length);
      }
    },
    [firePlayerAttack, executeDefense, updateWPM],
  );

  const startGame = useCallback(() => {
    initAudio();
    stopAll();
    pHPRef.current = MAX_HP;
    cHPRef.current = MAX_HP;
    projsRef.current = [];
    shieldRef.current = 0;
    lompattCdRef.current = 0;
    phaseRef.current = "playing";
    totalCharsRef.current = 0;
    startTimeRef.current = 0;
    pidRef.current = 0;

    setPlayerHP(MAX_HP);
    setCpuHP(MAX_HP);
    setProjs([]);
    setShield(0);
    setWpm(0);
    setInput("");
    setFrame(0);
    setLompattCdEnd(0);
    setPhase("playing");

    cpuTimerRef.current = window.setTimeout(scheduleCpuAttack, 2000);
    sfx.start();
  }, [stopAll, scheduleCpuAttack]);

  const toggleSound = useCallback(() => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) {
      initAudio();
      sfx.start();
    }
  }, [soundOn]);

  // Partial match finder
  const partialMatch = (() => {
    if (!input || input.length < 1) return null;
    const attackMatch = ATTACKS.find((a) => a.word.startsWith(input) && a.word !== input);
    if (attackMatch) return attackMatch.word;
    const defenseMatch = Object.keys(DEFENSES).find((w) => w.startsWith(input) && w !== input);
    if (defenseMatch) return defenseMatch;
    return null;
  })();

  const defenseList = Object.keys(DEFENSES).map((w) => ({
    word: w,
    type: DEFENSES[w].type,
  }));

  return (
    <div className="relative w-full h-screen bg-gray-950 overflow-hidden font-mono select-none">
      <ArenaBackground />
      <HUDBar wpm={wpm} phase={phase} />

      {/* Sound Toggle */}
      <button
        onClick={toggleSound}
        className="absolute top-4 right-4 z-30 px-3 py-1.5 bg-black/50 rounded-lg font-mono text-sm hover:bg-black/70 transition-colors"
      >
        {soundOn ? "🔊 ON" : "🔇 OFF"}
      </button>

      {/* Arena */}
      <div className="absolute inset-0">
        <Stickman
          hp={playerHP}
          maxHp={MAX_HP}
          isPlayer={true}
          isGuarding={playerGuarding}
        />
        <Stickman
          hp={cpuHP}
          maxHp={MAX_HP}
          isPlayer={false}
          isGuarding={cpuGuarding}
        />

        {projs.map((p) => (
          <ProjectileEl key={p.id} p={p} />
        ))}
      </div>

      {/* HP Bars */}
      <HPBar hp={playerHP} maxHp={MAX_HP} isPlayer={true} phase={phase} />
      <HPBar hp={cpuHP} maxHp={MAX_HP} isPlayer={false} phase={phase} />

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

      {/* Bottom UI */}
      {phase === "playing" && (
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          <WordCheatsheet attacks={ATTACKS} defenses={defenseList} />
          <InputField
            value={input}
            onChange={handleInput}
            disabled={phase !== "playing"}
            partialMatch={partialMatch}
          />
        </div>
      )}

      {/* Overlay */}
      <OverlayPanel phase={phase} wpm={wpm} onStart={startGame} onRestart={startGame} />
    </div>
  );
}

function getCpuBlockChance(cpuHP: number): number {
  if (cpuHP <= 20) return 0.45;
  if (cpuHP <= 40) return 0.30;
  if (cpuHP <= 70) return 0.15;
  return 0;
}