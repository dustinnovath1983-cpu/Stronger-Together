import { MessageCircle, Eye, Heart } from "lucide-react";

interface ProgressCardProps {
  title: string;
  subtitle: string;
  progress: number;
  icon: "communication" | "social_cues" | "empathy";
}

const iconMap = {
  communication: MessageCircle,
  social_cues: Eye,
  empathy: Heart,
};

const colorMap = {
  communication: "text-primary bg-primary/10",
  social_cues: "text-secondary bg-secondary/10", 
  empathy: "text-accent bg-accent/10",
};

const progressColorMap = {
  communication: "bg-primary",
  social_cues: "bg-secondary",
  empathy: "bg-accent",
};

export default function ProgressCard({ title, subtitle, progress, icon }: ProgressCardProps) {
  const Icon = iconMap[icon];
  const iconClasses = colorMap[icon];
  const progressColor = progressColorMap[icon];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200" data-testid={`progress-card-${icon}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconClasses}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900" data-testid={`progress-title-${icon}`}>
              {title}
            </h4>
            <p className="text-sm text-muted" data-testid={`progress-subtitle-${icon}`}>
              {subtitle}
            </p>
          </div>
        </div>
        <span className={`text-2xl font-bold ${icon === 'communication' ? 'text-primary' : icon === 'social_cues' ? 'text-secondary' : 'text-accent'}`} data-testid={`progress-percentage-${icon}`}>
          {progress}%
        </span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${progressColor}`}
          style={{ width: `${progress}%` }}
          data-testid={`progress-bar-${icon}`}
        />
      </div>
    </div>
  );
}
