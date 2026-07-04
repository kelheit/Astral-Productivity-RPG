import React, { useState, useEffect, useCallback } from "react";
import { 
  Heart, Flame, Hexagon, Brain, Dumbbell, HeartPulse, 
  Zap, Skull, Sunset, Star, Orbit, Coins, Gem, 
  ListTodo, CalendarCheck, Target, Radar, RotateCcw, Lock, 
  Check, X, Minus, Plus, Undo2, Menu
} from "lucide-react";

// --- CONFIG & PALETTE (Strict Hex Codes) ---
const COLORS = {
  bg: "#0a0a0a",
  surface: "#181411",
  surfaceAlt: "#1e1e1e",
  border: "#3a2f27",
  borderLight: "#3a3a3a",
  text: "#f7f3ee",
  textMuted: "#9ca3af",
  brandPrimary: "#f97815",
  brandBlue: "#3080ff",
  success: "#27C93F", // macOS Green
  warning: "#FFBD2E", // macOS Yellow
  danger: "#FF5F56",  // macOS Red
};

const XP_PER_LEVEL = 1000;
const MAX_LEVEL = 100;
const REGEN_RATE = 0.20;
const MAX_PENDING_POINTS = 100;

// Math cap: Easy=2, Medium=4, Hard=8. ~20 points/day = 1.5 years to 10k.
const DIFFICULTY_CONFIG = {
  Trivial: { pct: 0.01, statGain: 1, color: COLORS.textMuted, label: "Trivial" },
  Easy: { pct: 0.02, statGain: 2, color: COLORS.success, label: "Easy" },
  Medium: { pct: 0.05, statGain: 4, color: COLORS.warning, label: "Medium" },
  Hard: { pct: 0.10, statGain: 8, color: COLORS.danger, label: "Hard" },
};

const STAT_CONFIG = {
  STR: { name: "Strength", icon: Dumbbell, color: COLORS.danger },
  INT: { name: "Intelligence", icon: Brain, color: COLORS.brandBlue },
  DEX: { name: "Dexterity", icon: Zap, color: COLORS.warning },
  CON: { name: "Constitution", icon: HeartPulse, color: COLORS.success },
};

const COSMIC_TIERS = [
  { name: "Space Dust", min: 0 }, { name: "Asteroid", min: 100 },
  { name: "Meteor", min: 500 }, { name: "Moon", min: 1000 },
  { name: "Planet", min: 2500 }, { name: "Star", min: 5000 },
  { name: "Giant Star", min: 7500 }, { name: "Singularity", min: 10000 },
];

function getTier(val) {
  return [...COSMIC_TIERS].reverse().find(t => val >= t.min) || COSMIC_TIERS[0];
}

// --- MOCK DATA ---
const INITIAL_STATE = {
  level: 5,
  xp: 400,
  hp: 400,
  maxHp: 500,
  streak: 12,
  gold: 150,
  gems: 5,
  stats: { STR: 9980, INT: 2400, DEX: 1200, CON: 3000 },
  pendingPoints: { STR: 10, INT: 5, DEX: 0, CON: 20 }, // Pending points per stat
  isDead: false,
  rebirthAvailable: false,
};

const INITIAL_HABITS = [
  { id: "h1", name: "Deep Work (90m)", stat: "INT", diff: "Hard", score: 0, streak: 5 },
  { id: "h2", name: "Zero-G Calisthenics", stat: "STR", diff: "Medium", score: 1, streak: 12 },
  { id: "h3", name: "Junk Food", stat: "CON", diff: "Hard", score: -1, streak: 0 }, // Negative habit
  { id: "h4", name: "Meditate", stat: "CON", diff: "Trivial", score: 0, streak: 2 },
];

const INITIAL_DAILIES = [
  { id: "d1", name: "Morning Routine", stat: "CON", diff: "Easy", status: "pending", streak: 4 },
  { id: "d2", name: "Ship Code to Prod", stat: "DEX", diff: "Hard", status: "pending", committed: false, streak: 1 },
];

const INITIAL_TODOS = [
  { id: "t1", name: "Fix Bug #402", stat: "DEX", diff: "Medium", status: "pending", due: "Tomorrow" },
  { id: "t2", name: "Pitch Deck Design", stat: "INT", diff: "Hard", status: "pending", due: "Overdue (1d)" },
];

const INITIAL_QUESTS = [
  { id: "q1", type: "daily", name: "Daily Conqueror", desc: "Complete 1 Hard Habit/Daily", progress: 1, target: 1, reward: { gold: 50, xp: 100 } },
  { id: "q2", type: "weekly", name: "Galactic Grind", desc: "Complete 30 Habits this week", progress: 12, target: 30, reward: { gems: 5, xp: 500 } },
];

export default function AstralFinalMock() {
  const [activeTab, setActiveTab] = useState("habits");
  const [state, setState] = useState(INITIAL_STATE);
  const [habits, setHabits] = useState(INITIAL_HABITS);
  const [dailies, setDailies] = useState(INITIAL_DAILIES);
  const [todos, setTodos] = useState(INITIAL_TODOS);
  const [quests, setQuests] = useState(INITIAL_QUESTS);
  const [toast, setToast] = useState(null);
  const [deathScreen, setDeathScreen] = useState(false);
  const [rebirthModal, setRebirthModal] = useState(false);
  const [undoData, setUndoData] = useState(null); // For 3s safeguard on negative taps

  // Check death and rebirth availability
  useEffect(() => {
    if (state.hp <= 0 && !state.isDead) handleDeath();
    if (state.stats.STR >= 10000 && !state.rebirthAvailable) {
      setState(prev => ({ ...prev, rebirthAvailable: true }));
      showToast("STR hit 10,000! Rebirth available.", "level");
    }
  }, [state.hp, state.stats.STR]);

  const showToast = (text, type = "info") => {
    setToast({ text, type, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  };

  // --- HABIT ACTIONS (Continuous +/- Taps) ---
  const tapHabitPositive = (id) => {
    if (state.isDead) return;
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const diffCfg = DIFFICULTY_CONFIG[habit.diff];
    const xpGain = Math.round(state.maxHp * diffCfg.pct);
    const statGain = diffCfg.statGain;

    // Update habit score & streak
    setHabits(prev => prev.map(h => h.id === id ? { ...h, score: h.score + 1, streak: h.streak + 1 } : h));

    setState(prev => {
      // Check Pending Points Cap (100)
      const currentPending = prev.pendingPoints[habit.stat];
      if (currentPending >= MAX_PENDING_POINTS) {
        showToast(`${habit.stat} Pending Points full! Allocate them in Stats.`, "warning");
        return prev;
      }
      
      const newPending = { ...prev.pendingPoints, [habit.stat]: Math.min(MAX_PENDING_POINTS, currentPending + statGain) };
      let newXp = prev.xp + xpGain;
      let newLevel = prev.level;
      
      if (newXp >= XP_PER_LEVEL && newLevel < MAX_LEVEL) {
        newLevel++; newXp -= XP_PER_LEVEL;
        showToast(`Level Up! Ascended to Level ${newLevel}.`, "level");
      } else {
        showToast(`+${xpGain} XP, +${statGain} Pending ${habit.stat}.`, "success");
      }
      return { ...prev, xp: newXp, level: newLevel, pendingPoints: newPending };
    });
  };

  const tapHabitNegative = (id) => {
    if (state.isDead || undoData) return; // Prevent tapping if undo is active
    
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const diffCfg = DIFFICULTY_CONFIG[habit.diff];
    const hpDamage = Math.round(state.maxHp * diffCfg.pct);

    // Update habit score & reset streak
    setHabits(prev => prev.map(h => h.id === id ? { ...h, score: h.score - 1, streak: 0 } : h));

    // Start 3s Undo Timer
    setUndoData({ id, hpDamage, countdown: 3 });
    
    let countdown = 3;
    const timer = setInterval(() => {
      countdown -= 1;
      if (countdown <= 0) {
        clearInterval(timer);
        // Apply damage
        setState(prev => {
          const newHp = Math.max(0, prev.hp - hpDamage);
          showToast(`Slipped: -${hpDamage} HP.`, "damage");
          return { ...prev, hp: newHp };
        });
        setUndoData(null);
      } else {
        setUndoData(prev => ({ ...prev, countdown }));
      }
    }, 1000);
  };

  const cancelUndo = (id) => {
    // Revert score and streak
    setHabits(prev => prev.map(h => h.id === id ? { ...h, score: h.score + 1, streak: h.streak > 0 ? h.streak : 0 } : h));
    setUndoData(null);
    showToast("Action undone.", "info");
  };

  // --- DAILIES & TODOS ACTIONS (One-time check) ---
  const handleTaskAction = (id, type, actionType) => {
    if (state.isDead) return;
    const list = type === "dailies" ? dailies : todos;
    const item = list.find(i => i.id === id);
    if (!item || item.status !== "pending") return;

    const diffCfg = DIFFICULTY_CONFIG[item.diff];
    const xpGain = Math.round(state.maxHp * diffCfg.pct);
    const statGain = diffCfg.statGain;

    const setter = type === "dailies" ? setDailies : setTodos;
    setter(prev => prev.map(i => i.id === id ? { ...i, status: actionType === "positive" ? "completed" : "failed", streak: actionType === "positive" ? i.streak + 1 : 0 } : i));

    if (actionType === "positive") {
      setState(prev => {
        const currentPending = prev.pendingPoints[item.stat];
        if (currentPending < MAX_PENDING_POINTS) {
          prev.pendingPoints[item.stat] = Math.min(MAX_PENDING_POINTS, currentPending + statGain);
        }
        let newXp = prev.xp + xpGain;
        let newLevel = prev.level;
        if (newXp >= XP_PER_LEVEL && newLevel < MAX_LEVEL) { newLevel++; newXp -= XP_PER_LEVEL; }
        return { ...prev, xp: newXp, level: newLevel };
      });
      showToast(`Task done! +${statGain} Pending ${item.stat}.`, "success");
    } else {
      const hpDamage = Math.round(state.maxHp * diffCfg.pct);
      setState(prev => ({ ...prev, hp: Math.max(0, prev.hp - hpDamage) }));
      showToast(`Failed: -${hpDamage} HP.`, "damage");
    }
  };

  const toggleCommit = (id) => {
    setDailies(prev => prev.map(i => i.id === id ? { ...i, committed: !i.committed } : i));
  };

  // --- ALLOCATE STATS ---
  const allocateStat = (stat) => {
    setState(prev => {
      const pointsToAllocate = prev.pendingPoints[stat];
      if (pointsToAllocate === 0) return prev;
      
      const newStats = { ...prev.stats, [stat]: Math.min(10000, prev.stats[stat] + pointsToAllocate) };
      const newPending = { ...prev.pendingPoints, [stat]: 0 };
      showToast(`Allocated ${pointsToAllocate} points to ${stat}!`, "level");
      return { ...prev, stats: newStats, pendingPoints: newPending };
    });
  };

  // --- DUSK EVALUATION ---
  const triggerDusk = () => {
    if (state.isDead) return;
    let totalDamage = 0;
    let goldEarned = 0;
    let avoidedNegatives = 0;
    let completedPositives = 0;

    // Habits Evaluation
    const updatedHabits = habits.map(item => {
      const diffCfg = DIFFICULTY_CONFIG[item.diff];
      if (item.score <= 0) {
        totalDamage += Math.round(state.maxHp * diffCfg.pct);
      } else {
        completedPositives += item.score;
      }
      // If it's a negative habit and score is 0 (never tapped -), it's avoided
      if (item.name === "Junk Food" && item.score === 0) { // Mock logic: identifying negative habit
        avoidedNegatives++;
      }
      return { ...item, score: 0, streak: item.score > 0 ? item.streak : 0 }; // Reset score, keep streak if positive
    });
    setHabits(updatedHabits);

    // Dailies Evaluation
    const updatedDailies = dailies.map(item => {
      if (item.status === "pending") {
        const diffCfg = DIFFICULTY_CONFIG[item.diff];
        let dmg = Math.round(state.maxHp * diffCfg.pct);
        if (item.committed) dmg *= 2;
        totalDamage += dmg;
        return { ...item, status: "failed", streak: 0, committed: false };
      } else if (item.status === "completed") {
        completedPositives++;
        return { ...item, status: "pending", committed: false }; // Reset for next day
      }
      return item;
    });
    setDailies(updatedDailies);

    // Todos Overdue Evaluation
    todos.forEach(todo => {
      if (todo.due.includes("Overdue") && todo.status === "pending") {
        totalDamage += Math.round(state.maxHp * 0.01);
      }
    });

    const regenAmount = Math.round(state.maxHp * REGEN_RATE);
    
    setState(prev => {
      const newHp = Math.min(prev.maxHp, Math.max(0, prev.hp - totalDamage + regenAmount));
      // Formula: (Completed Positives + Avoided Negatives) / 10
      const newGold = prev.gold + Math.round((completedPositives + avoidedNegatives) / 10);
      
      let toastMsg = `Dusk: +${regenAmount} HP Regen. +${Math.round((completedPositives + avoidedNegatives) / 10)} Gold.`;
      if (totalDamage > 0) toastMsg += ` Took ${totalDamage} damage from unchecked tasks!`;
      showToast(toastMsg, totalDamage > 0 ? "damage" : "success");

      return { ...prev, hp: newHp, gold: newGold };
    });
  };

  // --- DEATH & REBIRTH ---
  const handleDeath = () => {
    setDeathScreen(true);
    // On death: reset XP, break streak, RESPECT PENDING POINTS (they are lost)
    setState(prev => ({ ...prev, isDead: true, hp: 0, xp: 0, streak: 0, pendingPoints: { STR: 0, INT: 0, DEX: 0, CON: 0 } }));
  };

  const respawn = () => {
    setState(prev => ({ ...prev, hp: 1, isDead: false }));
    setDeathScreen(false);
    showToast("Respawned with 1 HP. Streak & Pending Points lost.", "warning");
  };

  const handleRebirth = () => {
    setState(prev => ({ ...prev, stats: { ...prev.stats, STR: 0 }, gold: prev.gold + 1000, gems: prev.gems + 10, rebirthAvailable: false }));
    setRebirthModal(false);
    showToast("REBIRTH COMPLETE! STR reset to 0. +1000 Gold, +10 Gems.", "level");
  };

  // --- UI HELPERS ---
  const getHabitCardStyle = (score) => {
    if (score > 0) return { bg: `${COLORS.success}15`, border: `${COLORS.success}40` };
    if (score < 0) return { bg: `${COLORS.danger}15`, border: `${COLORS.danger}40` };
    return { bg: COLORS.surface, border: COLORS.border };
  };

  const getTaskCardStyle = (status) => {
    if (status === "completed") return { bg: `${COLORS.success}15`, border: `${COLORS.success}40` };
    if (status === "failed") return { bg: `${COLORS.danger}15`, border: `${COLORS.danger}40` };
    return { bg: COLORS.surface, border: COLORS.border };
  };

  const ecoState = state.hp / state.maxHp > 0.6 ? "thriving" : state.hp / state.maxHp > 0.25 ? "warning" : "dying";
  const ecoCore = ecoState === "thriving" ? COLORS.success : ecoState === "warning" ? COLORS.warning : COLORS.danger;

  const tabs = [
    { id: "habits", name: "Habits", icon: Flame },
    { id: "dailies", name: "Dailies", icon: CalendarCheck },
    { id: "todos", name: "To Do's", icon: ListTodo },
    { id: "quests", name: "Quests", icon: Target },
    { id: "stats", name: "Stats", icon: Dumbbell },
    { id: "ecosystem", name: "Ecosystem", icon: Radar }
  ];

  return (
    <div className="min-h-screen font-sans relative overflow-hidden pb-20 md:pb-0" style={{ background: COLORS.bg, color: COLORS.text }}>
      
      {/* Ambient BG Glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none opacity-20" style={{ background: COLORS.brandPrimary }}></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none opacity-10" style={{ background: COLORS.danger }}></div>

      <div className="relative z-10 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* HERO TOP NAV (Desktop & Mobile) */}
        <header className="mb-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4 p-4 rounded-xl" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
            <div className="flex items-center gap-3">
              {/* macOS Traffic Light Dots */}
              <div className="flex gap-2 mr-2">
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS.danger }}></div>
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS.warning }}></div>
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS.success }}></div>
              </div>
              <Orbit size={24} style={{ color: COLORS.brandPrimary }} strokeWidth={2.5} />
              <h1 className="text-xl font-bold tracking-[0.2em] uppercase">Astral</h1>
            </div>
            
            <div className="flex items-center gap-4 flex-wrap">
              {/* Pending Points Indicator (Quick Glance) */}
              <button onClick={() => setActiveTab("stats")} className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-all hover:opacity-80" style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}` }}>
                <Plus size={14} style={{ color: COLORS.warning }} />
                <span className="font-mono font-bold text-sm">{Object.values(state.pendingPoints).reduce((a, b) => a + b, 0)} Pending</span>
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md" style={{ background: COLORS.surfaceAlt }}>
                <Coins size={14} style={{ color: COLORS.brandPrimary }} />
                <span className="font-mono font-bold text-sm">{state.gold}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md" style={{ background: COLORS.surfaceAlt }}>
                <Gem size={14} style={{ color: COLORS.brandBlue }} />
                <span className="font-mono font-bold text-sm">{state.gems}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md" style={{ background: COLORS.surfaceAlt }}>
                <Flame size={14} style={{ color: COLORS.danger }} fill="currentColor" />
                <span className="font-mono font-bold text-sm">{state.streak}</span>
              </div>
            </div>
          </div>

          {/* Hero Stats Bars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* HP Bar */}
            <div className="rounded-xl p-4" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="font-bold flex items-center gap-1" style={{ color: COLORS.danger }}><Heart size={12} fill="currentColor" /> VITALITY</span>
                <span style={{ color: COLORS.textMuted }}>{Math.round(state.hp)} / {state.maxHp}</span>
              </div>
              <div className="w-full h-3 rounded-sm overflow-hidden" style={{ background: "#000" }}>
                <div className="h-full transition-all duration-500" style={{ width: `${(state.hp/state.maxHp)*100}%`, background: state.hp/state.maxHp > 0.6 ? COLORS.success : state.hp/state.maxHp > 0.25 ? COLORS.warning : COLORS.danger }}></div>
              </div>
            </div>
            
            {/* XP Bar */}
            <div className="rounded-xl p-4" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="font-bold flex items-center gap-1" style={{ color: COLORS.brandPrimary }}><Hexagon size={12} /> LEVEL {state.level}</span>
                <span style={{ color: COLORS.textMuted }}>{state.xp} / {XP_PER_LEVEL} XP</span>
              </div>
              <div className="w-full h-3 rounded-sm overflow-hidden" style={{ background: "#000" }}>
                <div className="h-full transition-all duration-500" style={{ width: `${(state.xp/XP_PER_LEVEL)*100}%`, background: `linear-gradient(90deg, ${COLORS.brandPrimary}, ${COLORS.warning})` }}></div>
              </div>
            </div>

            {/* Eco Status */}
            <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
              <div>
                <div className="text-xs font-mono font-bold" style={{ color: COLORS.textMuted }}>ECOSYSTEM</div>
                <div className="text-sm capitalize" style={{ color: COLORS.text }}>{ecoState}</div>
              </div>
              <div className="w-8 h-8 rounded-full" style={{ background: ecoCore, boxShadow: `0 0 15px ${ecoCore}` }}></div>
            </div>
          </div>

          {/* Top Tabs (Desktop Only) */}
          <nav className="hidden md:flex items-center gap-2 p-1.5 rounded-xl overflow-x-auto" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: activeTab === tab.id ? COLORS.surfaceAlt : 'transparent',
                  color: activeTab === tab.id ? COLORS.text : COLORS.textMuted,
                  border: activeTab === tab.id ? `1px solid ${COLORS.borderLight}` : '1px solid transparent'
                }}
              >
                <tab.icon size={16} />
                {tab.name}
              </button>
            ))}
          </nav>
        </header>

        {/* CONTENT AREA */}
        <div className="mb-8">
          <div className="flex justify-end mb-4">
            <button onClick={triggerDusk} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all" style={{ background: `${COLORS.brandBlue}20`, border: `1px solid ${COLORS.brandBlue}50`, color: COLORS.brandBlue }}>
              <Sunset size={16} /> Trigger Dusk
            </button>
          </div>

          {/* HABITS TAB */}
          {activeTab === "habits" && (
            <div className="space-y-3">
              {habits.map(item => {
                const diff = DIFFICULTY_CONFIG[item.diff];
                const StatIcon = STAT_CONFIG[item.stat].icon;
                const cardStyle = getHabitCardStyle(item.score);
                const isUndoing = undoData?.id === item.id;
                
                return (
                  <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl border transition-all" style={{ background: cardStyle.bg, borderColor: isUndoing ? COLORS.warning : cardStyle.border }}>
                    
                    {/* LEFT: Negative Button (-) */}
                    <button 
                      onClick={() => tapHabitNegative(item.id)}
                      disabled={undoData !== null}
                      className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shrink-0"
                      style={{ background: isUndoing ? COLORS.warning : `${COLORS.danger}20`, border: `2px solid ${COLORS.danger}` }}
                      title="Acknowledge Failure"
                    >
                      {isUndoing ? (
                        <span className="font-mono font-bold text-sm" style={{ color: '#000' }}>{undoData.countdown}s</span>
                      ) : (
                        <Minus size={20} style={{ color: COLORS.danger }} strokeWidth={3} />
                      )}
                    </button>

                    {/* MIDDLE: Info */}
                    <div className="flex-1 min-w-0 text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-sm font-medium truncate" style={{ color: COLORS.text }}>{item.name}</span>
                        {item.score !== 0 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: '#000', color: item.score > 0 ? COLORS.success : COLORS.danger }}>
                            {item.score > 0 ? `+${item.score}` : item.score}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <StatIcon size={12} style={{ color: STAT_CONFIG[item.stat].color }} />
                        <span className="text-[10px] font-mono" style={{ color: diff.color }}>{diff.label}</span>
                        {item.streak > 0 && (
                          <span className="text-[10px] font-mono flex items-center gap-1" style={{ color: COLORS.brandPrimary }}>
                            <Flame size={8} /> {item.streak}
                          </span>
                        )}
                      </div>
                      {/* Undo Notification */}
                      {isUndoing && (
                        <button onClick={() => cancelUndo(item.id)} className="mt-2 text-[10px] font-bold flex items-center gap-1 mx-auto px-2 py-1 rounded" style={{ background: COLORS.warning, color: '#000' }}>
                          <Undo2 size={10} /> UNDO TAP
                        </button>
                      )}
                    </div>

                    {/* RIGHT: Positive Button (+) */}
                    <button 
                      onClick={() => tapHabitPositive(item.id)}
                      disabled={undoData !== null}
                      className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shrink-0"
                      style={{ background: COLORS.success, boxShadow: `0 0 10px ${COLORS.success}40` }}
                      title="Acknowledge Success"
                    >
                      <Plus size={24} style={{ color: '#000' }} strokeWidth={3} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* DAILIES TAB */}
          {activeTab === "dailies" && (
            <div className="space-y-3">
              {dailies.map(item => {
                const diff = DIFFICULTY_CONFIG[item.diff];
                const StatIcon = STAT_CONFIG[item.stat].icon;
                const cardStyle = getTaskCardStyle(item.status);
                const isPending = item.status === "pending";
                
                return (
                  <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl border transition-all" style={{ background: cardStyle.bg, borderColor: cardStyle.border }}>
                    
                    {/* LEFT: Negative Button (✕) */}
                    {isPending ? (
                      <button 
                        onClick={() => handleTaskAction(item.id, "dailies", "negative")}
                        className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 shrink-0"
                        style={{ background: `${COLORS.danger}20`, border: `2px solid ${COLORS.danger}` }}
                      >
                        <X size={20} style={{ color: COLORS.danger }} strokeWidth={3} />
                      </button>
                    ) : (
                      <div className="w-12 h-12 shrink-0"></div>
                    )}

                    {/* MIDDLE: Info */}
                    <div className="flex-1 min-w-0 text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className={`text-sm font-medium truncate ${!isPending ? 'line-through opacity-60' : ''}`} style={{ color: COLORS.text }}>
                          {item.name}
                        </span>
                        {item.committed && <Star size={12} fill="currentColor" style={{ color: COLORS.warning }} />}
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <StatIcon size={12} style={{ color: STAT_CONFIG[item.stat].color }} />
                        <span className="text-[10px] font-mono" style={{ color: diff.color }}>{diff.label}</span>
                        {item.streak > 0 && (
                          <span className="text-[10px] font-mono flex items-center gap-1" style={{ color: COLORS.brandPrimary }}>
                            <Flame size={8} /> {item.streak}
                          </span>
                        )}
                      </div>
                      {isPending && (
                        <button onClick={() => toggleCommit(item.id)} className="mt-1 text-[10px] font-bold flex items-center gap-1 mx-auto" style={{ color: item.committed ? COLORS.warning : COLORS.textMuted }}>
                          <Star size={8} fill={item.committed ? "currentColor" : "none"} /> {item.committed ? "COMMITTED (1.5x XP / 2x Dmg)" : "Commit?"}
                        </button>
                      )}
                    </div>

                    {/* RIGHT: Positive Button (✓) */}
                    {isPending ? (
                      <button 
                        onClick={() => handleTaskAction(item.id, "dailies", "positive")}
                        className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 shrink-0"
                        style={{ background: COLORS.success, boxShadow: `0 0 10px ${COLORS.success}40` }}
                      >
                        <Check size={20} style={{ color: '#000' }} strokeWidth={3} />
                      </button>
                    ) : (
                      <div className="px-3 py-1.5 rounded-md text-xs font-bold font-mono" style={{ background: item.status === "completed" ? `${COLORS.success}20` : `${COLORS.danger}20`, color: item.status === "completed" ? COLORS.success : COLORS.danger }}>
                        {item.status === "completed" ? "DONE" : "FAIL"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TODOS TAB */}
          {activeTab === "todos" && (
            <div className="space-y-3">
              {todos.map(item => {
                const diff = DIFFICULTY_CONFIG[item.diff];
                const StatIcon = STAT_CONFIG[item.stat].icon;
                const cardStyle = getTaskCardStyle(item.status);
                const isPending = item.status === "pending";
                
                return (
                  <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl border transition-all" style={{ background: cardStyle.bg, borderColor: cardStyle.border }}>
                    
                    {/* LEFT: Negative (Hidden for Todos, but keeping layout consistent) */}
                    <div className="w-12 h-12 shrink-0"></div>

                    {/* MIDDLE: Info */}
                    <div className="flex-1 min-w-0 text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className={`text-sm font-medium truncate ${!isPending ? 'line-through opacity-60' : ''}`} style={{ color: COLORS.text }}>
                          {item.name}
                        </span>
                        {item.due && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${COLORS.danger}20`, color: COLORS.danger }}>{item.due}</span>}
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <StatIcon size={12} style={{ color: STAT_CONFIG[item.stat].color }} />
                        <span className="text-[10px] font-mono" style={{ color: diff.color }}>{diff.label}</span>
                      </div>
                    </div>

                    {/* RIGHT: Positive Button (✓) */}
                    {isPending ? (
                      <button 
                        onClick={() => handleTaskAction(item.id, "todos", "positive")}
                        className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 shrink-0"
                        style={{ background: COLORS.success, boxShadow: `0 0 10px ${COLORS.success}40` }}
                      >
                        <Check size={20} style={{ color: '#000' }} strokeWidth={3} />
                      </button>
                    ) : (
                      <div className="px-3 py-1.5 rounded-md text-xs font-bold font-mono" style={{ background: `${COLORS.success}20`, color: COLORS.success }}>DONE</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* QUESTS TAB */}
          {activeTab === "quests" && (
            <div className="space-y-4">
              {quests.map(q => (
                <div key={q.id} className="rounded-xl p-5" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-base font-bold" style={{ color: COLORS.text }}>{q.name}</h3>
                      <p className="text-xs" style={{ color: COLORS.textMuted }}>{q.desc}</p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-1 rounded" style={{ background: q.type === "weekly" ? `${COLORS.brandBlue}20` : `${COLORS.brandPrimary}20`, color: q.type === "weekly" ? COLORS.brandBlue : COLORS.brandPrimary }}>
                      {q.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 my-3">
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#000' }}>
                      <div className="h-full" style={{ width: `${(q.progress/q.target)*100}%`, background: q.type === "weekly" ? COLORS.brandBlue : COLORS.brandPrimary }}></div>
                    </div>
                    <span className="font-mono text-xs" style={{ color: COLORS.textMuted }}>{q.progress}/{q.target}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    {q.reward.gold && <span className="flex items-center gap-1" style={{ color: COLORS.brandPrimary }}><Coins size={12} /> {q.reward.gold}</span>}
                    {q.reward.gems && <span className="flex items-center gap-1" style={{ color: COLORS.brandBlue }}><Gem size={12} /> {q.reward.gems}</span>}
                    <span className="flex items-center gap-1" style={{ color: COLORS.textMuted }}><Hexagon size={12} /> {q.reward.xp} XP</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STATS TAB (Pending Points Allocation) */}
          {activeTab === "stats" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(state.stats).map(([key, val]) => {
                const config = STAT_CONFIG[key];
                const Icon = config.icon;
                const tier = getTier(val);
                const pct = (val / 10000) * 100;
                const isMaxed = val >= 10000;
                const pending = state.pendingPoints[key];
                
                return (
                  <div key={key} className="rounded-xl p-6" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Icon size={18} style={{ color: config.color }} />
                        <span className="font-bold">{config.name}</span>
                      </div>
                      <span className="text-xs font-mono uppercase" style={{ color: COLORS.textMuted }}>{tier.name}</span>
                    </div>
                    
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-3xl font-bold font-mono">{val.toLocaleString()}</span>
                      <span className="text-sm" style={{ color: COLORS.textMuted }}>/ 10,000</span>
                    </div>
                    
                    <div className="w-full h-3 rounded-full overflow-hidden mb-4" style={{ background: '#000' }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: config.color }}></div>
                    </div>

                    {/* Pending Points Allocation UI */}
                    {!isMaxed ? (
                      <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: COLORS.surfaceAlt }}>
                        <div className="text-sm">
                          <span style={{ color: COLORS.text }}>Pending: </span>
                          <span className="font-mono font-bold" style={{ color: COLORS.warning }}>{pending} / {MAX_PENDING_POINTS}</span>
                        </div>
                        <button 
                          onClick={() => allocateStat(key)} 
                          disabled={pending === 0}
                          className="px-4 py-2 rounded-md font-bold text-sm transition-all disabled:opacity-30"
                          style={{ background: config.color, color: '#000' }}
                        >
                          Allocate +
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setRebirthModal(true)} className="w-full mt-2 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all" style={{ background: `${COLORS.warning}20`, border: `1px solid ${COLORS.warning}50`, color: COLORS.warning }}>
                        <RotateCcw size={16} /> Rebirth Available
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ECOSYSTEM TAB */}
          {activeTab === "ecosystem" && (
            <div className="rounded-xl p-8 flex flex-col items-center" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
              <h2 className="text-xl font-bold mb-6">Your Cosmic Canvas</h2>
              <div className="relative h-64 w-64 flex items-center justify-center mb-8">
                <div className="absolute w-16 h-16 rounded-full z-10 transition-all duration-1000" style={{ background: ecoCore, boxShadow: `0 0 30px ${ecoCore}` }}></div>
                <div className="absolute w-32 h-32 border rounded-full animate-spin" style={{ borderColor: `${COLORS.brandBlue}40`, animationDuration: '10s' }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full" style={{ background: COLORS.brandBlue }}></div>
                </div>
                <div className="absolute w-48 h-48 border rounded-full animate-spin" style={{ borderColor: `${COLORS.brandPrimary}20`, animationDuration: '20s', animationDirection: 'reverse' }}>
                  <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full" style={{ background: COLORS.brandPrimary }}></div>
                </div>
              </div>
              <p className="text-sm text-center max-w-md mb-6" style={{ color: COLORS.textMuted }}>
                Spend your Gold and Gems to expand your galaxy. Buy planets, stars, and cosmic phenomena.
              </p>
              <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                <button className="p-4 rounded-lg transition-colors" style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}` }}>
                  <div className="w-8 h-8 rounded-full mx-auto mb-2" style={{ background: COLORS.brandBlue }}></div>
                  <div className="text-xs font-mono">Ocean Planet</div>
                  <div className="text-xs flex items-center justify-center gap-1 mt-1" style={{ color: COLORS.brandPrimary }}><Coins size={10} /> 200</div>
                </button>
                <button className="p-4 rounded-lg transition-colors" style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}` }}>
                  <div className="w-8 h-8 rounded-full mx-auto mb-2" style={{ background: COLORS.warning, boxShadow: `0 0 10px ${COLORS.warning}80` }}></div>
                  <div className="text-xs font-mono">Binary Star</div>
                  <div className="text-xs flex items-center justify-center gap-1 mt-1" style={{ color: COLORS.brandBlue }}><Gem size={10} /> 5</div>
                </button>
                <button className="p-4 rounded-lg opacity-50 cursor-not-allowed" style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}` }}>
                  <Lock size={20} className="mx-auto mb-2" style={{ color: COLORS.textMuted }} />
                  <div className="text-xs font-mono" style={{ color: COLORS.textMuted }}>Black Hole</div>
                  <div className="text-xs flex items-center justify-center gap-1 mt-1" style={{ color: COLORS.brandBlue }}><Gem size={10} /> 50</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden flex items-center justify-around p-2 z-40" style={{ background: COLORS.surface, borderTop: `1px solid ${COLORS.border}` }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg w-16"
            style={{ color: activeTab === tab.id ? COLORS.brandPrimary : COLORS.textMuted }}
          >
            <tab.icon size={20} />
            <span className="text-[9px] font-medium">{tab.name}</span>
          </button>
        ))}
      </nav>

      {/* TOASTS */}
      {toast && (
        <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 animate-slide-up">
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border backdrop-blur-md" style={{
            background: COLORS.surface,
            borderColor: toast.type === 'level' ? COLORS.success : toast.type === 'damage' ? COLORS.danger : toast.type === 'warning' ? COLORS.warning : COLORS.borderLight,
          }}>
            <span className="text-sm font-medium" style={{ color: COLORS.text }}>{toast.text}</span>
          </div>
        </div>
      )}

      {/* DEATH SCREEN */}
      {deathScreen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4">
          <Skull size={80} className="mb-6" style={{ color: COLORS.danger }} />
          <h2 className="text-4xl font-bold mb-3 tracking-widest" style={{ color: COLORS.danger }}>VITALITY DEPLETED</h2>
          <p className="mb-8 text-center max-w-md" style={{ color: COLORS.textMuted }}>
            Your physical form has collapsed. You have lost all XP, Streaks, and Pending Points. Your cosmic attributes remain intact.
          </p>
          <button onClick={respawn} className="px-8 py-3 rounded-lg font-bold tracking-wider transition-all" style={{ background: `${COLORS.danger}20`, border: `1px solid ${COLORS.danger}`, color: COLORS.danger }}>
            Respawn with 1 HP
          </button>
        </div>
      )}

      {/* REBIRTH MODAL */}
      {rebirthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setRebirthModal(false)}>
          <div className="rounded-2xl w-full max-w-md p-6 relative" style={{ background: COLORS.surface, border: `1px solid ${COLORS.warning}50` }} onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center">
              <RotateCcw size={48} className="mb-4" style={{ color: COLORS.warning }} />
              <h3 className="text-2xl font-bold mb-2">Cosmic Rebirth</h3>
              <p className="text-sm mb-6" style={{ color: COLORS.textMuted }}>
                You have reached the maximum threshold for a physical attribute. By rebirthing, you reset this attribute to 0, but gain a permanent multiplier and a one-time cosmic reward.
              </p>
              <div className="rounded-lg p-4 mb-6 w-full" style={{ background: COLORS.surfaceAlt }}>
                <div className="flex justify-between text-sm mb-2"><span style={{ color: COLORS.textMuted }}>STR Reset:</span><span className="font-mono" style={{ color: COLORS.danger }}>10,000 &rarr; 0</span></div>
                <div className="flex justify-between text-sm mb-2"><span style={{ color: COLORS.textMuted }}>Gold Reward:</span><span className="font-mono" style={{ color: COLORS.brandPrimary }}>+1,000</span></div>
                <div className="flex justify-between text-sm"><span style={{ color: COLORS.textMuted }}>Gem Reward:</span><span className="font-mono" style={{ color: COLORS.brandBlue }}>+10</span></div>
              </div>
              <button onClick={handleRebirth} className="w-full py-3 rounded-lg font-bold transition-all" style={{ background: COLORS.warning, color: '#000' }}>
                Confirm Rebirth
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}