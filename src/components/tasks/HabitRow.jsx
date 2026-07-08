import { Plus, Minus, Undo2, Flame, Tag, FileText } from "lucide-react";
import { Panel } from "../ui/Panel";
import { StatChip } from "../ui/StatChip";
import { DiffTag } from "../ui/DiffTag";
import { useTheme } from "../../contexts/ThemeContext";

export function HabitRow({ h, onTap, undo, cancelUndo, onEdit }) {
  const { theme: c } = useTheme();
  return (
    <Panel style={{ display: "flex", overflow: "hidden", padding: 0 }}>
      {undo && undo.id === h.id && h.neg ? (
        <button
          onClick={cancelUndo}
          aria-label={`Cancel undo for ${h.name}`}
          style={{ width: 52, flexShrink: 0, background: c.danger + "26", border: "none", borderRight: `1px solid ${c.border}`, color: c.danger, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", cursor: "pointer" }}
        >
          <Undo2 size={13} />{undo.countdown}s
        </button>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); h.neg && onTap(h.id, false); }}
          disabled={!h.neg}
          aria-label={`Log negative for ${h.name}`}
          style={{ width: 40, flexShrink: 0, background: h.neg ? c.danger + "26" : c.borderSoft, border: "none", borderRight: `1px solid ${c.border}`, color: h.neg ? c.danger : c.textFaint, display: "flex", alignItems: "center", justifyContent: "center", cursor: h.neg ? "pointer" : "not-allowed", opacity: h.neg ? 1 : 0.5 }}
        >
          <Minus size={16} />
        </button>
      )}
      <div
        onClick={() => onEdit(h)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onEdit(h); } }}
        aria-label={`Edit ${h.name}`}
        style={{ flex: 1, padding: "10px 12px", minWidth: 0, cursor: "pointer" }}
      >
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{h.name}</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <StatChip stat={h.stat} />
          <DiffTag diff={h.diff} />
          <span style={{ fontSize: 11, color: h.streak < 0 ? c.danger : c.textMuted, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 3 }}>
            <Flame size={11} fill={h.streak < 0 ? c.danger : "none"} /> {h.streak}
          </span>
          <span style={{ fontSize: 10, color: c.textFaint, fontFamily: "'JetBrains Mono', monospace" }}>
            (Today: +{h.posToday} | -{h.negToday})
          </span>
        </div>
        {(h.notes || h.tags?.length > 0) && (
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 6, flexWrap: "wrap" }}>
            {h.notes && (
              <span style={{ fontSize: 10, color: c.textFaint, display: "flex", alignItems: "center", gap: 3 }}>
                <FileText size={10} />{h.notes}
              </span>
            )}
            {h.tags?.map(tag => (
              <span key={tag} style={{ fontSize: 9, color: c.purpleSoft, background: c.purpleBg + "66", padding: "1px 6px", borderRadius: 3, display: "flex", alignItems: "center", gap: 2 }}>
                <Tag size={8} />{tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); h.pos && onTap(h.id, true); }}
        disabled={!h.pos}
        aria-label={`Log positive for ${h.name}`}
        style={{ width: 40, flexShrink: 0, background: h.pos ? c.success + "26" : c.borderSoft, border: "none", borderLeft: `1px solid ${c.border}`, color: h.pos ? c.success : c.textFaint, display: "flex", alignItems: "center", justifyContent: "center", cursor: h.pos ? "pointer" : "not-allowed", opacity: h.pos ? 1 : 0.5 }}
      >
        <Plus size={16} />
      </button>
    </Panel>
  );
}
