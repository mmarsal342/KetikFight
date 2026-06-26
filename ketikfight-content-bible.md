# KETIK FIGHT — Content Bible
**Version:** 0.1
**Author:** M. Marsal Amar / VoraLab
**Last Updated:** Juni 2026

---

## 1. WORD DESIGN PHILOSOPHY

### Prinsip Utama
1. **Panjang = Kekuatan.** Setiap huruf tambahan = damage lebih besar. Player secara alami belajar kata yang lebih panjang untuk lebih kuat.
2. **Semua kata Bahasa Indonesia.** Bukan serapan, bukan slang (MVP). Kata yang umum dikenal semua kalangan.
3. **Tidak ada prefix conflict.** Tidak ada dua kata di pool yang sama dimana satu adalah prefix dari yang lain. (Contoh: HANTAM dan HANTAMAN tidak bisa ada bersamaan.)
4. **Dapat dilafalkan dan diingat.** Kata harus semantically relate ke combat agar mudah dihafal player.
5. **Thematically grouped.** Kata diorganisir per tema agar expansion bisa dilakukan modular.

### Damage Formula
Damage values di-tuning manual untuk feel, bukan derived strict dari formula. Rumus kasar sebagai referensi:
```
Damage ≈ 4.5 × jumlah_karakter × tier_multiplier
```
- **Base per char:** ~4.5 damage per huruf (tuning point)
- **Tier multiplier:** Tier 1 = 0.8×, Tier 2 = 1.0×, Tier 3 = 1.1×, Tier 4 = 1.2×
- Final damage dibulatkan ke bilangan genap untuk readability

*Note:* Nilai di tabel adalah hasil tuning manual (playtested), bukan kalkulasi rigid. Formula hanya guideline.

---

## 2. ATTACK WORDS — PLAYER POOL

### Tier 1 — Jab (3–5 huruf, 12–22 dmg)
*Kata pendek, damage rendah. Cocok untuk burst attack atau situasi darurat.*

| Kata | Karakter | Damage | Arti |
|---|---|---|---|
| HAJAR | 5 | 18 | Hajar / Pukul keras |
| SIKAT | 5 | 18 | Sikat / Bersihkan |
| GADA | 4 | 15 | Senjata gada |
| BURU | 4 | 14 | Kejar / Buru |
| PUKUL | 5 | 20 | Pukul |
| TINJU | 5 | 20 | Tinju / Bokser |
| GEBUK | 5 | 20 | Gebuk / Hajar |

### Tier 2 — Strike (6 huruf, 24–28 dmg)
*Kata sedang, balance antara speed dan damage.*

| Kata | Karakter | Damage | Arti |
|---|---|---|---|
| HANTAM | 6 | 26 | Hantam |
| BANTAI | 6 | 26 | Bantai / Habisi |
| SERANG | 6 | 24 | Serang |
| GEBRAK | 6 | 26 | Gebrak |
| GILAS | 5 | 22 | Gilas / Hancurkan |
| LABRAK | 6 | 26 | Labrak / Tabrak |
| TEBAS | 5 | 22 | Tebas / Babat |

### Tier 3 — Heavy (7–8 huruf, 30–38 dmg)
*Kata panjang, high reward tapi butuh waktu lebih lama.*

| Kata | Karakter | Damage | Arti |
|---|---|---|---|
| TENDANG | 7 | 33 | Tendang |
| TERJANG | 7 | 33 | Terjang / Seruduk |
| HALANGI | 7 | 33 | — (dipakai sebagai feint attack) |
| GEBARAN | 7 | 33 | Gebaran / Dentuman |
| TUMBANG | 7 | 33 | Tumbang / Jatuhkan |
| GEMPITA | 7 | 33 | Gempita / Gegap |
| BANTAIAN | 8 | 38 | Bantaian |
| SERANGAN | 8 | 38 | Serangan |

### Tier 4 — Ultimate (10+ huruf, 48+ dmg) — **v1+**
*Kata sangat panjang. High risk (rentan distract CPU) tapi devastating kalau connect.*

| Kata | Karakter | Damage | Arti |
|---|---|---|---|
| MENGHANCURKAN | 13 | 62 | Menghancurkan |
| MENGGEMPUR | 10 | 48 | Menggempur |
| MELIBAS | 7 | 33 | Melibas |
| MEMBERONDONG | 12 | 58 | Memberondong |
| MEMORAKPORANDAKAN | 17 | 82 | Porak-poranda (ultimate) |

---

## 3. DEFENSE WORDS — PLAYER POOL

| Kata | Karakter | Tipe | Efek Detail | Cooldown |
|---|---|---|---|---|
| **TANGKIS** | 7 | Block | Hapus **2 proyektil** CPU terdekat (atau 1 jika hanya 1 aktif) | Tidak ada |
| **PERISAI** | 7 | Shield | Tambah 2 auto-block charges (max 3 charges) | Tidak ada |
| **LOMPAT** | 6 | Dodge + Counter | Hapus 1 proyektil CPU + deal 5 damage ke CPU | 8 detik |

**Balance changes (v0.5):**
- **TANGKIS:** Sekarang hapus 2 proyektit sekaligus. Ini menyeimbangkan panjangnya (7 char) dengan LOMPAT (6 char) tapi memberikan utility berbeda.
- **LOMPAT:** Counter damage turun 8→5, ditambah cooldown 8 detik. Tidak bisa spam.
- **PERISAI:** Max charge limit 3. Mencegah infinite shield stacking di early game.

### Defense Words — Expansion (v1+)

| Kata | Karakter | Tipe | Efek |
|---|---|---|---|
| **HINDARI** | 7 | Full Dodge | Hapus SEMUA proyektil aktif (no counter) |
| **KONTRA** | 6 | Counter | Redirect 1 proyektil CPU balik ke CPU dengan damage asli |
| **BARIKADE** | 8 | AoE Block | Block semua proyektil selama 3 detik ke depan |
| **KABUR** | 5 | Retreat | Hapus 1 proyektil, player sementara tidak bisa diserang 2 detik, tapi tidak bisa attack juga |

---

## 4. CPU ATTACK POOL

CPU tidak punya defense. CPU hanya menyerang dengan kata-kata di pool ini.

### MVP Pool
| Kata | Damage ke Player | Catatan |
|---|---|---|
| PUKUL | 15 | Paling sering |
| HAJAR | 18 | Common |
| SIKAT | 15 | Common |
| HANTAM | 22 | Medium threat |
| TENDANG | 28 | High threat |
| TERJANG | 28 | High threat |

### Expanded Pool by Difficulty

**Easy:** PUKUL, HAJAR, SIKAT saja (15–18 dmg, 5–8 detik interval)

**Normal:** + HANTAM, GEBUK (22 dmg, 3–5 detik interval)

**Hard:** + TENDANG, TERJANG (28 dmg, 2–3.5 detik interval)

**Insane:** + BANTAIAN, SERANGAN (35+ dmg, 1.5–2.5 detik, bisa 2 proyektil aktif sekaligus)

---

## 5. WORD CONFLICT CHECK
Cek ini harus dijalankan setiap ada penambahan kata baru ke pool. Aturan:

1. **No prefix overlap:** Tidak ada Kata A yang merupakan prefix dari Kata B di pool yang sama
2. **No anagram conflict:** Kata dengan huruf yang hampir sama perlu ditest untuk false trigger
3. **Minimum length:** Attack word minimum 4 karakter, defense word minimum 5 karakter

**Konflik yang sudah diidentifikasi:**
- Tidak ada konflik di MVP pool ✅

---

## 6. WPM TIER SYSTEM

WPM dihitung menggunakan standar industri: `WPM = (total karakter / 5) / menit`. Ini kompatibel dengan Jari Santri dan typing game lainnya.

| Range WPM | Tier Label | Badge |
|---|---|---|
| < 25 | Pemula 🐢 | Bronze |
| 25–39 | Pelajar 📚 | Bronze+ |
| 40–54 | Terampil ⚔️ | Silver |
| 55–69 | Jagoan 🥊 | Silver+ |
| 70–84 | Master Jari 🔥 | Gold |
| 85–99 | Legenda Kata 👑 | Gold+ |
| 100+ | Sang Maestro ⚡ | Platinum |

**Threshold di-adjust** untuk standar 5-char WPM. Sebelumnya terlalu rendah (banyak yang hit 70+ padahal itu "kata fighting Indonesia" yang panjang-panjang).
- Grace period: 5 detik pertama tidak dihitung dalam WPM (menghindari angka ekstrem di awal)
- Semua karakter (huruf saja) dihitung, baik attack maupun defense

---

## 7. COMBO SYSTEM (v1)

Combo dihitung dari berapa kata berhasil diketik tanpa menerima damage.

| Combo | Nama | Efek |
|---|---|---|
| 3× | Beruntun | Damage +10% |
| 5× | Ganas | Damage +20% |
| 8× | Badai | Damage +35%, efek visual lebih intense |
| 12× | LAGA SEMPURNA | Damage +50%, special hit animation |

Combo reset ke 0 ketika player kena damage.

---

## 8. KONTEN TEMATIS — EXPANSION PACKS (v2+)

Setelah MVP, word pool bisa diperluas dengan tema-tema khusus:

### Pack: Silat
Kata-kata dari pencak silat Indonesia.
*SABETAN, ELAKAN, TANGKISAN, BANTINGAN, KUNCIAN, SAPUAN, TENDANGAN_SABIT*

### Pack: Mitologi Nusantara
Senjata dan tokoh mitologis.
*KERIS, MANDAU, TOMBAK, TRISULA, PANAH, GADA*

### Pack: Fantasi Indonesia
Serangan dan mantra fiksi dengan nuansa Indonesia.
*PETIR, ANGIN, BAKAR, GEMPA, BADAI, KILAT*

### Pack: Santri (Kolaborasi Jari Santri)
Kata-kata islami yang relevan dengan konteks pesantren.
*BASMALAH, TAAWUDZ* (sebagai defense), *SHALAWAT* (sebagai buff)

---

## 9. BALANCE NOTES

### Target Session HP Burn Rate
Dalam satu session normal (difficulty Normal, ~2 menit), estimasi:
- Player menyerang 15–20 kata → average 26 dmg/kata = 390–520 total damage potential ke CPU (100 HP)
- CPU menyerang ~15–20× dalam 2 menit dengan 3–5s interval → 300–560 total damage potential ke player (100 HP)
- **Expected:** sesi cukup intens, player harus defend 8–12× untuk survive full session

Jika player WPM > 50, mereka akan menang jauh sebelum 2 menit karena DPS mereka jauh lebih tinggi dari CPU.

### Rebalancing Triggers
Perlu rebalancing jika:
- **Win rate Easy > 90%** → Naikkan damage CPU
- **Win rate Hard < 30%** → Turunkan interval serangan CPU
- **Average session < 45 detik** (terlalu cepat) → Naikkan HP max ke 150
- **Average session > 4 menit** (terlalu lama) → Turunkan HP max ke 75
