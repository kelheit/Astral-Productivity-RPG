import { useId } from "react";
import { useTheme } from "../../contexts/ThemeContext";

export function ActivityRing({ pct, color, size = 92, stroke = 9, track = "rgba(0, 0, 0, 0.13)", children }) {
  const { theme: c } = useTheme();
  const uid = useId();
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(1, pct));
  const patternId = `pat-${uid}-${color.replace('#', '')}`;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <pattern id={patternId} width="15" height="15" patternUnits="userSpaceOnUse">
            <rect width="15" height="15" fill={color} />
            <rect x="3" y="0" width="3" height="3" fill={c.bg} opacity="0.5" />
            <rect x="1" y="3" width="2" height="2" fill={c.bg} opacity="0.5" />
          </pattern>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" strokeLinecap="round" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={`url(#${patternId})`} strokeWidth={stroke} fill="none"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}
