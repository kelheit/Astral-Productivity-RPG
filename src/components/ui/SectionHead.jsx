import { useTheme } from "../../contexts/ThemeContext";

export function SectionHead({ title, sub, big }) {
  const { theme: c } = useTheme();
  return (
    <div style={{ marginBottom: 2 }}>
      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: big ? 15 : 13, marginBottom: 5 }}>{title}</div>
      <div style={{ fontSize: big ? 13 : 12, color: c.textMuted }}>{sub}</div>
    </div>
  );
}
