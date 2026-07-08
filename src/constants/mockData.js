export const INIT_USER = {
  name: "Ryzen", class: "Warrior", level: 0, xp: 0, hp: 100, maxHp: 100,
  gold: 240, gems: 6, streak: 14,
  stats: { STR: 0, INT: 0, DEX: 0, CON: 0 },
  pending: { STR: 0, INT: 0, DEX: 0, CON: 0 },
};

export const INIT_HABITS = [
  { id: "h1", name: "Deep Work Block", stat: "INT", diff: "Hard", pos: true, neg: false, streak: 6, dayScore: 0, posToday: 2, negToday: 0, notes: "", tags: ["focus"], reset: "Daily" },
  { id: "h2", name: "Zero-G Calisthenics", stat: "STR", diff: "Medium", pos: true, neg: true, streak: 12, dayScore: 0, posToday: 1, negToday: 0, notes: "", tags: ["health"], reset: "Daily" },
  { id: "h3", name: "Late-Night Junk Food", stat: "CON", diff: "Medium", pos: false, neg: true, streak: 0, dayScore: 0, posToday: 0, negToday: 1, notes: "", tags: ["bad"], reset: "Daily" },
  { id: "h4", name: "Meditate", stat: "CON", diff: "Trivial", pos: true, neg: false, streak: -2, dayScore: 0, posToday: 0, negToday: 0, notes: "", tags: ["mind"], reset: "Daily" },
];

export const INIT_DAILIES = [
  { id: "d1", name: "Morning Routine", stat: "CON", diff: "Easy", done: false, committed: false, streak: 4, notes: "", tags: [], reset: "Daily" },
  { id: "d2", name: "Ship Code to Prod", stat: "DEX", diff: "Hard", done: false, committed: true, streak: 1, notes: "", tags: ["work"], reset: "Daily" },
  { id: "d3", name: "Read 20 Pages", stat: "INT", diff: "Medium", done: true, committed: false, streak: 9, notes: "", tags: [], reset: "Daily" },
];

export const INIT_TODOS = [
  { id: "t1", name: "Fix Bug #402", stat: "DEX", diff: "Medium", done: false, due: "Tomorrow", overdue: false, daysOverdue: 0, notes: "", tags: [], reset: "None" },
  { id: "t2", name: "Pitch Deck Design", stat: "INT", diff: "Hard", done: false, due: "Overdue", overdue: true, daysOverdue: 1, notes: "", tags: [], reset: "None" },
  { id: "t3", name: "Server Migration", stat: "INT", diff: "Hard", done: false, due: "Overdue", overdue: true, daysOverdue: 3, notes: "", tags: [], reset: "None" },
];

export const INIT_REWARDS = [
  { id: "r1", name: "Watch an episode", cost: 20 },
  { id: "r2", name: "Order takeout", cost: 60 },
  { id: "r3", name: "New game skin", cost: 150, gem: true },
  { id: "r4", name: "Lazy morning", cost: 35 },
];
