import { Bot } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-line/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-ink">OpenClaw Manager</span>
          </div>

          {/* Copyright */}
          <p className="text-muted text-sm">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
