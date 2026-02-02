import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

const languages = [
  { code: "zh-CN", label: "中文", flag: "🇨🇳" },
  { code: "en-US", label: "English", flag: "🇺🇸" },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-muted" />
      <select
        value={currentLang}
        onChange={handleChange}
        className="bg-transparent text-sm text-muted hover:text-ink transition-colors cursor-pointer outline-none border-none"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
