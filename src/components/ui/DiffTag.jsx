import { useTheme } from "../../contexts/ThemeContext";
import { DIFF_ORDER } from "../../constants/gameData";

export function DiffTag({ diff }) {
  const { theme: c } = useTheme();
  const colorMap = { Trivial: c.textMuted, Easy: c.success, Medium: c.warning, Hard: c.danger };
  const dots = DIFF_ORDER.indexOf(diff) + 1;
  const color = colorMap[diff];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color, letterSpacing: 0.5 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} style={{ width: 5, height: 5, background: i < dots ? color : "transparent", border: `1px solid ${color}`, opacity: i < dots ? 1 : 0.35 }} />
      ))}
      <span style={{ marginLeft: 3 }}>{diff.toUpperCase()}</span>
    </span>
  );
}
