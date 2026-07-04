# ASTRAL // Survival Productivity RPG

> **"Discipline is survival. Comfort is the void."**

Astral is not your average cute habit tracker. It is a brutal, high-stakes productivity RPG designed for hardcore consistency. Built with a dark industrial macOS-terminal aesthetic, Astral gamifies your daily routine by putting your virtual life on the line.

Miss your habits? Your HP drops. Hit zero? You die, lose your streak, and reset your level XP. But if you endure, you ascend to godhood, unlocking cosmic rebirths and expanding your personal galaxy.

![Tech Stack](https://img.shields.io/badge/Stack-React_Vite_+_TailwindCSS-27C93F?style=for-the-badge)![Status](https://img.shields.io/badge/Status-UI/UX_Mockup-FFBD2E?style=for-the-badge)
[[README]]
---[[README]]

## 🌌 Core Mechanics

### 1. The Survival HP System

- **Dynamic Max HP:** Scales from 100 (Level 1) up to 10,000 (Level 100).
- **Real-time Penalties:** Tapping `-` on a bad habit instantly drops your HP based on difficulty. There is no "undo" without a 3-second safeguard.
- **Dusk Evaluation:** When the day ends, any unchecked positive habits automatically deal HP damage. Todos that are overdue drain 1% Max HP per day.
- **Death State:** If HP hits 0, you collapse. You lose your current level XP, your streak breaks, and all unallocated Pending Points vanish. You respawn with 1 HP.

### 2. Habitica-Style Continuous Tapping (+/-)

- Habits aren't just one-time checkboxes. You can tap `+` multiple times (e.g., "Drink Water" 8 times).
- Tapping `+` grants XP and Pending Points. Tapping `-` drops HP.
- **macOS Traffic Light UI:** The `+` (Green) is on the far right, `-` (Red) is on the far left to eliminate accidental taps. Card backgrounds shift color (Green/Yellow/Red) based on the net score.

### 3. Pending Points & Stat Allocation (1.5 Year Cap)

- Completing tasks grants **Pending Points** specific to a stat (STR, INT, DEX, CON). Max 100 pending points per stat.
- Points must be manually allocated in the Stats tab.
- **Math Cap:** Stats cap at 10,000. With daily averages (~20 points/day), reaching the cap takes approximately 1.5 years of consistency.

### 4. Rebirth (Prestige System)

- When a stat hits 10,000, the **Rebirth** button unlocks.
- Rebirth resets that stat to 0, but grants a one-time bounty of 1,000 Gold and 10 Gems.

### 5. Commit System (High Risk / High Reward)

- On Dailies, you can "Commit" (⭐) to a task.
- Success yields **1.5x XP**.
- Failure at Dusk deals **2x HP Damage**.

### 6. Cosmic Ecosystem

- Your HP dictates your visual ecosystem state:
    - **> 60% HP:** Thriving (Blue/Green Galaxy)
    - **25% - 60% HP:** Warning (Red Giant)
    - **< 25% HP:** Dying (Black Hole)
- Gold and Gems earned from tasks can only be spent in the Ecosystem tab to purchase visual assets (Planets, Stars).

---

## 💻 Tech Stack

- **Framework:** React (Vite)
- **Styling:** Tailwind CSS (Inline styles used for specific hex-matched macOS industrial palette)
- **Icons:** Lucide-React
- **State Management:** React `useState` (Mockup phase)

---

## 🚀 Getting Started

This is a UI/UX mockup. All state is temporary and resets on refresh. To run locally:

1. **Clone the repository**
    
    ```bash 
    git clone https://github.com/your-username/astral-mock.gitcd astral-mock 
    ```
    

2. **Install dependencies**
    
    ```bash
    npm install
    ```
    
3. **Run the development server**
    
    ```bash
    npm run dev
    ```
    
4. Open `http://localhost:5173` in your browser.
    

---

## 🎨 Design Language

- **Theme:** Dark Industrial Terminal / macOS Window
- **Background:** `#0a0a0a`
- **Surface:** `#181411`, `#1e1e1e`
- **Accents:**
    - Primary (Orange): `#f97815`
    - Blue (Quests/Currency): `#3080ff`
    - Success (Green): `#27C93F`
    - Warning (Yellow): `#FFBD2E`
    - Danger (Red): `#FF5F56`

---

## 🗺️ Roadmap

- [x]  UI/UX Mockup & Layout
- [x]  Core Logic (HP, XP, Pending Points, Dusk)
- [x]  Rebirth System UI
- [ ]  Backend Integration (Supabase / Next.js API)
- [ ]  Server-side Cron Jobs for Midnight Dusk Evaluations
- [ ]  Timezone validation for users
- [ ]  Mobile App Wrapper (Capacitor / React Native)

---

## ⚠️ Disclaimer

This project is currently a **frontend mockup** meant for visualizing game loops and UI aesthetics. No real backend or persistent database is attached yet.