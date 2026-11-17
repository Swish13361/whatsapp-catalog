import { useCallback, useEffect, useState } from "react";

const MODES = ["auto", "light", "dark"];

function getStoredMode() {
  try {
    return MODES.includes(localStorage.getItem("store-theme"))
      ? localStorage.getItem("store-theme")
      : "auto";
  } catch {
    return "auto";
  }
}

export function useTheme() {
  const [mode, setModeState] = useState(getStoredMode);
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mediaQuery) return undefined;
    const update = (event) => setSystemDark(event.matches);
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  const dark = mode === "dark" || (mode === "auto" && systemDark);

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


