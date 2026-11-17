import { Icon } from "../ui/Icon.jsx";

export function ThemeToggle({ mode, setMode, t, className }) {
  const icons = { auto: "sunMoon", light: "sun", dark: "moon" };
  return (
    <button
      type="button"
      className={`flex shrink-0 items-center justify-center w-9 h-9 rounded-lg text-text hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className || ""}`}
      onClick={setMode}
      title={t("themeMode")}
      aria-label={t("themeLabel", { mode: mode.charAt(0).toUpperCase() + mode.slice(1) })}
    >
      <Icon name={icons[mode]} size={14} />
    </button>
  );
}


