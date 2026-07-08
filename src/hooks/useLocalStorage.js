import { useState, useCallback } from "react";
import { loadState, saveState } from "../utils/storage";

export function useLocalStorage(key, fallback) {
  const [value, setValue] = useState(() => loadState(key, fallback));

  const set = useCallback((next) => {
    setValue(prev => {
      const resolved = typeof next === "function" ? next(prev) : next;
      saveState(key, resolved);
      return resolved;
    });
  }, [key]);

  return [value, set];
}
