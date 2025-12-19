import { ShoppingCart, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const Orders = () => {
  return (
    <DashboardLayout title="Orders">
      <div className="flex flex-col items-center justify-center py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary mb-4">
          <ShoppingCart className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Orders Coming Soon</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Track and manage all your pharmaceutical orders in one place. This feature is under development.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default Orders;
