import { useCallback, useEffect, useState } from "react";

const MODES = ["light", "dark"];

function getStoredMode() {
  try {
    return MODES.includes(localStorage.getItem("store-theme"))
      ? localStorage.getItem("store-theme")
      : "light";
  } catch {
    return "light";
  }
}

export function useTheme() {
  const [mode, setModeState] = useState(getStoredMode);

  const dark = mode === "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const setMode = useCallback((nextMode) => {
    setModeState(nextMode);
    try {
      localStorage.setItem("store-theme", nextMode);
    } catch {
      // Theme selection still works when storage is unavailable.
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const next = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
    setMode(next);
  }, [mode, setMode]);

  return { mode, setMode, dark, toggleTheme };
}

