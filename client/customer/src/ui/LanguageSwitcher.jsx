import { useLanguage } from "../useLanguage.js";
import { Select } from "../ui/Field.jsx";

export function LanguageSwitcher({ className }) {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <span className="sr-only">{t("language")}</span>
      <Select
        size="sm"
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        aria-label={t("language")}
        className="min-w-[70px] text-xs"
      >
        <option value="en">English</option>
        <option value="zh-CN">中文（简体）</option>
      </Select>
    </div>
  );
}




