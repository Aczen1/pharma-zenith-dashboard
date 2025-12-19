import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import { medicines, getExpiringSoon, getLowStock } from "@/data/inventoryData";
import { cn } from "@/lib/utils";

interface InsightItem {
  id: string;
  type: "warning" | "success" | "info" | "danger";
  title: string;
  description: string;
  trend?: "up" | "down";
  value?: string;
}

const getInsights = (): InsightItem[] => {
  const expiring = getExpiringSoon();
  const lowStock = getLowStock();
  const totalStock = medicines.reduce((sum, m) => sum + m.currentStock, 0);
  const avgStock = Math.round(totalStock / medicines.length);

  return [
    {
      id: "1",
      type: "success",
      title: "Stock Performance",
      description: `Average ${avgStock} units per medicine`,
      trend: "up",
      value: "+12%",
    },
    {
      id: "2",
      type: expiring.length > 2 ? "danger" : "warning",
      title: "Expiry Alert",
      description: `${expiring.length} medicines expiring soon`,
      value: expiring.length > 0 ? expiring[0].name.split(" ")[0] : "None",
    },
    {
      id: "3",
      type: lowStock.length > 3 ? "danger" : "info",
      title: "Reorder Needed",
      description: `${lowStock.length} items below threshold`,
      trend: lowStock.length > 3 ? "down" : undefined,
      value: lowStock.length > 0 ? `-${lowStock.length}` : "OK",
    },
    {
      id: "4",
      type: "success",
      title: "Top Category",
      description: "Pain Relief leading sales",
      trend: "up",
      value: "34%",
    },
  ];
};

const typeStyles = {
  success: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: "text-emerald-600",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    icon: "text-amber-600",
    iconBg: "bg-amber-100 dark:bg-amber-900/50",
  },
  danger: {
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    icon: "text-red-600",
    iconBg: "bg-red-100 dark:bg-red-900/50",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    icon: "text-blue-600",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
  },
};

const getIcon = (type: InsightItem["type"]) => {
  switch (type) {
    case "success":
      return CheckCircle;
    case "warning":
      return AlertCircle;
    case "danger":
      return AlertCircle;
    case "info":
      return TrendingUp;
  }
};

export const InsightsPanel = () => {
  const insights = getInsights();

  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Medicine Insights</h3>
        <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
          View all <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => {
          const IconComponent = getIcon(insight.type);
          const styles = typeStyles[insight.type];

          return (
            <div
              key={insight.id}
              className={cn(
                "p-3 rounded-xl border transition-all duration-300 hover:shadow-md cursor-pointer opacity-0 animate-fade-in",
                styles.bg,
                styles.border
              )}
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg", styles.iconBg)}>
                  <IconComponent className={cn("w-4 h-4", styles.icon)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{insight.title}</p>
                    {insight.value && (
                      <div className="flex items-center gap-1">
                        {insight.trend === "up" && <TrendingUp className="w-3 h-3 text-emerald-600" />}
                        {insight.trend === "down" && <TrendingDown className="w-3 h-3 text-red-600" />}
                        <span className={cn(
                          "text-xs font-semibold",
                          insight.trend === "up" ? "text-emerald-600" : 
                          insight.trend === "down" ? "text-red-600" : "text-muted-foreground"
                        )}>
                          {insight.value}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
