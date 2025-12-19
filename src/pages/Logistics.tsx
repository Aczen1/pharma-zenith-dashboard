import { Truck, Package, MapPin, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { shipments as staticShipments, Shipment } from "@/data/inventoryData";
import { cn } from "@/lib/utils";
import { useInventory } from "@/hooks/useInventory";

const statusConfig = {
  "In Transit": {
    icon: Loader2,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  Delivered: {
    icon: CheckCircle,
    color: "text-kpi-green",
    bg: "bg-kpi-green/10",
    border: "border-kpi-green/20",
  },
  Pending: {
    icon: Clock,
    color: "text-kpi-yellow",
    bg: "bg-kpi-yellow/10",
    border: "border-kpi-yellow/20",
  },
  Delayed: {
    icon: AlertCircle,
    color: "text-kpi-red",
    bg: "bg-kpi-red/10",
    border: "border-kpi-red/20",
  },
};

const ShipmentCard = ({ shipment, index }: { shipment: Shipment; index: number }) => {
  const config = statusConfig[shipment.status];
  const StatusIcon = config.icon;

  return (
    <div
      className="rounded-xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:shadow-card-hover opacity-0 animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Tracking Number</p>
          <p className="font-mono text-sm font-semibold text-foreground">
            {shipment.trackingNumber}
          </p>
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
            config.bg,
            config.border,
            config.color
          )}
        >
          <StatusIcon className={cn("h-3 w-3", shipment.status === "In Transit" && "animate-spin")} />
          {shipment.status}
        </div>
      </div>

      {/* Route */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{shipment.origin}</p>
          <div className="my-1 flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <Truck className="h-3 w-3 text-muted-foreground" />
            <div className="h-px flex-1 bg-border" />
          </div>
          <p className="text-sm font-medium text-foreground">{shipment.destination}</p>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
        <div>
          <p className="text-xs text-muted-foreground">Medicines</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {shipment.medicines.slice(0, 2).map((med) => (
              <span
                key={med}
                className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
              >
                {med.split(" ")[0]}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Est. Delivery</p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {new Date(shipment.estimatedDelivery).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Quantity */}
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
        <Package className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">
          {shipment.quantity.toLocaleString()} units
        </span>
      </div>
    </div>
  );
};

const Logistics = () => {
  const { shipments, loading } = useInventory();

  if (loading) {
    return <div className="p-8 text-center">Loading Logistics Data...</div>;
  }

  const inTransit = shipments.filter((s) => s.status === "In Transit").length;
  const delivered = shipments.filter((s) => s.status === "Delivered").length;
  const pending = shipments.filter((s) => s.status === "Pending").length;
  const delayed = shipments.filter((s) => s.status === "Delayed").length;

  return (
    <DashboardLayout title="Logistics">
      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 opacity-0 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Loader2 className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{inTransit}</p>
              <p className="text-xs text-muted-foreground">In Transit</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 opacity-0 animate-fade-in" style={{ animationDelay: "50ms" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-kpi-green/10">
              <CheckCircle className="h-5 w-5 text-kpi-green" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{delivered}</p>
              <p className="text-xs text-muted-foreground">Delivered</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 opacity-0 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-kpi-yellow/10">
              <Clock className="h-5 w-5 text-kpi-yellow" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 opacity-0 animate-fade-in" style={{ animationDelay: "150ms" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-kpi-red/10">
              <AlertCircle className="h-5 w-5 text-kpi-red" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{delayed}</p>
              <p className="text-xs text-muted-foreground">Delayed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Shipments Grid */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Active Shipments</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shipments.map((shipment, index) => (
            <ShipmentCard key={shipment.id} shipment={shipment} index={index} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Logistics;
