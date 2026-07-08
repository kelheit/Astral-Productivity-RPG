import { createContext, useContext, useMemo, useCallback } from "react";
import { THEME } from "../constants/theme";
import { useLocalStorage } from "../hooks/useLocalStorage";

export const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useLocalStorage("theme_mode", "dark");
  const theme = THEME[mode];
  const toggle = useCallback(() => setMode(m => m === "dark" ? "light" : "dark"), [setMode]);
  const value = useMemo(() => ({ mode, theme, toggle }), [mode, theme, toggle]);
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
