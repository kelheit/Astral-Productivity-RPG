import { Check, Tag, FileText } from "lucide-react";
import { Panel } from "../ui/Panel";
import { StatChip } from "../ui/StatChip";
import { DiffTag } from "../ui/DiffTag";
import { useTheme } from "../../contexts/ThemeContext";

export function DailyRow({ d, onToggle, onCommit, onEdit }) {
  const { theme: c, mode } = useTheme();
  return (
    <Panel style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", opacity: d.done ? 0.55 : 1 }}>
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(d.id); }}
        aria-label={`${d.done ? "Uncheck" : "Check"} daily ${d.name}`}
        style={{ width: 24, height: 24, flexShrink: 0, borderRadius: 6, background: d.done ? c.success : "transparent", border: `2px solid ${d.done ? c.success : c.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s ease", padding: 0 }}
      >
        {d.done && <Check size={14} color={mode === "dark" ? "#100e1a" : "#fff"} />}
      </button>
      <div
        onClick={() => onEdit(d)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onEdit(d); } }}
        aria-label={`Edit ${d.name}`}
        style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
      >
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, textDecoration: d.done ? "line-through" : "none" }}>{d.name}</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <StatChip stat={d.stat} />
          <DiffTag diff={d.diff} />
          <span style={{ fontSize: 9, color: c.gold, fontFamily: "'JetBrains Mono', monospace" }}>+25% XP · no HP risk</span>
        </div>
        {(d.notes || d.tags?.length > 0) && (
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 6, flexWrap: "wrap" }}>
            {d.notes && (
              <span style={{ fontSize: 10, color: c.textFaint, display: "flex", alignItems: "center", gap: 3 }}>
                <FileText size={10} />{d.notes}
              </span>
            )}
            {d.tags?.map(tag => (
              <span key={tag} style={{ fontSize: 9, color: c.purpleSoft, background: c.purpleBg + "66", padding: "1px 6px", borderRadius: 3, display: "flex", alignItems: "center", gap: 2 }}>
                <Tag size={8} />{tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onCommit(d.id); }}
        aria-label={`${d.committed ? "Uncommit" : "Commit"} ${d.name}`}
        style={{ height: 28, flexShrink: 0, padding: "0 12px", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: d.committed ? c.warning + "26" : "transparent", border: `1px solid ${d.committed ? c.warning : c.border}`, color: d.committed ? c.warning : c.textFaint, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
      >
        {d.committed ? "MARKED" : "MARK"}
      </button>
    </Panel>
  );
}
