# KETIK FIGHT — Game Design Document
**Version:** 0.1 (Pre-Alpha)
**Author:** M. Marsal Amar / VoraLab
**Last Updated:** Juni 2026
**Status:** Prototype selesai → masuk fase GDD

---

## 1. OVERVIEW

### 1.1 Elevator Pitch
Game fighting browser-based di mana setiap serangan dan pertahanan dieksekusi dengan mengetik kata. Kata itu sendiri yang terbang sebagai proyektil ke arah lawan. Makin panjang kata → makin besar damage. Makin cepat lo ngetik → makin tinggi WPM lo.

> *"Street Fighter kalau tombolnya diganti keyboard."*

### 1.2 Genre & Platform
- **Genre:** Action Typing Game / Fighting Game
- **Sub-genre:** Real-time 1v1 Combat
- **Platform (MVP):** Browser (HTML5/React) — desktop-first, mobile dipertimbangkan v1
- **Bahasa:** Indonesia (core experience) — potential English localization v2

### 1.3 Target Audience
| Segmen | Deskripsi |
|---|---|
| **Primer** | Pelajar/mahasiswa Indonesia 14-25 tahun yang familiar dengan game fighting |
| **Sekunder** | Komunitas typing game (existing Jari Santri users) |
| **Tersier** | Guru/institusi pendidikan yang butuh tools latihan mengetik menarik |

### 1.4 Unique Selling Points
1. **Mechanic unik:** Kata = jurus = proyektil. Belum ada game fighting yang pakai kata Bahasa Indonesia sebagai core mechanic.
2. **Dual reward:** Naik di fighting skill DAN naik di typing speed secara bersamaan.
3. **WPM sebagai "rank":** Performa terukur, bisa di-improve, bisa dipamerkan.
4. **Zero onboarding barrier:** Main langsung di browser, tanpa install, tanpa akun.

### 1.5 Naming Options (Belum Final)

| Kandidat | Rationale | Cons |
|---|---|---|
| **KETIK FIGHT** | Deskriptif, langsung paham | Terlalu generic |
| **KataLaga** | Kata (word) + Laga (fight), ringkas | Kurang punchy |
| **JurusTik** | Jurus + Ketik, portmanteau | Bisa confusing |
| **TiKam** | Ketik + Tikam (stab), double meaning | Konotasi negatif |
| **LagaVora** | Masuk ekosistem VoraLab | Berarti harus di-maintain jangka panjang |

**Rekomendasi:** `KataLaga` kalau standalone, `LagaVora` kalau masuk ekosistem Vora.

---

## 2. CORE GAME LOOP

### 2.1 Alur Session
```
[START]
    ↓
[Layar arena muncul — 2 stickman berhadapan]
    ↓
[Player ngetik kata serangan → proyektil terbang ke CPU]
    ↓                          ↕ (concurrent)
[CPU auto-nembak proyektil ke Player setiap X detik]
    ↓
[Player ngetik kata defense → proyektil CPU di-block/dodge]
    ↓
[Salah satu HP → 0]
    ↓
[Win/Lose screen + WPM final]
    ↓
[RESTART atau keluar]
```

### 2.2 Core Tension
Tension utama datang dari **split focus**: player harus terus nyerang (karena damage race) sambil defend kalau ada proyektil CPU yang datang. Ini menciptakan dilema real-time:

> *"Gw lagi di tengah ngetik TENDANG (7 huruf) tapi proyektil CPU udah 70% nyampe. Tangkis dulu atau gambling?"*

Dilema ini adalah **fun core** dari game ini.

---

## 3. MECHANICS

### 3.1 Input System
- **Trigger:** Kata selesai diketik → action langsung execute (tanpa Enter/Space)
- **Matching:** Exact match, case-insensitive (dikonversi otomatis ke uppercase)
- **Mid-word cancel:** Player bisa backspace dan ganti kata kapanpun
- **Penalty sistem (v1):** Salah ngetik = +0.5 detik delay sebelum input berikutnya bisa masuk

**Design note:** No Enter required = feel lebih natural dan cepat. Tapi ini juga berarti kata-kata di wordpool tidak boleh ada yang merupakan prefix satu sama lain. (Contoh: tidak boleh ada HANTAM dan HANTAMAN sekaligus, karena HANTAM akan trigger lebih dulu.)

### 3.2 Projectile System
- Proyektil adalah **teks yang terbang** dari attacker ke defender
- Attack dari player → warna **kuning** (#fde047), terbang ke kanan
- Attack dari CPU → warna **merah** (#f87171), terbang ke kiri
- Travel time: **2.2 detik** (MVP) — bisa di-tune per difficulty
- Arc: proyektil mengikuti kurva parabola (sin wave) untuk feel visual yang lebih menarik
- **Hitbox:** Progress ≥ 100% = hit

### 3.3 Attack System
| Parameter | Detail |
|---|---|
| Trigger | Player selesai ngetik attack word |
| Effect | Proyektil spawn di posisi player, terbang ke CPU |
| Damage | Ditentukan oleh panjang dan tier kata (lihat Content Bible) |
| CPU Auto-defend | Tidak ada di MVP. CPU murni HP-damage-race. |
| Hit confirmation | CPU stickman flash merah, HP bar berkurang |

**Critical Hit (v1):** Jika kata diketik dalam waktu yang lebih cepat dari benchmark threshold, damage × 1.5. Reward buat yang sudah mahir.

### 3.4 Defense System
Tiga mekanisme defense, masing-masing dengan tradeoff berbeda:

| Kata | Karakter | Efek | Tradeoff |
|---|---|---|---|
| **TANGKIS** | 7 huruf | Hapus 1 proyektil CPU yang aktif | Harus ada proyektil aktif untuk efektif |
| **PERISAI** | 7 huruf | Auto-block 2 proyektil berikutnya (shield charges) | Tidak ada proyektil yang langsung dihapus |
| **LOMPAT** | 6 huruf | Hapus 1 proyektil + counter 8 damage ke CPU | Paling efisien tapi counter-nya kecil |

**Design note:** LOMPAT adalah kata terpendek di antara 3 defense, tapi efeknya gabungan dodge + counter. Ini intentional — reward buat yang bisa react cepat.

**Shield management (PERISAI):** Charges disimpan. Jika player punya 2 charges dan CPU nembak 2 proyektil sekaligus, keduanya ter-block otomatis. Jika charge habis sebelum proyektil tiba, player kena damage.

### 3.5 HP System
| Parameter | Nilai |
|---|---|
| HP awal (Player) | 100 |
| HP awal (CPU) | 100 |
| HP minimum | 0 (tidak bisa negatif) |
| Regenerasi | Tidak ada (MVP) |
| Damage floor | 10 (tidak ada kata dengan damage < 10) |

### 3.6 WPM Tracking
- **Formula:** `WPM = (total kata berhasil diketik) / (menit sejak game start)`
- Dihitung **real-time**, update setiap kata berhasil
- Menghitung attack words DAN defense words
- Ditampilkan di HUD selama bermain, WPM final di layar Win/Lose

---

## 4. CPU OPPONENT

### 4.1 Behavior (MVP)
CPU tidak "berpikir" — ia adalah **timer-based attacker**. Setiap interval tertentu, CPU random-pick 1 kata dari attack pool-nya dan tembakkan sebagai proyektil ke player. CPU tidak memiliki:
- Defense (tidak bisa block serangan player)
- Reaction terhadap HP player
- Strategi adaptif

Ini **intentional untuk MVP** — menghilangkan kompleksitas AI sehingga focus ada pada mechanic mengetik.

### 4.2 Difficulty Scaling (v1)

| Level | Interval Tembak | Word Pool | Proyektil Maks Aktif |
|---|---|---|---|
| **Mudah** | 5–8 detik | Tier 1 saja | 1 |
| **Normal** | 3–5 detik | Tier 1–2 | 1–2 |
| **Keras** | 2–3.5 detik | Semua tier | 2 |
| **Gila** | 1.5–2.5 detik | Semua tier | 3 |

### 4.3 CPU Adaptive AI (v2)
- CPU mulai lebih sering menyerang jika HP player masih tinggi (pressure)
- CPU "tahu" kapan player sedang di tengah mengetik dan mempercepat serangan
- CPU memiliki pola-pola serangan yang bisa dipelajari player (teknik layered difficulty)

---

## 5. WIN / LOSE CONDITIONS

| Kondisi | Trigger | Screen |
|---|---|---|
| **MENANG** | CPU HP = 0 | 🏆 "MENANG!" + WPM final |
| **KALAH** | Player HP = 0 | 💀 "KALAH!" + WPM final |
| **SERI** | Tidak ada di MVP | — |

Post-game screen menampilkan:
- Hasil (Menang/Kalah)
- WPM final
- Kata paling sering dipakai (v1)
- Tier WPM dan label (v1)

---

## 6. CHARACTERS (v1+)

MVP menggunakan **Generic Stickman** untuk kedua pihak. Tidak ada diferensiasi karakter.

**Roadmap karakter v1:**

| Karakter | Style | Word Set Khusus | Passive |
|---|---|---|---|
| **Jaka** (default) | Balanced fighter | Kata-kata umum | Tidak ada |
| **Pendekar** | Heavy hitter | Kata silat (SABETAN, TENDANGAN) | +20% damage tapi interval CPU lebih cepat |
| **Ninja** | Speed/evasion | Kata pendek, lebih banyak dodge | LOMPAT counter damage ×2 |
| **Ahli Perisai** | Tank | Kata defensive | Mulai dengan 1 PERISAI charge |

---

## 7. VISUAL LANGUAGE (Ringkasan — Detail di Art Direction Doc)

- **Latar:** Gelap, minimalis. Arena dengan garis tanah.
- **Stickman:** Putih, simple SVG, flip horizontal untuk CPU.
- **Proyektil Attack:** Teks kuning bercahaya, arc parabola.
- **Proyektil CPU:** Teks merah bercahaya, arc parabola.
- **HP Bar:** Hijau → kuning → merah sesuai kondisi.
- **Font:** Monospace (Courier New / system monospace) — reinforces typing identity.
- **Hit effect:** Stickman flash merah + drop shadow glow.

---

## 8. AUDIO (v1)

| Event | Sound |
|---|---|
| Kata attack berhasil | "Whoosh" + impact |
| CPU proyektil tiba | Thud + health loss |
| TANGKIS berhasil | Metallic clang |
| LOMPAT | Swish + counter pop |
| Win | Victory jingle pendek |
| Lose | Defeat sting |
| Background | Loop ambient lo-fi fight |

---

## 9. FEATURE SCOPE

### MVP (Selesai sebagian)
- [x] 1v1 vs CPU (timer-based)
- [x] Attack word → proyektil terbang
- [x] Defense: TANGKIS, PERISAI, LOMPAT
- [x] HP bars + hit flash
- [x] WPM tracking real-time
- [x] Win/Lose screen
- [x] Restart

### v0.5 — Polish MVP
- [ ] Sound effects (minimal: hit, block, win, lose)
- [ ] Kata yang sedang diketik ter-highlight partial match
- [ ] Feedback lebih kaya (combo label, perfect block, dll)
- [ ] Animasi stickman (tidak hanya hit flash)
- [ ] Responsive untuk layar mobile

### v1.0 — Full Release
- [ ] Difficulty selector
- [ ] 2–3 karakter berbeda
- [ ] Combo system
- [ ] Tutorial/practice mode
- [ ] Lokal leaderboard (top WPM per difficulty)
- [ ] Custom word pack (user bisa tambah kata sendiri)

### v2.0 — Expansion
- [ ] 2-player lokal (split keyboard)
- [ ] Online multiplayer (WebSocket)
- [ ] Campaign mode (sequential opponents)
- [ ] Word unlock system (earn jurus dengan menang)
- [ ] Integrasi Jari Santri (cross-game progression)

---

## 10. COMPETITOR ANALYSIS

| Game | Persamaan | Perbedaan |
|---|---|---|
| **Typing of the Dead** | Typing = serangan | Shooter, bukan fighter. Kata Inggris. |
| **Z-Type** | Typing = projectile | Tidak ada defense mechanic. Shooter. |
| **Epistory** | Typing RPG | Adventure, bukan fighting. |
| **Nanotale** | Typing + combat | Kata Inggris, overhead view. |
| **Jari Santri** (sendiri) | Typing game Indonesia | Pesantren sim, bukan combat. |

**Gap yang diisi KetikFight:**
1. Tidak ada typing game fighting dengan kata Bahasa Indonesia
2. Tidak ada game yang punya mekanik attack + defense real-time dengan kata berbeda
3. Tidak ada yang punya proyektil berupa teks itu sendiri (visual unik)

---

## 11. PRODUCT NOTES

### Monetisasi
Game ini paling kuat sebagai **free browser tool** → marketing untuk brand VoraLab dan Jari Santri. Jika dikomersialisasi:
- Freemium: karakter dasar gratis, premium chars berbayar
- Lisensi edukasi: paket untuk sekolah / pesantren
- Turnamen: entry fee untuk online competition event

### Hubungan dengan Jari Santri
KetikFight dan Jari Santri adalah **dua produk terpisah** dengan pendekatan berbeda terhadap typing education:
- Jari Santri: conditioning + pesantren sim, konten santri
- KetikFight: gamified combat, konten umum

Potensi sinergi: skor WPM dari Jari Santri bisa unlock karakter/kata di KetikFight.

### Risiko Utama
| Risiko | Mitigation |
|---|---|
| Word pool terlalu kecil → bosan cepat | Expand konten di Content Bible, custom word pack |
| Mobile UX buruk karena keyboard virtual | Mode virtual D-pad yang trigger kata preset (mobile-only) |
| CPU terlalu mudah diprediksi | Implement adaptive AI di v2 |
| Tidak viral → effort sia-sia | MVP harus shareable → integrate WPM badge ke sosmed |
