import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Bot, 
  Shield, 
  Zap, 
  Lock,
  MessageSquare,
  Terminal,
  Cpu,
  Globe
} from "lucide-react";
import { useTranslation } from "react-i18next";

export function Features() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Lock,
      title: t("features.items.localFirst.title"),
      description: t("features.items.localFirst.description")
    },
    {
      icon: MessageSquare,
      title: t("features.items.multiChannel.title"),
      description: t("features.items.multiChannel.description")
    },
    {
      icon: Bot,
      title: t("features.items.aiAssistant.title"),
      description: t("features.items.aiAssistant.description")
    },
    {
      icon: Shield,
      title: t("features.items.secure.title"),
      description: t("features.items.secure.description")
    },
    {
      icon: Terminal,
      title: t("features.items.oneClickDeploy.title"),
      description: t("features.items.oneClickDeploy.description")
    },
    {
      icon: Cpu,
      title: t("features.items.modelCompatible.title"),
      description: t("features.items.modelCompatible.description")
    },
    {
      icon: Zap,
      title: t("features.items.realtime.title"),
      description: t("features.items.realtime.description")
    },
    {
      icon: Globe,
      title: t("features.items.openSource.title"),
      description: t("features.items.openSource.description")
    }
  ];

  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-ink mb-4">
            {t("features.title")} <span className="text-gradient">OpenClaw</span>
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            {t("features.subtitle")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title}
              className="group bg-surface/30 border-line/50 hover:bg-surface/50 hover:border-accent/30 transition-all duration-300"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-ink text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
