# KETIK FIGHT — Production Roadmap
**Version:** 0.1
**Author:** M. Marsal Amar / VoraLab
**Last Updated:** Juni 2026

---

## STATUS SAAT INI

**Phase:** Proof of Concept / Prototype selesai
**Deliverable prototype:** Single React artifact, fully playable
- [x] Core mechanic (attack + defense)
- [x] Proyektil sebagai teks terbang
- [x] HP system + hit flash
- [x] WPM tracking
- [x] Win/Lose screen

---

## PHASE 0 — PROOF OF CONCEPT ✅ SELESAI

**Estimasi waktu:** 1 sesi (selesai)
**Output:** Playable prototype di Claude Artifact

### Deliverables
- [x] Game loop (RAF)
- [x] Attack word system
- [x] Defense system (TANGKIS, PERISAI, LOMPAT)
- [x] CPU timer-based attacker
- [x] Visual: stickman SVG, proyektil arc, HP bar
- [x] WPM counter
- [x] GDD + Tech Doc + Content Bible + Roadmap

---

## PHASE 1 — MVP POLISH

**Target:** Layak dibagikan ke orang lain, fun dalam 5 menit pertama
**Estimasi waktu:** 1–2 minggu (part-time)
**Tech stack:** React + Vite (migrate dari artifact)

### 1.1 Core Polish
- [ ] **Partial match highlight:** Input yang sedang diketik di-compare ke semua kata di pool. Kalau prefixnya match, highlight huruf yang sudah benar (hijau) dan yang belum (abu-abu). Contoh: ngetik "TEND" → kata TENDANG muncul dengan "TEND" highlight.
- [ ] **Input validation feedback:** Kalau ngetik kata yang tidak ada di pool dan lebih dari 7 huruf, shake animation + clear.
- [ ] **Hit confirmation yang lebih kaya:** Teks "+33!" muncul di atas CPU saat kena damage. Bukan hanya flash.
- [ ] **Stickman animation:** Minimal: attack pose (lengan maju) saat ngetik attack word, guard pose saat ngetik defense word.
- [ ] **WPM warm-up fix:** Mulai hitung WPM setelah kata pertama berhasil (bukan dari timestamp START).

### 1.2 Sound Design (Minimal)
- [ ] Whoosh saat proyektil player diluncurkan
- [ ] Impact sound saat proyektil hit
- [ ] Metal clang saat TANGKIS berhasil
- [ ] Short jingle win/lose
- [ ] Background ambient loop (subtle, tidak ganggu)

**Recommended library:** Howler.js

### 1.3 UI/UX Polish
- [ ] Countdown 3-2-1 sebelum game mulai (saat ini langsung start)
- [ ] Shield indicator lebih visible (animasi pulse saat aktif)
- [ ] Feedback toast dengan animasi fade-in/fade-out
- [ ] Post-game screen lebih kaya: statistik kata terbanyak dipakai, damage dealt/received, WPM tier badge

### 1.4 Deployment
- [ ] Setup Vite project
- [ ] Deploy ke Cloudflare Pages
- [ ] Domain: `laga.voralab.id`

---

## PHASE 2 — v1.0 FULL RELEASE

**Target:** Game yang layak untuk dimainin regular, ada reason to return
**Estimasi waktu:** 4–6 minggu (part-time)

### 2.1 Difficulty System
- [ ] Pilihan difficulty di menu: Mudah / Normal / Keras / Gila
- [ ] Config object per difficulty (interval, word pool, damage)
- [ ] Difficulty mempengaruhi WPM tier threshold (Gila = threshold lebih rendah karena lebih susah)

### 2.2 Combo System
- [ ] Track berapa kata berhasil tanpa kena damage
- [ ] Multiplier bertahap: ×1.1 → ×1.2 → ×1.35 → ×1.5
- [ ] Visual indicator combo count
- [ ] Kombo break animation + sound saat kena damage

### 2.3 Karakter
- [ ] 3 karakter awal: Jaka (balanced), Pendekar (heavy), Ninja (speed)
- [ ] Character select screen
- [ ] Setiap karakter punya word pool yang sedikit berbeda
- [ ] Visual diferensiasi minimal (warna stickman, accessory sederhana)

### 2.4 Word Content Expansion
- [ ] Tier 4 words (10+ huruf) di-unlock setelah menang X kali
- [ ] Defense word baru: HINDARI, KONTRA
- [ ] Tambah 10–15 kata baru di Tier 1–3

### 2.5 Progression & Retention
- [ ] Lokal leaderboard (top 5 WPM per difficulty — simpan di localStorage)
- [ ] "Personal best" WPM tracking
- [ ] Post-game share card: "Gw menang dengan 67 WPM di mode Keras!"
- [ ] Daily challenge: 3 kata khusus hari ini yang kalau dipakai deal double damage

### 2.6 Tutorial
- [ ] Mode latihan (Practice): CPU tidak menyerang, player bebas latihan kata
- [ ] Tutorial mode: guided 5 step, satu mechanic per step

---

## PHASE 3 — v2.0 MULTIPLAYER & EXPANSION

**Target:** Social game, bisa dimainkan sama-sama
**Estimasi waktu:** 8–12 minggu (part-time)
**Requires:** Backend (Cloudflare Workers + Durable Objects)

### 3.1 Local 2-Player
- [ ] Split keyboard (WASD side vs Arrow/HJKL side — atau keduanya pakai full keyboard tapi area display terpisah)
- [ ] Atau: Player 1 pakai laptop, Player 2 pakai keyboard external yang disambung ke PC yang sama

### 3.2 Online Multiplayer
- [ ] Room system: generate kode 6 digit → share ke teman
- [ ] Real-time via WebSocket (Cloudflare Durable Objects)
- [ ] Ping/latency indicator
- [ ] Reconnect logic untuk koneksi putus

### 3.3 Campaign Mode
- [ ] Sequential opponents dengan nama dan "gimmick"
- [ ] Contoh: Bos 1 = CPU yang cuma pakai Tier 1 kata, Bos 5 = CPU cepat dengan Tier 3 kata
- [ ] Narative ringan per bos (Indonesian setting)
- [ ] Win all 7 bosses = end game

### 3.4 Word Unlock System
- [ ] Kata Tier 4 unlock setelah menang N kali dengan kata Tier 3 tertentu
- [ ] Kata special dari "Pack Silat" atau "Pack Mitologi" unlock setelah beat campaign bos tertentu

### 3.5 Integrasi VoraLab
- [ ] Cross-progression dengan Jari Santri: WPM rank di Jari Santri unlock karakter bonus di KetikFight
- [ ] Embed di voralab.id sebagai produk unggulan VoraLab

---

## ESTIMASI TOTAL

| Phase | Effort | Status |
|---|---|---|
| Phase 0 — Prototype | 1 sesi | ✅ Selesai |
| Phase 1 — MVP Polish | 1–2 minggu | 🔄 Next |
| Phase 2 — v1.0 | 4–6 minggu | ⏳ |
| Phase 3 — v2.0 | 8–12 minggu | ⏳ |

**Rekomendasi prioritas:** Selesaikan Phase 1 (partial match highlight + sound + countdown) sebelum share ke orang lain. Tanpa itu, game terasa incomplete meskipun sudah playable.

---

## RISIKO & MITIGASI

| Risiko | Probabilitas | Dampak | Mitigasi |
|---|---|---|---|
| Drift ke proyek lain sebelum Phase 1 selesai | Tinggi | Medium | Scope Phase 1 kecil. Bisa selesai dalam 1–2 sprint |
| Mobile experience buruk (keyboard virtual tutup arena) | Tinggi | Medium | Buat layout alternatif: arena di bawah, input di atas. Atau mode virtual button |
| Word pool repetitif → bosan cepat | Medium | Tinggi | Content Bible sudah punya expansion plan yang clear |
| Online multiplayer terlalu kompleks untuk solo dev | Tinggi | Low | Phase 3 opsional. Game tetap fun tanpa multiplayer |
| Tidak dapat traction / pengguna | Medium | Medium | Distribusi via VoraLab, Jari Santri cross-promo, share di Threads |

---

## DECISION LOG

| Tanggal | Keputusan | Alasan |
|---|---|---|
| Juni 2026 | Kata Bahasa Indonesia saja (bukan campuran) | Identity unik, educational angle lebih kuat |
| Juni 2026 | DOM-based, bukan Canvas | Proyektil teks lebih mudah di-style di DOM |
| Juni 2026 | Tidak ada CPU defense di MVP | Menyederhanakan balance, focus ke typing mechanic |
| Juni 2026 | Panjang kata = damage (bukan system lain) | Intuitif, natural, tidak perlu tutorial |
| Juni 2026 | Naming belum final | KataLaga vs LagaVora vs JurusTik — hold sampai Phase 1 |
