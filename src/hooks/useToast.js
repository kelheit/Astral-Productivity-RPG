import { useState, useCallback, useRef } from "react";

export function useToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const show = useCallback((text, type = "info") => {
    setToast({ text, type, id: Date.now() });
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), 3200);
  }, []);

  return { toast, showToast: show };
}
