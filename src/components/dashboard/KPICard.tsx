import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  variant: "green" | "orange" | "red" | "yellow";
  delay?: number;
}

const variantClasses = {
  yellow: "kpi-card-green",
  orange: "kpi-card-orange",
  red: "kpi-card-red",
  green: "kpi-card-red",
};

export const KPICard = ({ title, value, icon: Icon, variant, delay = 0 }: KPICardProps) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl p-6 shadow-kpi transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1",
        variantClasses[variant],
        "opacity-0 animate-fade-in"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value.toLocaleString()}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/10" />
    </div>
  );
};
