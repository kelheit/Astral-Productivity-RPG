import { useTheme } from "../../contexts/ThemeContext";

export function UndoToast({ data, onUndo }) {
  const { theme: c } = useTheme();
  if (!data) return null;
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: "fixed", bottom: 100, left: "50%", transform: "translateX(-50%)",
        background: c.raise, border: `1px solid ${c.warning}`,
        color: c.text, padding: "12px 18px", fontSize: 13, fontFamily: "Inter, sans-serif",
        zIndex: 100, maxWidth: "90%", display: "flex", alignItems: "center", gap: 16,
        borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
      }}
    >
      <span>Task unchecked. Points reverted.</span>
      <button
        onClick={onUndo}
        aria-label="Undo uncheck"
        style={{ background: c.warning, color: c.bg, border: "none", padding: "6px 12px", borderRadius: 4, fontWeight: 700, cursor: "pointer" }}
      >
        Undo ({data.countdown}s)
      </button>
    </div>
  );
}
