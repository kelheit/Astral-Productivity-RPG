import { Check, AlertTriangle, Tag, FileText } from "lucide-react";
import { Panel } from "../ui/Panel";
import { StatChip } from "../ui/StatChip";
import { DiffTag } from "../ui/DiffTag";
import { useTheme } from "../../contexts/ThemeContext";

export function TodoRow({ t, onToggle, onEdit }) {
  const { theme: c, mode } = useTheme();
  return (
    <Panel style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", opacity: t.done ? 0.55 : 1, borderColor: t.overdue ? c.danger + "88" : c.border }}>
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(t.id); }}
        aria-label={`${t.done ? "Uncheck" : "Check"} todo ${t.name}`}
        style={{ width: 24, height: 24, flexShrink: 0, borderRadius: 6, background: t.done ? c.success : "transparent", border: `2px solid ${t.done ? c.success : c.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s ease", padding: 0 }}
      >
        {t.done && <Check size={14} color={mode === "dark" ? "#100e1a" : "#fff"} />}
      </button>
      <div
        onClick={() => onEdit(t)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onEdit(t); } }}
        aria-label={`Edit ${t.name}`}
        style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
      >
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, textDecoration: t.done ? "line-through" : "none" }}>{t.name}</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <StatChip stat={t.stat} />
          <DiffTag diff={t.diff} />
          {t.overdue && <span style={{ fontSize: 10, color: c.danger, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 3 }}><AlertTriangle size={10} /> {t.daysOverdue}d overdue</span>}
        </div>
        {(t.notes || t.tags?.length > 0) && (
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 6, flexWrap: "wrap" }}>
            {t.notes && (
              <span style={{ fontSize: 10, color: c.textFaint, display: "flex", alignItems: "center", gap: 3 }}>
                <FileText size={10} />{t.notes}
              </span>
            )}
            {t.tags?.map(tag => (
              <span key={tag} style={{ fontSize: 9, color: c.purpleSoft, background: c.purpleBg + "66", padding: "1px 6px", borderRadius: 3, display: "flex", alignItems: "center", gap: 2 }}>
                <Tag size={8} />{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Panel>
  );
}
