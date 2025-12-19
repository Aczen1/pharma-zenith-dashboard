import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MiniBarChart } from "./MiniBarChart";
import { MiniLineChart } from "./MiniLineChart";
import { MiniAreaChart } from "./MiniAreaChart";
import { MiniDonutChart } from "./MiniDonutChart";

type ChartType = "bar" | "line" | "area" | "donut";

interface EnhancedKPICardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  variant: "lime" | "orange" | "coral" | "mint";
  chartType: ChartType;
  chartData?: { value: number }[];
  donutTotal?: number;
  delay?: number;
  subtitle?: string;
}

const variantStyles = {
  lime: {
    bg: "bg-gradient-to-br from-[#E8F5A3] via-[#D4E157] to-[#C6D93A]",
    text: "text-[#2D3B12]",
    subtext: "text-[#4A5D2B]",
    chartColor: "#4A5D2B",
    iconBg: "bg-[#C6D93A]/40",
  },
  orange: {
    bg: "bg-gradient-to-br from-[#FFB347] via-[#FF9B3D] to-[#F58025]",
    text: "text-[#4A2800]",
    subtext: "text-[#6B3D0A]",
    chartColor: "#4A2800",
    iconBg: "bg-[#F58025]/30",
  },
  coral: {
    bg: "bg-gradient-to-br from-[#FF8A80] via-[#FF6B5B] to-[#E74C3C]",
    text: "text-white",
    subtext: "text-white/80",
    chartColor: "#FFFFFF",
    iconBg: "bg-white/20",
  },
  mint: {
    bg: "bg-gradient-to-br from-[#A8E6CF] via-[#7DD8B5] to-[#56C596]",
    text: "text-[#1A4D36]",
    subtext: "text-[#2D6B4F]",
    chartColor: "#1A4D36",
    iconBg: "bg-[#56C596]/30",
  },
};

export const EnhancedKPICard = ({
  title,
  value,
  icon: Icon,
  variant,
  chartType,
  chartData = [],
  donutTotal = 100,
  delay = 0,
  subtitle
}: EnhancedKPICardProps) => {
  const styles = variantStyles[variant];
  const numValue = typeof value === "string" ? parseInt(value) : value;

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return <MiniBarChart data={chartData} color={styles.chartColor} />;
      case "line":
        return <MiniLineChart data={chartData} color={styles.chartColor} />;
      case "area":
        return <MiniAreaChart data={chartData} color={styles.chartColor} gradientId={`gradient-${variant}`} />;
      case "donut":
        return <MiniDonutChart value={numValue} total={donutTotal} color={styles.chartColor} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl p-3 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        styles.bg,
        "opacity-0 animate-fade-in"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg", styles.iconBg)}>
          <Icon className={cn("h-4 w-4", styles.text)} />
        </div>
        <span className={cn("text-[10px] font-semibold uppercase tracking-wider", styles.subtext)}>
          {subtitle || "Current"}
        </span>
      </div>

      {/* Value */}
      <div className="mb-2">
        <p className={cn("text-2xl font-bold tracking-tight", styles.text)}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className={cn("text-xs font-medium mt-0.5", styles.subtext)}>{title}</p>
      </div>

      {/* Chart */}
      <div className="mt-1 h-8">
        {renderChart()}
      </div>

      {/* Decorative elements */}
      <div className={cn("absolute -top-6 -right-6 w-16 h-16 rounded-full opacity-20",
        variant === "coral" ? "bg-white" : "bg-black"
      )} />
    </div>
  );
};
