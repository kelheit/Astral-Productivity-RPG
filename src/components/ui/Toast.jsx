import { useTheme } from "../../contexts/ThemeContext";

export function Toast({ toast }) {
  const { theme: c } = useTheme();
  if (!toast) return null;
  const colorMap = { success: c.success, damage: c.danger, level: c.gold, info: c.teal, warning: c.warning };
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: "fixed", bottom: 100, left: "50%", transform: "translateX(-50%)",
        background: c.raise, border: `1px solid ${colorMap[toast.type] || c.border}`,
        color: c.text, padding: "10px 18px", fontSize: 13, fontFamily: "Inter, sans-serif",
        zIndex: 100, maxWidth: "90%", textAlign: "center",
        clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
      }}
    >
      {toast.text}
    </div>
  );
}
