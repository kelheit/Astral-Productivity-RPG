import { useState, useEffect } from "react";
import { Tag, Dumbbell, Brain, Zap, Heart, Trash2 } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { STAT_COLOR, DIFF_ORDER } from "../../constants/gameData";

const ICONS = { STR: Dumbbell, INT: Brain, DEX: Zap, CON: Heart };
const EMPTY_FORM = { name: "", notes: "", stat: "STR", diff: "Easy", pos: true, neg: false, tags: "", reset: "Daily", cost: 20, gem: false };

function inputStyle(c) {
  return { width: "100%", background: c.bg, border: `1px solid ${c.border}`, color: c.text, padding: "8px 10px", fontSize: 13, fontFamily: "Inter, sans-serif", borderRadius: 4 };
}
function ghostBtn(c) {
  return { background: "transparent", border: `1px solid ${c.border}`, color: c.textMuted, padding: "8px 16px", fontSize: 13, borderRadius: 4, cursor: "pointer" };
}
function primaryBtn(c, color) {
  return { background: color || c.purple, border: "none", color: "#fff", padding: "8px 16px", fontSize: 13, fontWeight: 700, borderRadius: 4, cursor: "pointer" };
}
function dangerBtn(c) {
  return { background: "transparent", border: `1px solid ${c.danger}`, color: c.danger, padding: "8px 16px", fontSize: 13, borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 };
}
function toggleChip(c, active, color) {
  return { flex: 1, background: active ? color + "22" : "transparent", border: `1px solid ${active ? color : c.border}`, color: active ? color : c.textMuted, padding: "8px 10px", fontSize: 12, fontWeight: 600, borderRadius: 4, cursor: "pointer" };
}

function StatPicker({ value, onChange }) {
  const { theme: c } = useTheme();
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {Object.keys({ STR: 1, INT: 1, DEX: 1, CON: 1 }).map(s => {
        const active = value === s;
        const Icon = ICONS[s];
        return (
          <button type="button" key={s} onClick={() => onChange(s)} aria-pressed={active} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", background: active ? STAT_COLOR[s] + "22" : "transparent", border: `1px solid ${active ? STAT_COLOR[s] : c.border}`, color: active ? STAT_COLOR[s] : c.textMuted, fontSize: 11, borderRadius: 4, cursor: "pointer" }}>
            <Icon size={12} /> {s}
          </button>
        );
      })}
    </div>
  );
}

function DiffPicker({ value, onChange }) {
  const { theme: c } = useTheme();
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {DIFF_ORDER.map(d => {
        const active = value === d;
        return (
          <button type="button" key={d} onClick={() => onChange(d)} aria-pressed={active} style={{ padding: "6px 10px", background: active ? c.purpleBg : "transparent", border: `1px solid ${active ? c.purple : c.border}`, color: active ? c.purpleSoft : c.textMuted, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", borderRadius: 4, cursor: "pointer" }}>
            {d.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}

export function AddTaskModal({ open, type, editItem, onClose, onSubmit, onDelete }) {
  const { theme: c } = useTheme();
  const [form, setForm] = useState(EMPTY_FORM);
  const focusRef = useFocusTrap(open);

  const isEditing = !!editItem;

  useEffect(() => {
    if (!open) return;
    if (editItem) {
      const tags = (editItem.tags || []).join(", ");
      setForm({ ...EMPTY_FORM, ...editItem, tags });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, editItem]);

  useEffect(() => {
    if (!open) return;
    function handleEsc(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  const titles = {
    habits: isEditing ? "Edit Habit" : "Create Habit",
    dailies: isEditing ? "Edit Daily" : "Create Daily",
    todos: isEditing ? "Edit To-Do" : "Create To-Do",
    rewards: isEditing ? "Edit Reward" : "Create Reward",
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    const tagsArray = form.tags.split(",").map(t => t.trim()).filter(Boolean);
    onSubmit({ ...form, tags: tagsArray });
  };

  const handleDelete = () => {
    if (editItem) onDelete(editItem.id);
  };

  return (
    <div
      ref={focusRef}
      role="dialog"
      aria-modal="true"
      aria-label={titles[type]}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16,
      }}
      onClick={onClose}
    >
      <div style={{
        background: c.purpleBg, border: `1px solid ${c.purple}`, borderRadius: 12,
        width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
      }} onClick={e => e.stopPropagation()}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${c.border}` }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: c.purpleSoft }}>{titles[type]}</h2>
          <div style={{ display: "flex", gap: 8 }}>
            {isEditing && <button onClick={handleDelete} style={dangerBtn(c)}><Trash2 size={14} /> Delete</button>}
            <button onClick={handleSubmit} style={primaryBtn(c)}>{isEditing ? "Save" : "Create"}</button>
          </div>
        </div>

        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, color: c.textMuted, marginBottom: 4, display: "block", fontFamily: "'JetBrains Mono', monospace" }}>TITLE*</label>
            <input autoFocus value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Add a title" style={inputStyle(c)} />
          </div>

          <div>
            <label style={{ fontSize: 11, color: c.textMuted, marginBottom: 4, display: "block", fontFamily: "'JetBrains Mono', monospace" }}>NOTES</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Add notes" style={{ ...inputStyle(c), minHeight: 60, resize: "vertical" }} />
          </div>

          {type === "habits" && (
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={() => setForm(f => ({ ...f, pos: !f.pos }))} aria-pressed={form.pos} style={toggleChip(c, form.pos, c.success)}>+ Positive</button>
              <button type="button" onClick={() => setForm(f => ({ ...f, neg: !f.neg }))} aria-pressed={form.neg} style={toggleChip(c, form.neg, c.danger)}>− Negative</button>
            </div>
          )}

          {type !== "rewards" && (
            <>
              <div>
                <label style={{ fontSize: 11, color: c.textMuted, marginBottom: 6, display: "block", fontFamily: "'JetBrains Mono', monospace" }}>DIFFICULTY</label>
                <DiffPicker value={form.diff} onChange={d => setForm(f => ({ ...f, diff: d }))} />
              </div>

              <div>
                <label style={{ fontSize: 11, color: c.textMuted, marginBottom: 6, display: "block", fontFamily: "'JetBrains Mono', monospace" }}>STATS</label>
                <StatPicker value={form.stat} onChange={s => setForm(f => ({ ...f, stat: s }))} />
              </div>

              <div>
                <label style={{ fontSize: 11, color: c.textMuted, marginBottom: 4, display: "block", fontFamily: "'JetBrains Mono', monospace" }}>TAGS</label>
                <div style={{ position: "relative" }}>
                  <Tag size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} color={c.textFaint} />
                  <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="Add tags..." style={{ ...inputStyle(c), paddingLeft: 32 }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, color: c.textMuted, marginBottom: 4, display: "block", fontFamily: "'JetBrains Mono', monospace" }}>RESET COUNTER</label>
                <select value={form.reset} onChange={e => setForm(f => ({ ...f, reset: e.target.value }))} style={inputStyle(c)}>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="None">None</option>
                </select>
              </div>
            </>
          )}

          {type === "rewards" && (
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: c.textMuted, marginBottom: 4, display: "block", fontFamily: "'JetBrains Mono', monospace" }}>COST</label>
                <input type="number" min={1} value={form.cost} onChange={e => setForm(f => ({ ...f, cost: parseInt(e.target.value) || 1 }))} style={inputStyle(c)} />
              </div>
              <button type="button" onClick={() => setForm(f => ({ ...f, gem: !f.gem }))} aria-pressed={form.gem} style={toggleChip(c, form.gem, c.teal)}>{form.gem ? "Gem cost" : "Gold cost"}</button>
            </div>
          )}

          {isEditing && (
            <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: 16, display: "flex", justifyContent: "flex-end" }}>
              <button onClick={onClose} style={ghostBtn(c)}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
