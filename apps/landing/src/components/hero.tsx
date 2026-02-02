import { Button } from "@/components/ui/button";
import { ArrowRight, Github, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function Hero() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const installCommand = "npm i -g openclaw-manager\nopenclaw-manager start";

  const handleCopy = () => {
    navigator.clipboard.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-2/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px"
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-slide-up">
          <span className="text-ink">{t("hero.title1")}</span>
          <br />
          <span className="text-gradient">{t("hero.title2")}</span>
          <span className="text-ink">{t("hero.title3")}</span>
        </h1>

        {/* Description */}
        <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          {t("hero.description")}
        </p>

        {/* Install Command - Prominent */}
        <div className="max-w-xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="rounded-xl bg-surface border border-line overflow-hidden shadow-lg shadow-black/20">
            <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-surface/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-danger/80" />
                <div className="w-3 h-3 rounded-full bg-warning/80" />
                <div className="w-3 h-3 rounded-full bg-success/80" />
              </div>
              <span className="text-xs text-muted font-mono">{t("hero.installTitle")}</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-muted hover:text-ink transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    {t("hero.copied")}
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    {t("hero.copy")}
                  </>
                )}
              </button>
            </div>
            <div className="p-4 font-mono text-sm text-left space-y-1">
              <div><span className="text-muted">$</span> <span className="text-ink">npm i -g openclaw-manager</span></div>
              <div><span className="text-muted">$</span> <span className="text-ink">openclaw-manager start</span></div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex items-center justify-center animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <a 
            href="https://github.com/Peiiii/openclaw-manager"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" className="group">
              <Github className="w-5 h-5 mr-2" />
              {t("hero.github")}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </a>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <a
        href="#features"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center text-muted hover:text-ink hover:border-accent transition-colors z-20"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </a>
    </section>
  );
}
