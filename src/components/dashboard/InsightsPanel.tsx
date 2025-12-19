import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import { getExpiringSoon, getLowStock } from "@/data/inventoryData";
import { useInventory } from "@/hooks/useInventory";

import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

interface InsightItem {
  id: string;
  type: "warning" | "success" | "info" | "danger";
  title: string;
  description: string;
  trend?: "up" | "down";
  value?: string;
  image: string;
}

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
  const { medicines, loading } = useInventory(); // Fetch data

  // Logic moved inside component to access medicines state
  const insights = (() => {
    if (loading || medicines.length === 0) return [];

    const expiring = getExpiringSoon(medicines);
    const lowStock = getLowStock(medicines);
    const totalStock = medicines.reduce((sum, m) => sum + m.currentStock, 0);
    const avgStock = medicines.length ? Math.round(totalStock / medicines.length) : 0;

    return [
      {
        id: "1",
        type: "success" as const, // Type assertion for stricter string literal types if needed
        title: "Stock Performance",
        description: `Average ${avgStock} units per medicine`,
        trend: "up" as const,
        value: "+12%",
        image: "/images/insights/stock-performance.png",
      },
      {
        id: "2",
        type: expiring.length > 2 ? "danger" as const : "warning" as const,
        title: "Expiry Alert",
        description: `${expiring.length} medicines expiring soon`,
        value: expiring.length > 0 ? expiring[0].name.split(" ")[0] : "None",
        image: "/images/insights/expiry-alert.png",
      },
      {
        id: "3",
        type: lowStock.length > 3 ? "danger" as const : "info" as const,
        title: "Reorder Needed",
        description: `${lowStock.length} items below threshold`,
        trend: lowStock.length > 3 ? "down" as const : undefined,
        value: lowStock.length > 0 ? `-${lowStock.length}` : "OK",
        image: "/images/insights/low-stock.png",
      },
      {
        id: "4",
        type: "success" as const,
        title: "Top Category",
        description: "Pain Relief leading sales",
        trend: "up" as const,
        value: "34%",
        image: "/images/insights/top-category.png",
      },
    ];
  })();
  const plugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 h-full flex flex-col justify-center">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-foreground">Medicine Insights</h3>
        <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
          View all <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {insights.map((insight, index) => {
            const IconComponent = getIcon(insight.type);
            const styles = typeStyles[insight.type];

            return (
              <CarouselItem key={insight.id}>
                <div
                  className={cn(
                    "rounded-xl border transition-all duration-300 hover:shadow-md cursor-pointer h-full overflow-hidden group relative aspect-square",
                    styles.bg,
                    styles.border
                  )}
                >
                  {/* Background Image with Overlay */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src={insight.image}
                      alt={insight.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className={cn("absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent", styles.bg)}></div>
                  </div>

                  <div className="relative z-10 p-4 h-full flex flex-col justify-end">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className={cn("p-2 rounded-lg shrink-0 backdrop-blur-md bg-background/60", styles.icon, styles.border, "border shadow-sm")}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        {insight.value && (
                          <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
                            {insight.trend === "up" && <TrendingUp className="w-3 h-3 text-emerald-600" />}
                            {insight.trend === "down" && <TrendingDown className="w-3 h-3 text-red-600" />}
                            <span className={cn(
                              "text-xs font-bold",
                              insight.trend === "up" ? "text-emerald-600" :
                                insight.trend === "down" ? "text-red-600" : "text-foreground"
                            )}>
                              {insight.value}
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-lg font-bold text-foreground drop-shadow-sm leading-tight mb-1">{insight.title}</p>
                        <p className="text-sm text-foreground/80 font-medium line-clamp-2 leading-snug">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <div className="flex justify-end gap-2 mt-4">
          <CarouselPrevious className="static translate-y-0 h-8 w-8" />
          <CarouselNext className="static translate-y-0 h-8 w-8" />
        </div>
      </Carousel>
    </div>
  );
};
