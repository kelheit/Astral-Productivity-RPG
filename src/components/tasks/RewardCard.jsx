import { Coins, Gem } from "lucide-react";
import { Panel } from "../ui/Panel";
import { useTheme } from "../../contexts/ThemeContext";

export function RewardCard({ r, onBuy, onEdit }) {
  const { theme: c } = useTheme();
  return (
    <Panel
      onClick={() => onEdit(r)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onEdit(r); } }}
      aria-label={`Edit ${r.name}`}
      style={{ padding: 14, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 10, cursor: "pointer" }}
    >
      <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div>
      <button
        onClick={(e) => { e.stopPropagation(); onBuy(r); }}
        aria-label={`Buy ${r.name} for ${r.cost} ${r.gem ? "gems" : "gold"}`}
        style={{ background: "transparent", border: `1px solid ${r.gem ? c.teal : c.gold}`, color: r.gem ? c.teal : c.gold, padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, cursor: "pointer", borderRadius: 4 }}
      >
        {r.gem ? <Gem size={12} /> : <Coins size={12} />} {r.cost}
      </button>
    </Panel>
  );
}
