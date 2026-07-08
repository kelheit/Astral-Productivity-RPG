import { useTheme } from "../../contexts/ThemeContext";

export function Bar({ value, max, color, height = 8 }) {
  const { theme: c } = useTheme();
  const pct = Math.max(0, Math.min(1, value / max)) * 100;
  const bg = c.bg.replace('#', '%23');
  const swordSvg = `url("data:image/svg+xml,%3Csvg width='6' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='3' y='0' width='1.5' height='1.5' fill='${bg}' opacity='0.4'/%3E%3Crect x='2.55' y='1.5' width='0.8' height='0.8' fill='${bg}' opacity='0.4'/%3E%3Crect x='2' y='2' width='0.6' height='0.6' fill='${bg}' opacity='0.4'/%3E%3C/svg%3E")`;
  const ditherEdgeSvg = `url("data:image/svg+xml,%3Csvg width='3' height='3' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='2' y='0' width='1' height='1' fill='${bg}' opacity='0.8'/%3E%3Crect x='0' y='1' width='1' height='1' fill='${bg}' opacity='0.8'/%3E%3C/svg%3E")`;
  return (
    <div style={{ height, background: c.borderSoft, borderRadius: height / 2, overflow: "hidden", position: "relative" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, transition: "width 0.3s steps(8, end)", position: "relative", overflow: "hidden", borderRadius: height / 2 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: swordSvg, backgroundSize: '18px 18px', pointerEvents: "none" }} />
        {pct > 0 && pct < 100 && (
          <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: '4px', backgroundImage: ditherEdgeSvg, backgroundSize: '3px 3px', pointerEvents: "none", zIndex: 2, mixBlendMode: "multiply" }} />
        )}
      </div>
    </div>
  );
}
