import { Dumbbell, Brain, Zap, Heart } from "lucide-react";
import { STAT_COLOR } from "../../constants/gameData";

const ICONS = { STR: Dumbbell, INT: Brain, DEX: Zap, CON: Heart };

export function StatChip({ stat, size = 12 }) {
  const Icon = ICONS[stat];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: STAT_COLOR[stat], fontFamily: "'JetBrains Mono', monospace" }}>
      <Icon size={size} /> {stat}
    </span>
  );
}
