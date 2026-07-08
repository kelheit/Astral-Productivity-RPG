import { useState, useEffect, useRef, useCallback } from "react";
import {
  Heart, Flame, Coins, Gem, ListTodo, CalendarCheck, Target, Sun, Moon,
  Plus, RotateCcw, AlertTriangle,
} from "lucide-react";
import { useTheme } from "./contexts/ThemeContext";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useToast } from "./hooks/useToast";
import { Bar } from "./components/ui/Bar";
import { SectionHead } from "./components/ui/SectionHead";
import { Toast } from "./components/ui/Toast";
import { UndoToast } from "./components/ui/UndoToast";
import { ActivityRing } from "./components/ui/ActivityRing";
import { CharacterSprite } from "./components/ui/CharacterSprite";
import { HabitRow } from "./components/tasks/HabitRow";
import { DailyRow } from "./components/tasks/DailyRow";
import { TodoRow } from "./components/tasks/TodoRow";
import { RewardCard } from "./components/tasks/RewardCard";
import { AddTaskModal } from "./components/modals/AddTaskModal";
import { StatsView } from "./components/layout/StatsView";
import { LiveClock } from "./components/ui/LiveClock";
import {
  DIFF, DAILY_BONUS_MULT, MAX_PENDING,
} from "./constants/gameData";
import {
  INIT_USER, INIT_HABITS, INIT_DAILIES, INIT_TODOS, INIT_REWARDS,
} from "./constants/mockData";
import { calculateMaxHp, calculateXpToNext, calculateMidnightMath, calculateOverdueDamage } from "./utils/math";

const UNDO_DURATION = 3;

function useUndoQueue(onExpire) {
  const [queue, setQueue] = useState([]);
  const timersRef = useRef({});
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const add = useCallback((item) => {
    const { id } = item;
    setQueue(prev => [...prev, { ...item, countdown: UNDO_DURATION }]);
    timersRef.current[id] = window.setTimeout(() => {
      setQueue(prev => prev.filter(i => i.id !== id));
      delete timersRef.current[id];
      if (onExpireRef.current) onExpireRef.current(item);
    }, UNDO_DURATION * 1000);
  }, []);

  const remove = useCallback((id) => {
    window.clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
    setQueue(prev => prev.filter(item => item.id !== id));
  }, []);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      Object.values(timers).forEach(window.clearTimeout);
    };
  }, []);

  return { queue, add, remove };
}

export default function AstralPrototype() {
  const { theme: c, mode, toggle: toggleTheme } = useTheme();
  const [tab, setTab] = useState("habits");
  const [desktopView, setDesktopView] = useState("tasks");
  const [user, setUser] = useLocalStorage("user", INIT_USER);
  const [habits, setHabits] = useLocalStorage("habits", INIT_HABITS);
  const [dailies, setDailies] = useLocalStorage("dailies", INIT_DAILIES);
  const [todos, setTodos] = useLocalStorage("todos", INIT_TODOS);
  const [rewards, setRewards] = useLocalStorage("rewards", INIT_REWARDS);

  const { toast, showToast } = useToast();

  const damageHp = useCallback((amount, msg) => {
    setUser(prev => ({ ...prev, hp: Math.max(0, prev.hp - amount) }));
    showToast(msg, "damage");
  }, [setUser, showToast]);

  const handleUndoExpire = useCallback((item) => {
    damageHp(item.damage, `Slipped — −${item.damage} HP`);
  }, [damageHp]);
  const undoQueue = useUndoQueue(handleUndoExpire);
  const [uncheckUndo, setUncheckUndo] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("habits");
  const [editingItem, setEditingItem] = useState(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  const [equipWeapon, setEquipWeapon] = useState(true);
  const [equipPet, setEquipPet] = useState(true);

  const idRef = useRef(1000);
  const nextId = (p) => `${p}${idRef.current++}`;

  const xpToNext = calculateXpToNext(user.level);

  /* --- Auto overdue tracking --- */
  useEffect(() => {
    const check = () => {
      const today = new Date();
      const todayStr = today.toDateString();
      const last = localStorage.getItem("habit_ledger_lastDate");
      if (last && last !== todayStr) {
        setTodos(prev => prev.map(t => {
          if (t.overdue && !t.done) {
            return { ...t, daysOverdue: t.daysOverdue + 1 };
          }
          return t;
        }));
      }
      localStorage.setItem("habit_ledger_lastDate", todayStr);
    };
    check();
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  }, [setTodos]);

  /* --- Race-condition-safe XP gain --- */
  const gainXpAndStat = useCallback((stat, diff, mult = 1) => {
    const cfg = DIFF[diff];
    setUser(prev => {
      const maxHp = prev.maxHp;
      const xpGain = Math.round(maxHp * cfg.pct * 4 * mult);
      const statGain = Math.round(cfg.gain * mult);
      const currentPending = prev.pending[stat];
      if (currentPending >= MAX_PENDING) {
        showToast(`${stat} pending points full — allocate in Stats.`, "warning");
        return prev;
      }
      const newPending = { ...prev.pending, [stat]: Math.min(MAX_PENDING, currentPending + statGain) };
      let xp = prev.xp + xpGain, level = prev.level, newMaxHp = prev.maxHp;

      if (xp >= calculateXpToNext(level)) {
        xp -= calculateXpToNext(level);
        level++;
        newMaxHp = calculateMaxHp(level);
        setTimeout(() => showToast(`Level up — ${level}! Max HP: ${newMaxHp}`, "level"), 0);
      } else {
        setTimeout(() => showToast(`+${xpGain} XP · +${statGain} pending ${stat}`, "success"), 0);
      }
      return { ...prev, xp, level, maxHp: newMaxHp, pending: newPending };
    });
  }, [setUser, showToast]);

  const revertXpAndStat = useCallback((stat, diff, mult = 1) => {
    const cfg = DIFF[diff];
    let touchedPermanent = false;

    setUser(prev => {
      const maxHp = prev.maxHp;
      const xpLoss = Math.round(maxHp * cfg.pct * 4 * mult);
      const statLoss = Math.round(cfg.gain * mult);
      const pendingAmt = prev.pending[stat];
      let newPending = pendingAmt;
      let newStatVal = prev.stats[stat];

      if (pendingAmt >= statLoss) {
        newPending = pendingAmt - statLoss;
      } else {
        newPending = 0;
        const remainder = statLoss - pendingAmt;
        newStatVal = Math.max(0, prev.stats[stat] - remainder);
        if (remainder > 0) touchedPermanent = true;
      }

      return {
        ...prev,
        xp: Math.max(0, prev.xp - xpLoss),
        pending: { ...prev.pending, [stat]: newPending },
        stats: { ...prev.stats, [stat]: newStatVal },
      };
    });

    return touchedPermanent;
  }, [setUser]);

  /* --- Habits with undo queue --- */
  const tapHabit = useCallback((id, positive) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    if (positive) {
      setHabits(prev => prev.map(h => h.id === id ? { ...h, posToday: h.posToday + 1, dayScore: h.dayScore + 1 } : h));
      gainXpAndStat(habit.stat, habit.diff);
    } else {
      if (undoQueue.queue.length > 0) return;
      setHabits(prev => prev.map(h => h.id === id ? { ...h, negToday: h.negToday + 1, dayScore: h.dayScore - 1 } : h));
      const dmg = Math.round(user.maxHp * DIFF[habit.diff].pct * 2);
      const habitId = id;
      undoQueue.add({ id: habitId, damage: dmg });
      setUser(prev => {
        const hp = Math.max(0, prev.hp - dmg);
        setTimeout(() => showToast(`Slipped — −${dmg} HP`, "damage"), 3100);
        return { ...prev, hp };
      });
    }
  }, [habits, gainXpAndStat, undoQueue, setHabits, user.maxHp, setUser, showToast]);

  const cancelUndo = useCallback((id) => {
    undoQueue.remove(id);
    showToast("Undone.", "info");
  }, [undoQueue, showToast]);

  /* --- Dailies & Todos --- */
  const handleToggleDaily = useCallback((id) => {
    const d = dailies.find(x => x.id === id);
    if (!d) return;
    if (!d.done) {
      gainXpAndStat(d.stat, d.diff, DAILY_BONUS_MULT);
      setDailies(prev => prev.map(x => x.id === id ? { ...x, done: !x.done } : x));
    } else {
      const touchedPermanent = revertXpAndStat(d.stat, d.diff, DAILY_BONUS_MULT);
      if (touchedPermanent) setTimeout(() => showToast(`Warning: Allocated ${d.stat} points subtracted!`, "warning"), 0);
      setDailies(prev => prev.map(x => x.id === id ? { ...x, done: !x.done } : x));
      setUncheckUndo({ id, type: "dailies", countdown: 3 });
    }
  }, [dailies, gainXpAndStat, revertXpAndStat, setDailies, showToast]);

  const handleToggleTodo = useCallback((id) => {
    const t = todos.find(x => x.id === id);
    if (!t) return;
    if (!t.done) {
      gainXpAndStat(t.stat, t.diff);
      setTodos(prev => prev.map(x => x.id === id ? { ...x, done: !x.done } : x));
    } else {
      const touchedPermanent = revertXpAndStat(t.stat, t.diff);
      if (touchedPermanent) setTimeout(() => showToast(`Warning: Allocated ${t.stat} points subtracted!`, "warning"), 0);
      setTodos(prev => prev.map(x => x.id === id ? { ...x, done: !x.done } : x));
      setUncheckUndo({ id, type: "todos", countdown: 3 });
    }
  }, [todos, gainXpAndStat, revertXpAndStat, setTodos, showToast]);

  useEffect(() => {
    if (!uncheckUndo) return;
    if (uncheckUndo.countdown <= 0) { setUncheckUndo(null); return; }
    const t = setTimeout(() => setUncheckUndo(prev => prev ? { ...prev, countdown: prev.countdown - 1 } : null), 1000);
    return () => clearTimeout(t);
  }, [uncheckUndo]);

  const handleUncheckUndo = useCallback(() => {
    if (!uncheckUndo) return;
    if (uncheckUndo.type === "dailies") {
      setDailies(prev => prev.map(x => x.id === uncheckUndo.id ? { ...x, done: true } : x));
    } else {
      setTodos(prev => prev.map(x => x.id === uncheckUndo.id ? { ...x, done: true } : x));
    }
    setUncheckUndo(null);
    showToast("Uncheck reversed.", "success");
  }, [uncheckUndo, setDailies, setTodos, showToast]);

  const toggleCommit = useCallback((id) => {
    setDailies(prev => prev.map(x => x.id === id ? { ...x, committed: !x.committed } : x));
  }, [setDailies]);

  /* --- Rewards --- */
  const buyReward = useCallback((r) => {
    if (r.gem) {
      if (user.gems < r.cost) return showToast("Not enough gems.", "warning");
      setUser(prev => ({ ...prev, gems: prev.gems - r.cost }));
    } else {
      if (user.gold < r.cost) return showToast("Not enough gold.", "warning");
      setUser(prev => ({ ...prev, gold: prev.gold - r.cost }));
    }
    showToast(`Redeemed: ${r.name}`, "success");
  }, [user, setUser, showToast]);

  /* --- Midnight Simulation (fixed streak logic) --- */
  const simulateMidnight = useCallback(() => {
    let rawDmg = 0;
    const updatedHabits = habits.map(h => {
      if (h.dayScore < 0) rawDmg += user.maxHp * DIFF[h.diff].pct;

      let newStreak = h.streak;
      if (h.pos) {
        if (h.dayScore > 0) newStreak += 1;
        else newStreak -= 1;
      }
      return { ...h, streak: newStreak, posToday: 0, negToday: 0, dayScore: 0 };
    });

    const { damage, regen } = calculateMidnightMath(rawDmg, user.maxHp);
    setHabits(updatedHabits);

    setUser(prev => {
      let hp = damage > 0 ? Math.max(0, prev.hp - damage) : prev.hp;
      hp = Math.min(prev.maxHp, hp + regen);
      setTimeout(() => {
        if (damage > 0) showToast(`Midnight — −${damage} HP · +${regen} HP regen`, "damage");
        else showToast(`Perfect Day! +${regen} HP regen`, "success");
      }, 0);
      return { ...prev, hp };
    });
  }, [habits, user.maxHp, setHabits, setUser, showToast]);

  /* --- Overdue Reset --- */
  const handleOverdueReset = useCallback(() => {
    let totalDmg = 0;
    const updatedTodos = todos.map(t => {
      if (t.overdue && !t.done) {
        totalDmg += calculateOverdueDamage(t.daysOverdue, user.maxHp);
        return { ...t, daysOverdue: t.daysOverdue + 1 };
      }
      return t;
    });
    totalDmg = Math.min(totalDmg, user.maxHp * 0.50);
    setTodos(updatedTodos);
    damageHp(Math.round(totalDmg), `Overdue damage — −${Math.round(totalDmg)} HP`);
  }, [todos, user.maxHp, setTodos, damageHp]);

  /* --- Edit / Delete --- */
  const handleEdit = useCallback((type, item) => {
    setModalType(type);
    setEditingItem(item);
    setModalOpen(true);
    setAddMenuOpen(false);
  }, []);

  const handleDelete = useCallback((id) => {
    if (modalType === "habits") {
      setHabits(prev => prev.filter(h => h.id !== id));
    } else if (modalType === "dailies") {
      setDailies(prev => prev.filter(d => d.id !== id));
    } else if (modalType === "todos") {
      setTodos(prev => prev.filter(t => t.id !== id));
    } else if (modalType === "rewards") {
      setRewards(prev => prev.filter(r => r.id !== id));
    }
    setModalOpen(false);
    setEditingItem(null);
    showToast("Task deleted.", "warning");
  }, [modalType, setHabits, setDailies, setTodos, setRewards, showToast]);

  /* --- Modal --- */
  const openModal = useCallback((type) => {
    setModalType(type);
    setEditingItem(null);
    setModalOpen(true);
    setAddMenuOpen(false);
  }, []);

  const handleModalSubmit = useCallback((data) => {
    if (editingItem) {
      if (modalType === "habits") {
        setHabits(prev => prev.map(h => h.id === editingItem.id ? { ...h, ...data } : h));
      } else if (modalType === "dailies") {
        setDailies(prev => prev.map(d => d.id === editingItem.id ? { ...d, ...data } : d));
      } else if (modalType === "todos") {
        setTodos(prev => prev.map(t => t.id === editingItem.id ? { ...t, ...data } : t));
      } else if (modalType === "rewards") {
        setRewards(prev => prev.map(r => r.id === editingItem.id ? { ...r, ...data } : r));
      }
      setEditingItem(null);
      setModalOpen(false);
      showToast("Task updated.", "success");
    } else {
      if (modalType === "habits") {
        setHabits(prev => [...prev, { id: nextId("h"), ...data, streak: 0, dayScore: 0, posToday: 0, negToday: 0 }]);
      } else if (modalType === "dailies") {
        setDailies(prev => [...prev, { id: nextId("d"), ...data, done: false, committed: false, streak: 0 }]);
      } else if (modalType === "todos") {
        setTodos(prev => [...prev, { id: nextId("t"), ...data, done: false, due: "No due date", overdue: false, daysOverdue: 0 }]);
      } else if (modalType === "rewards") {
        setRewards(prev => [...prev, { id: nextId("r"), name: data.name, cost: Math.max(1, data.cost), gem: data.gem }]);
      }
      setModalOpen(false);
      showToast("Task added successfully.", "success");
    }
  }, [editingItem, modalType, setHabits, setDailies, setTodos, setRewards, showToast]);

  const dropdownItems = [
    ["habits", "Habit", Flame], ["dailies", "Daily", CalendarCheck],
    ["todos", "To-Do", ListTodo], ["rewards", "Reward", Coins],
  ];

  const mobileTabs = [
    { id: "habits", label: "Habits", icon: Flame },
    { id: "dailies", label: "Dailies", icon: CalendarCheck },
    { id: "todos", label: "To-Do's", icon: ListTodo },
    { id: "rewards", label: "Rewards", icon: Coins },
    { id: "stats", label: "Stats", icon: Target },
  ];

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.text, fontFamily: "Inter, sans-serif" }}>
      <LiveClock />
      <style>{`
        * { box-sizing: border-box; }
        button { font-family: inherit; cursor: pointer; }
        input, textarea, select { outline: none; font-family: inherit; }
        input:focus, textarea:focus, select:focus { border-color: ${c.purpleSoft} !important; }
        ::-webkit-scrollbar { display: none; }
        .astral-shell { padding-bottom: 84px; }
        .astral-desktop-nav, .astral-desktop-hero, .astral-kanban, .astral-addbar-row { display: none !important; }
        .astral-mobile-tabs, .astral-bottomnav { display: block !important; }
        .astral-mobile-fab { display: flex !important; }
        @media (min-width: 1024px) {
          .astral-shell { padding-bottom: 32px; }
          .astral-mobile-tabs-strip, .astral-bottomnav, .astral-mobile-fab { display: none !important; }
          .astral-desktop-nav { display: block !important; }
          .astral-desktop-hero { display: block !important; }
          .astral-kanban { display: block !important; }
          .astral-addbar-row { display: flex !important; }
          .astral-mobile-only-header { display: none !important; }
        }
      `}</style>

      {/* MOBILE HEADER */}
      <div className="astral-mobile-only-header" style={{ position: "sticky", top: 0, zIndex: 30, background: c.bg + "f2", backdropFilter: "blur(6px)", borderBottom: `1px solid ${c.border}` }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 44, height: 44, background: c.raise, border: `1px solid ${c.border}`, position: "relative" }}>
                <CharacterSprite cls={user.class} equipWeapon={equipWeapon} equipPet={equipPet} frameSize={44} />
              </div>
              <div>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, letterSpacing: 1 }}>{user.name.toUpperCase()}</div>
                <div style={{ fontSize: 11, color: c.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>LV.{user.level} · {user.class}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}><Flame size={13} color={c.danger} /> {user.streak}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}><Coins size={13} color={c.gold} /> {user.gold}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}><Gem size={13} color={c.teal} /> {user.gems}</span>
              <button
                onClick={toggleTheme}
                aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
                style={{ background: c.raise, border: `1px solid ${c.border}`, padding: 6, display: "flex" }}
              >
                {mode === "dark" ? <Sun size={14} color={c.text} /> : <Moon size={14} color={c.text} />}
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: c.textMuted, marginBottom: 3 }}>
                <span style={{ color: c.danger, display: "flex", alignItems: "center", gap: 3 }}><Heart size={10} fill={c.danger} /> HP</span>
                <span>{user.hp}/{user.maxHp}</span>
              </div>
              <Bar value={user.hp} max={user.maxHp} color={c.danger} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: c.textMuted, marginBottom: 3 }}>
                <span style={{ color: c.gold }}>XP</span>
                <span>{user.xp}/{xpToNext}</span>
              </div>
              <Bar value={user.xp} max={xpToNext} color={c.gold} />
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP TOP NAV */}
      <div className="astral-desktop-nav" style={{ borderBottom: `1px solid ${c.border}`, background: c.surface }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14 }}>PIXELQUEST</span>
            <button
              onClick={() => setDesktopView("tasks")}
              style={{ background: "transparent", border: "none", color: desktopView === "tasks" ? c.text : c.textMuted, fontWeight: 600, fontSize: 15, borderBottom: desktopView === "tasks" ? `2px solid ${c.purpleSoft}` : "2px solid transparent", padding: "18px 2px" }}
            >
              Tasks
            </button>
            <button
              onClick={() => setDesktopView("stats")}
              style={{ background: "transparent", border: "none", color: desktopView === "stats" ? c.text : c.textMuted, fontWeight: 600, fontSize: 15, borderBottom: desktopView === "stats" ? `2px solid ${c.purpleSoft}` : "2px solid transparent", padding: "18px 2px" }}
            >
              Stats
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}><Flame size={15} color={c.danger} /> {user.streak}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}><Coins size={15} color={c.gold} /> {user.gold}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}><Gem size={15} color={c.teal} /> {user.gems}</span>
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
              style={{ background: c.raise, border: `1px solid ${c.border}`, padding: 8, display: "flex" }}
            >
              {mode === "dark" ? <Sun size={15} color={c.text} /> : <Moon size={15} color={c.text} />}
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP HERO */}
      {desktopView === "tasks" && (
        <div className="astral-desktop-hero" style={{ background: c.surface, borderBottom: `1px solid ${c.border}` }}>
          <div style={{ maxWidth: 1440, margin: "0 auto", padding: "26px 28px", display: "flex", gap: 28, alignItems: "center" }}>
            <div style={{ width: 110, height: 110, background: c.raise, border: `2px solid ${c.border}`, flexShrink: 0, position: "relative" }}>
              <CharacterSprite cls={user.class} equipWeapon={equipWeapon} equipPet={equipPet} frameSize={110} />
            </div>
            <div style={{ flex: 1, maxWidth: 460 }}>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, marginBottom: 8 }}>{user.name.toUpperCase()}</div>
              <div style={{ fontSize: 13, color: c.textMuted, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                Lv.{user.level} · {user.class} <span style={{ display: "flex", alignItems: "center", gap: 3, color: c.danger, fontFamily: "'JetBrains Mono', monospace" }}><Flame size={13} /> {user.streak}</span>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: c.textMuted, marginBottom: 4 }}>
                  <span style={{ color: c.danger }}>HP</span><span>{user.hp}/{user.maxHp}</span>
                </div>
                <Bar value={user.hp} max={user.maxHp} color={c.danger} height={9} />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: c.textMuted, marginBottom: 4 }}>
                  <span style={{ color: c.gold }}>XP</span><span>{user.xp}/{xpToNext}</span>
                </div>
                <Bar value={user.xp} max={xpToNext} color={c.gold} height={9} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 28, marginLeft: "auto", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <ActivityRing pct={dailies.filter(d => d.done).length / dailies.length} color={c.success} size={76} stroke={8}>
                  <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{dailies.filter(d => d.done).length}/{dailies.length}</span>
                </ActivityRing>
                <span style={{ fontSize: 9, color: c.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>DAILIES</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <ActivityRing pct={todos.filter(t => t.done).length / todos.length} color={c.teal} size={76} stroke={8}>
                  <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{todos.filter(t => t.done).length}/{todos.length}</span>
                </ActivityRing>
                <span style={{ fontSize: 9, color: c.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>TO-DO'S</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <ActivityRing pct={Math.min(1, user.streak / 30)} color={c.gold} size={76} stroke={8}>
                  <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{user.streak}</span>
                </ActivityRing>
                <span style={{ fontSize: 9, color: c.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>STREAK</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP ADD TASK BAR */}
      {desktopView === "tasks" && (
        <div className="astral-addbar-row" style={{ maxWidth: 1440, margin: "0 auto", padding: "22px 28px 0", justifyContent: "flex-end", position: "relative" }}>
          <button
            onClick={() => setAddMenuOpen(o => !o)}
            aria-label="Add task"
            aria-expanded={addMenuOpen}
            style={{ background: c.purple, color: "#fff", border: "none", padding: "11px 18px", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6, borderRadius: 4, boxShadow: "0 4px 12px rgba(97, 51, 180, 0.3)" }}
          >
            <Plus size={15} /> Add Task
          </button>
          {addMenuOpen && (
            <div style={{ position: "absolute", top: 65, right: 28, background: c.surface, border: `1px solid ${c.border}`, zIndex: 40, minWidth: 170, boxShadow: "0 8px 24px rgba(0,0,0,0.35)", borderRadius: 8, overflow: "hidden" }}>
              {dropdownItems.map(([key, label, Icon]) => (
                <button
                  key={key}
                  onClick={() => openModal(key)}
                  style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", padding: "11px 14px", background: "transparent", border: "none", color: c.text, fontSize: 13, borderBottom: `1px solid ${c.borderSoft}` }}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DESKTOP KANBAN */}
      {desktopView === "tasks" && (
        <div className="astral-kanban" style={{ maxWidth: 1440, margin: "0 auto", padding: "20px 28px 40px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(240px, 1fr))", gap: 48, overflowX: "auto" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <SectionHead big title="Habits" sub="Net-negative days cost HP at midnight (shared 30% cap)." />
              {habits.map(h => (
                <HabitRow
                  key={h.id}
                  h={h}
                  onTap={tapHabit}
                  undo={undoQueue.queue.find(u => u.id === h.id) || null}
                  cancelUndo={() => cancelUndo(h.id)}
                  onEdit={() => handleEdit("habits", h)}
                />
              ))}
              <button
                onClick={simulateMidnight}
                aria-label="Simulate midnight reset"
                style={{ background: "transparent", border: `1px dashed ${c.border}`, color: c.textMuted, padding: "10px", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 4, cursor: "pointer" }}
              >
                <RotateCcw size={12} /> Simulate midnight reset
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <SectionHead big title="Dailies" sub="No HP risk, ever — just a bigger reward when done." />
              {dailies.map(d => <DailyRow key={d.id} d={d} onToggle={handleToggleDaily} onCommit={toggleCommit} onEdit={() => handleEdit("dailies", d)} />)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <SectionHead big title="To-Do's" sub="One-time tasks. Overdue ones add to the shared damage cap." />
              {todos.map(t => <TodoRow key={t.id} t={t} onToggle={handleToggleTodo} onEdit={() => handleEdit("todos", t)} />)}
              <button
                onClick={handleOverdueReset}
                aria-label="Process overdue reset"
                style={{ background: "transparent", border: `1px dashed ${c.danger}`, color: c.danger, padding: "10px", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 4, cursor: "pointer", marginTop: 'auto' }}
              >
                <AlertTriangle size={12} /> Overdue Reset
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <SectionHead big title="Rewards" sub="Earned gold/gems only." />
              {rewards.map(r => <RewardCard key={r.id} r={r} onBuy={buyReward} onEdit={() => handleEdit("rewards", r)} />)}
            </div>
          </div>
        </div>
      )}

      {desktopView === "stats" && (
        <div className="astral-kanban" style={{ maxWidth: 1440, margin: "0 auto", padding: "28px" }}>
          <StatsView
            user={user}
            setUser={setUser}
            habits={habits}
            dailies={dailies}
            todos={todos}
            equipWeapon={equipWeapon}
            setEquipWeapon={setEquipWeapon}
            equipPet={equipPet}
            setEquipPet={setEquipPet}
          />
        </div>
      )}

      {/* MOBILE CONTENT */}
      <div className="astral-mobile-tabs-strip astral-shell">
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "16px" }}>
          {tab === "habits" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <SectionHead title="Habits" sub="Tap to log. Net-negative days cost HP at midnight (shared 30% cap)." />
              {habits.map(h => (
                <HabitRow
                  key={h.id}
                  h={h}
                  onTap={tapHabit}
                  undo={undoQueue.queue.find(u => u.id === h.id) || null}
                  cancelUndo={() => cancelUndo(h.id)}
                  onEdit={() => handleEdit("habits", h)}
                />
              ))}
              <button
                onClick={simulateMidnight}
                aria-label="Simulate midnight reset"
                style={{ marginTop: 6, background: "transparent", border: `1px dashed ${c.border}`, color: c.textMuted, padding: "10px", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 4, cursor: "pointer" }}
              >
                <RotateCcw size={13} /> Simulate midnight reset (demo)
              </button>
            </div>
          )}
          {tab === "dailies" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <SectionHead title="Dailies" sub="No HP risk, ever — just a bigger reward when done." />
              {dailies.map(d => <DailyRow key={d.id} d={d} onToggle={handleToggleDaily} onCommit={toggleCommit} onEdit={() => handleEdit("dailies", d)} />)}
            </div>
          )}
          {tab === "todos" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <SectionHead title="To-Do's" sub="One-time tasks. Overdue ones add to the shared damage cap." />
              {todos.map(t => <TodoRow key={t.id} t={t} onToggle={handleToggleTodo} onEdit={() => handleEdit("todos", t)} />)}
              <button
                onClick={handleOverdueReset}
                aria-label="Process overdue reset"
                style={{ marginTop: 6, background: "transparent", border: `1px dashed ${c.danger}`, color: c.danger, padding: "10px", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 4, cursor: "pointer" }}
              >
                <AlertTriangle size={13} /> Overdue Reset
              </button>
            </div>
          )}
          {tab === "rewards" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <SectionHead title="Rewards" sub="Earned gold & gems only — nothing here costs real money." />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                {rewards.map(r => <RewardCard key={r.id} r={r} onBuy={buyReward} onEdit={() => handleEdit("rewards", r)} />)}
              </div>
            </div>
          )}
          {tab === "stats" && (
            <StatsView
              user={user}
              setUser={setUser}
              habits={habits}
              dailies={dailies}
              todos={todos}
              equipWeapon={equipWeapon}
              setEquipWeapon={setEquipWeapon}
              equipPet={equipPet}
              setEquipPet={setEquipPet}
            />
          )}
        </div>
      </div>

      {/* MOBILE FAB */}
      <button
        className="astral-mobile-fab"
        onClick={() => openModal(tab === 'stats' ? 'habits' : tab)}
        aria-label="Add new task"
        style={{
          position: "fixed", bottom: 90, right: 30, width: 56, height: 56,
          background: c.purpleSoft, color: "#fff", border: "none", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 6px 16px rgba(97, 51, 180, 0.4)", zIndex: 40, cursor: "pointer",
        }}
      >
        <Plus size={28} />
      </button>

      <Toast toast={toast} />
      <UndoToast data={uncheckUndo} onUndo={handleUncheckUndo} />

      {/* MOBILE BOTTOM NAV */}
      <div className="astral-bottomnav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: c.surface, borderTop: `1px solid ${c.border}`, zIndex: 30 }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex" }}>
          {mobileTabs.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-label={t.label}
                aria-current={active ? "page" : undefined}
                style={{ flex: 1, background: "transparent", border: "none", padding: "10px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: active ? c.purpleSoft : c.textMuted }}
              >
                <Icon size={18} />
                <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }}>{t.label.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      </div>

      <AddTaskModal
        open={modalOpen}
        type={modalType}
        editItem={editingItem}
        onClose={() => { setModalOpen(false); setEditingItem(null); }}
        onSubmit={handleModalSubmit}
        onDelete={handleDelete}
      />
    </div>
  );
}
