import { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";

function formatTime() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate() {
  const d = new Date();
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 1024);
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return mobile;
}

export function LiveClock() {
  const { theme: c } = useTheme();
  const isMobile = useIsMobile();
  const [time, setTime] = useState(formatTime);
  const [date, setDate] = useState(formatDate);

  useEffect(() => {
    const id = setInterval(() => {
      setTime(formatTime());
      setDate(formatDate());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      position: "fixed", zIndex: 70,
      display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0,
      pointerEvents: "none",
      userSelect: "none",
      ...(isMobile
        ? { top: 20, right: 25 }
        : { top: 13, right: 30 }
      ),
    }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: c.text, letterSpacing: 0.5, fontWeight: 500 }}>
        {time}
      </span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: c.textFaint, letterSpacing: 0.3 }}>
        {date}
      </span>
    </div>
  );
}
