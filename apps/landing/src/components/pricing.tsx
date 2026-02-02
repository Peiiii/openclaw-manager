import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Github } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Pricing() {
  const { t } = useTranslation();

  const plans = [
    {
      key: "opensource",
      popular: false
    },
    {
      key: "hosted",
      popular: true
    }
  ];

  return (
    <section id="pricing" className="py-24 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-ink mb-4">
            {t("pricing.title")}<span className="text-gradient">{t("pricing.titleHighlight")}</span>{t("pricing.titleSuffix")}
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            {t("pricing.subtitle")}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.key}
              className={`relative flex flex-col ${
                plan.popular 
                  ? "bg-surface border-accent/50 shadow-lg shadow-accent/10" 
                  : "bg-surface/30 border-line/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-accent text-white text-sm font-medium rounded-full">
                    {t("pricing.comingSoon")}
                  </span>
                </div>
              )}
              
              <CardHeader className="pb-4">
                <CardTitle className="text-ink text-xl">{t(`pricing.plans.${plan.key}.name`)}</CardTitle>
                <p className="text-muted text-sm mt-1">{t(`pricing.plans.${plan.key}.description`)}</p>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                <div className="mb-6">
                  <span className="text-3xl font-bold text-ink">{t(`pricing.plans.${plan.key}.price`)}</span>
                </div>
                
                <ul className="space-y-3 mb-8 flex-1">
                  {(t(`pricing.plans.${plan.key}.features`, { returnObjects: true }) as string[]).map((feature: string) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-success flex-shrink-0" />
                      <span className="text-ink/80">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant={plan.popular ? "default" : "secondary"}
                  className="w-full"
                >
                  {!plan.popular && <Github className="w-4 h-4 mr-2" />}
                  {t(`pricing.plans.${plan.key}.cta`)}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
