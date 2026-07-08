# PixelQuest — Habit RPG

> **"Discipline is survival. Comfort is the void."**

PixelQuest is a brutal, high-stakes productivity RPG designed for hardcore consistency. Built with a dark industrial macOS-terminal aesthetic, it gamifies your daily routine by putting your virtual life on the line.

Miss your habits? Your HP drops. Hit zero? You die, lose your streak, and reset unallocated Pending Points. But if you endure, you ascend — unlocking stat rebirths and class-based progression.

![Tech Stack](https://img.shields.io/badge/Stack-React_19_Vite_8_Tailwind_4-27C93F?style=for-the-badge)![Status](https://img.shields.io/badge/Status-Frontend_Mockup-FFBD2E?style=for-the-badge)

---

Want to see the website? Open https://kelheit.github.io/PixelQuest-Habit-RPG/

## Core Mechanics

### 1. Survival HP System
- **Dynamic Max HP:** Scales from 100 (Level 0) up to 10,000 (Level 100).
- **Real-time Penalties:** Tapping `-` on a bad habit instantly drops HP based on difficulty. A 3-second undo window is available.
- **Dusk Evaluation:** When triggered manually, any unchecked positive habits deal HP damage (capped at 30% max HP). Perfect days grant HP regen (20% max HP). Overdue todos drain 1% max HP per day (compound, capped at 50%).
- **Death State:** If HP hits 0, you lose current streak and all unallocated Pending Points vanish. You respawn with 1 HP.

### 2. Habitica-Style Continuous Tapping (+/-)
- Habits can be tapped `+` multiple times per day (e.g., "Drink Water" 8 times).
- Tapping `+` grants XP and Pending Points. Tapping `-` drops HP with a 3-second undo countdown.
- **macOS Traffic Light UI:** `+` (Green) on the far right, `-` (Red) on the far left. Card backgrounds shift color based on net day score.

### 3. Pending Points & Stat Allocation
- Completing tasks grants **Pending Points** specific to a stat (STR, INT, DEX, CON). Max 100 pending per stat.
- Points must be manually **Allocated** in the Stats tab. Stat cap: 10,000 per stat (~1.5 years of daily play).
- Reverting a task completion reverses XP and stat gains (deducts from pending first, then from allocated points).

### 4. Rebirth (Prestige System)
- When a stat hits 10,000, the **Rebirth** button unlocks.
- Rebirth resets that stat to 0, but grants **500 Gold + 5 Gems**.

### 5. Commit System (High Risk / High Reward)
- On Dailies, you can "Mark" (⭐) a task for **1.25x XP** on success / **2x HP damage** on failure at Dusk.

### 6. 4 RPG Classes
| Class | Affinity | Perk |
|---|---|---|
| Warrior | STR | +50% pending STR gain |
| Mage | INT | +50% pending INT gain |
| Rogue | DEX | +50% pending DEX gain |
| Healer | CON | +50% pending CON gain |

Swappable at any time in the Stats panel. Class determines weapon sprite overlay.

### 7. Currencies
- **Gold** — earned from completing tasks, spent in the Reward shop.
- **Gems** — premium currency (earned from Rebirth), spent on gem-cost rewards.

### 8. Pixel-Art Character
- SVG-rendered character sprite based on your class.
- **Weapon** and **Pet** can be equipped/unequipped in the Stats panel.

### 9. Dark / Light Theme
- Toggle in the header. Persisted in `localStorage`.
- Dark: industrial terminal aesthetic. Light: warm paper tones.

---

## Tech Stack

- **Framework:** React 19 (Vite 8)
- **Styling:** Tailwind CSS 4 (via `@tailwindcss/vite`) — all components use inline styles targeting a custom dark/light color palette
- **Icons:** Lucide-React
- **State Management:** React `useState` + custom `useLocalStorage` hook (persisted to `localStorage`)
- **Testing:** Vitest 4 (unit tests in `src/utils/math.test.js`)
- **Linting:** oxlint 1.71
- **Fonts:** Press Start 2P (display), Inter (body), JetBrains Mono (mono)
- **Design:** Dark Industrial Terminal / macOS Window — `#0a0a0a` background, `#181411` surface

---

## Getting Started

This is a frontend mockup. All state is persisted to `localStorage` but has no backend.

```bash
git clone https://github.com/your-username/pixelquest.git
cd pixelquest
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm test` | Run vitest unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run oxlint |

---

## Roadmap

- [x] UI/UX Mockup & Layout
- [x] Core Logic (HP, XP, Pending Points, Dusk, Classes)
- [x] Rebirth System
- [x] localStorage Persistence
- [ ] Backend Integration (Supabase / Next.js API)
- [ ] Server-side Cron Jobs for Midnight Dusk Evaluations
- [ ] Timezone Validation
- [ ] Mobile App Wrapper (Capacitor / React Native)

---

## Disclaimer

This project is currently a **frontend mockup** meant for visualizing game loops and UI. No real backend or persistent database is attached yet. State survives refresh via `localStorage` only.
