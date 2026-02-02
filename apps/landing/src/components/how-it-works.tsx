import { Terminal, Settings, UserCheck, Radio } from "lucide-react";
import { useTranslation } from "react-i18next";

export function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      icon: Terminal,
      title: t("howItWorks.steps.install.title"),
      description: t("howItWorks.steps.install.description")
    },
    {
      icon: Settings,
      title: t("howItWorks.steps.configure.title"),
      description: t("howItWorks.steps.configure.description")
    },
    {
      icon: UserCheck,
      title: t("howItWorks.steps.pairing.title"),
      description: t("howItWorks.steps.pairing.description")
    },
    {
      icon: Radio,
      title: t("howItWorks.steps.start.title"),
      description: t("howItWorks.steps.start.description")
    }
  ];

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-ink mb-4">
            <span className="text-gradient">{t("howItWorks.title")}</span>{t("howItWorks.titleSuffix")}
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            {t("howItWorks.subtitle")}
          </p>
        </div>

        {/* Steps - Horizontal Layout with connecting line */}
        <div className="relative">
          {/* Connecting Line - Desktop only */}
          <div className="hidden lg:block absolute top-14 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="relative group text-center"
              >
                {/* Icon Container */}
                <div className="relative inline-flex mb-6">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Icon box */}
                  <div className="relative w-16 h-16 rounded-2xl bg-surface border border-line flex items-center justify-center group-hover:border-accent/50 group-hover:bg-accent/5 transition-all duration-300">
                    <step.icon className="w-7 h-7 text-accent" />
                  </div>

                  {/* Step number badge */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-ink mb-2">
                  {step.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
