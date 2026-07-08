export const STAT_META = {
  STR: { name: "Strength" },
  INT: { name: "Intelligence" },
  DEX: { name: "Dexterity" },
  CON: { name: "Constitution" },
};

export const STAT_COLOR = { STR: "#ef4b6a", INT: "#4d8dff", DEX: "#ffcf56", CON: "#57d888" };

export const DIFF = {
  Trivial: { pct: 0.005, gain: 1 },
  Easy: { pct: 0.01, gain: 2 },
  Medium: { pct: 0.02, gain: 4 },
  Hard: { pct: 0.05, gain: 8 },
};

export const DIFF_ORDER = ["Trivial", "Easy", "Medium", "Hard"];
export const STAT_CAP = 10000;
export const MAX_PENDING = 100;
export const DAILY_BONUS_MULT = 1.25;

export const CLASSES = {
  Warrior: { stat: "STR", perk: "+15% gold from STR habits", color: "#ef4b6a" },
  Mage: { stat: "INT", perk: "+15% gold from INT habits", color: "#4d8dff" },
  Rogue: { stat: "DEX", perk: "+15% gold from DEX habits", color: "#ffcf56" },
  Healer: { stat: "CON", perk: "+15% gold from CON habits", color: "#57d888" },
};

export const DIFF_COLOR_MAP = {
  Trivial: "text-muted",
  Easy: "#57d888",
  Medium: "#ffcf56",
  Hard: "#ef4b6a",
};

export const MOBILE_TABS = [
  "habits", "dailies", "todos", "rewards", "stats",
];
