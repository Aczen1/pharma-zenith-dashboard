import { Package, Layers, AlertTriangle, TrendingDown } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { InventoryTable } from "@/components/dashboard/InventoryTable";
import {
  getTotalMedicines,
  getTotalStock,
  getExpiringSoon,
  getLowStock,
} from "@/data/inventoryData";

const Dashboard = () => {
  const totalMedicines = getTotalMedicines();
  const totalStock = getTotalStock();
  const expiringSoon = getExpiringSoon().length;
  const lowStock = getLowStock().length;

  return (
    <DashboardLayout title="Inventory Dashboard">
      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Medicines"
          value={totalMedicines}
          icon={Package}
          variant="yellow"
          delay={0}
        />
        <KPICard
          title="Total Stock"
          value={totalStock}
          icon={Layers}
          variant="orange"
          delay={100}
        />
        <KPICard
          title="Expiring Soon"
          value={expiringSoon}
          icon={AlertTriangle}
          variant="red"
          delay={200}
        />
        <KPICard
          title="Low Stock"
          value={lowStock}
          icon={TrendingDown}
          variant="green"
          delay={300}
        />
      </div>

      {/* Inventory Table */}
      <InventoryTable />
    </DashboardLayout>
  );
};

export default Dashboard;
