# KETIK FIGHT — Technical Architecture
**Version:** 0.1
**Author:** M. Marsal Amar / VoraLab
**Last Updated:** Juni 2026

---

## 1. STACK

### MVP / Prototype (Implemented)
| Layer | Tech |
|---|---|
| Framework | React 18 (via Claude Artifact / CDN) |
| Rendering | DOM-based (bukan Canvas) |
| Styling | Inline styles |
| State | `useState` + `useRef` (hybrid) |
| Game loop | `requestAnimationFrame` |
| Asset | Tidak ada (SVG stickman inline) |
| Audio | Tidak ada |
| Deployment | Claude Artifact embed |

### v0.5 — Proper Dev Setup
| Layer | Tech |
|---|---|
| Framework | React 19 + Vite + TypeScript |
| Rendering | DOM (tetap) |
| Styling | Tailwind CSS + CSS Modules untuk animasi |
| State | `useRef` untuk game state, `useState` untuk render triggers |
| Audio | Howler.js |
| Build | Vite |
| Hosting | Cloudflare Pages (voralab.id subdomain: `kata.voralab.id` atau `laga.voralab.id`) |

**Kenapa DOM, bukan Canvas?**
Proyektil berupa teks (`TENDANG`, `HANTAM`, dll) jauh lebih mudah di-style dan di-animate di DOM. Canvas butuh custom font rendering. DOM juga native accessible. Canvas baru relevan jika ada sprite animation kompleks.

---

## 2. ARSITEKTUR KOMPONEN

```
<App>
  └── <KetikFight>
        ├── <HPBar> (×2, player + cpu)
        ├── <Arena>
        │     ├── <Stickman> (×2)
        │     ├── <Projectile> (×N, dinamis)
        │     ├── <ShieldIndicator>
        │     └── <OverlayPanel> (idle/win/lose)
        ├── <FeedbackToast>
        ├── <InputField>
        ├── <WordCheatsheet>
        └── <HUDBar> (WPM, button Start/Restart)
```

Semua state game dikelola di `<KetikFight>` (parent). Tidak ada state management eksternal (tidak perlu Redux/Zustand untuk skala ini).

---

## 3. GAME STATE MANAGEMENT

### Masalah: Stale Closure
React `useEffect` dan event handler menangkap state pada saat closure dibuat. Untuk game loop real-time, ini masalah besar — jika kita pakai `useState` langsung untuk HP, projectiles, dll., nilai di dalam RAF callback akan selalu stale.

**Solusi: Hybrid Ref/State Pattern**

```typescript
// Ref = source of truth untuk game logic (selalu current)
const pHPRef     = useRef<number>(MAX_HP);
const cHPRef     = useRef<number>(MAX_HP);
const projsRef   = useRef<Projectile[]>([]);
const shieldRef  = useRef<number>(0);
const phaseRef   = useRef<GamePhase>("idle");

// State = trigger untuk React re-render (display only)
const [playerHP, setPlayerHP] = useState(MAX_HP);
const [cpuHP, setCpuHP]       = useState(MAX_HP);
const [projs, setProjs]       = useState<Projectile[]>([]);
const [shield, setShield]     = useState(0);
const [phase, setPhase]       = useState<GamePhase>("idle");
```

**Rule:** Semua game logic membaca dari Ref. Setelah logic selesai, panggil setState untuk sync ke React. Tidak pernah membaca state langsung di dalam RAF callback atau setTimeout.

---

## 4. GAME LOOP

```typescript
// RAF loop — hanya update frame counter untuk trigger hit detection effect
const startLoop = () => {
  const tick = () => {
    if (phaseRef.current !== "playing") return; // self-terminate on game end
    setFrame(f => f + 1);
    rafRef.current = requestAnimationFrame(tick);
  };
  rafRef.current = requestAnimationFrame(tick);
};

// Hit detection — runs on every frame via useEffect([frame])
useEffect(() => {
  if (phase !== "playing") return;
  
  const now = Date.now();
  const done = new Set<number>();
  
  for (const p of projsRef.current) {
    const progress = (now - p.t0) / TRAVEL_MS;
    if (progress < 1) continue;
    
    done.add(p.id);
    
    if (p.fromPlayer) {
      // Deal damage to CPU
    } else if (shieldRef.current > 0) {
      // Auto-block via PERISAI
      shieldRef.current--;
      setShield(shieldRef.current);
    } else {
      // Deal damage to player
    }
  }
  
  if (done.size > 0) {
    projsRef.current = projsRef.current.filter(p => !done.has(p.id));
    setProjs([...projsRef.current]);
    // update HP state, check win/lose
  }
}, [frame, phase]);
```

### CPU Scheduler
```typescript
const fireCpu = () => {
  if (phaseRef.current !== "playing") return;
  
  const attack = sample(CPU_POOL); // random pick
  const proj = { id: ++pid, ...attack, fromPlayer: false, t0: Date.now() };
  
  projsRef.current = [...projsRef.current, proj];
  setProjs([...projsRef.current]);
  
  // Schedule next attack
  const delay = minDelay + Math.random() * (maxDelay - minDelay);
  cpuTimerRef.current = setTimeout(fireCpu, delay);
};
```

CPU scheduler adalah recursive setTimeout (bukan setInterval) untuk memastikan delay antar serangan selalu random dan fresh.

---

## 5. PROJECTILE RENDERING

Proyektil dirender sebagai DOM element dengan posisi absolute. Posisi dihitung saat render (bukan stored sebagai state) menggunakan `Date.now()`:

```typescript
const getProjectileStyle = (p: Projectile): CSSProperties => {
  const progress = Math.min(1, (Date.now() - p.t0) / TRAVEL_MS);
  
  // Horizontal: player left (13%) → cpu (87%), atau sebaliknya
  const x = p.fromPlayer
    ? 13 + progress * 74
    : 87 - progress * 74;
  
  // Arc: parabola via sin curve
  const arc = Math.sin(progress * Math.PI) * -32; // negatif = naik dulu
  
  return {
    position: "absolute",
    left: `${x}%`,
    top: `calc(42% + ${arc}px)`,
    transform: "translateX(-50%) translateY(-50%)",
    color: p.fromPlayer ? YELLOW : RED,
    textShadow: p.fromPlayer ? YELLOW_GLOW : RED_GLOW,
    // ...
  };
};
```

**Mengapa tidak menyimpan `x, y` di state projectile?**
Karena itu akan butuh update setiap frame (60fps × N projectile = banyak state updates). Lebih efisien menghitung saat render dari `Date.now()` — pure function, no side effects.

---

## 6. INPUT HANDLING

```typescript
const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
  if (phaseRef.current !== "playing") return;
  
  // Strip semua non-alpha, uppercase
  const v = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
  setInput(v);
  
  // Check attack words (exact match)
  const attack = ATTACKS.find(a => a.word === v);
  if (attack) {
    firePlayerProjectile(attack);
    setInput(""); // clear input immediately
    updateWPM();
    return;
  }
  
  // Check defense words
  const defense = DEFENSES[v];
  if (defense) {
    executeDefense(defense);
    setInput("");
    updateWPM();
  }
};
```

**Key decisions:**
- **No Enter required:** Trigger langsung saat exact match. Lebih natural untuk fighting feel.
- **Uppercase forced:** Eliminasi case-sensitivity confusion.
- **Non-alpha stripped:** Spasi, angka, dll tidak diinput — mencegah false partial matches.
- **Clear on match:** Input di-clear segera setelah kata berhasil untuk reset state.

---

## 7. TYPES (TypeScript)

```typescript
type GamePhase = "idle" | "playing" | "win" | "lose";

interface Projectile {
  id: number;
  word: string;
  dmg: number;
  fromPlayer: boolean;
  t0: number; // timestamp launch
}

interface AttackWord {
  word: string;
  dmg: number;
  tier: 1 | 2 | 3 | 4;
}

interface DefenseWord {
  type: "block" | "shield" | "dodge";
  charges: number;
  counter?: number;
  label: string;
}

type DefenseMap = Record<string, DefenseWord>;
```

---

## 8. PERFORMANCE TARGETS

| Metric | Target |
|---|---|
| Frame rate | 60fps (RAF loop) |
| Input latency | < 16ms (satu frame) |
| Projectile update | O(n) per frame, n ≤ 10 dalam satu sesi normal |
| Memory | Tidak ada leaks dari timer/RAF (cleanup di stopAll()) |
| Bundle size (v0.5) | < 150KB gzipped termasuk Howler.js |

---

## 9. CLEANUP STRATEGY

Penting untuk menghindari memory leaks dan timer overlap:

```typescript
const stopAll = () => {
  cancelAnimationFrame(rafRef.current);
  clearTimeout(cpuTimerRef.current);
  clearTimeout(msgTimerRef.current);
};

// Di startGame, selalu panggil stopAll() dulu sebelum restart
const startGame = () => {
  stopAll();
  // reset semua refs...
  // reset semua states...
  // start fresh
};
```

---

## 10. DEPLOYMENT PLAN

### Phase 1 (MVP)
- Claude Artifact embed (current)
- Share via link langsung

### Phase 2 (v0.5)
- Vite build → static files
- Deploy ke Cloudflare Pages
- Custom domain: `laga.voralab.id` atau `kata.voralab.id`
- Tidak perlu backend

### Phase 3 (v1 Multiplayer)
- Backend: Cloudflare Workers (WebSocket via Durable Objects)
- Real-time state sync antara 2 player
- Room system: player generate kode 6 digit untuk ajak lawan

---

## 11. TECH DEBT / KNOWN ISSUES (Prototype)

| Issue | Severity | Catatan |
|---|---|---|
| Stickman tidak animasi selain hit flash | Low | Perlu pose cycle: idle, attack, defend |
| WPM acro pertama tidak akurat (menit < 0.1) | Low | Tambah grace period 5 detik sebelum hitung WPM |
| CPU timer tidak scale dengan difficulty | Medium | Hardcoded di prototype. Perlu config object |
| Shield indicator posisi overlap dengan stickman di layar kecil | Low | Fix dengan flexbox |
| Tidak ada partial match highlight | Medium | Penting untuk UX, tunjukkan progress mengetik kata |
