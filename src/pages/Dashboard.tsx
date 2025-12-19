import { Package, Layers, AlertTriangle, TrendingDown } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EnhancedKPICard } from "@/components/dashboard/EnhancedKPICard";
import { InsightsPanel } from "@/components/dashboard/InsightsPanel";
import { InventoryTable } from "@/components/dashboard/InventoryTable";
import {
  getTotalMedicines,
  getTotalStock,
  getExpiringSoon,
  getLowStock,
} from "@/data/inventoryData";

// Mock chart data
const medicineChartData = [
  { value: 8 }, { value: 10 }, { value: 9 }, { value: 11 }, { value: 10 }, { value: 12 }, { value: 12 }
];

const stockChartData = [
  { value: 6500 }, { value: 7200 }, { value: 6800 }, { value: 7100 }, { value: 7400 }, { value: 7200 }, { value: 7630 }
];

const expiryChartData = [
  { value: 2 }, { value: 3 }, { value: 4 }, { value: 3 }, { value: 5 }, { value: 4 }, { value: 4 }
];

const lowStockChartData = [
  { value: 6 }, { value: 5 }, { value: 7 }, { value: 4 }, { value: 5 }, { value: 4 }, { value: 4 }
];

const Dashboard = () => {
  const totalMedicines = getTotalMedicines();
  const totalStock = getTotalStock();
  const expiringSoon = getExpiringSoon().length;
  const lowStock = getLowStock().length;

  return (
    <DashboardLayout title="Inventory Dashboard">
      {/* Main KPI Grid with Insights */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPI Cards - Left Section */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Top Row: Total Medicines & Total Stock */}
          <EnhancedKPICard
            title="Total Medicines"
            value={totalMedicines}
            icon={Package}
            variant="lime"
            chartType="bar"
            chartData={medicineChartData}
            subtitle="Unique items"
            delay={0}
          />
          <EnhancedKPICard
            title="Total Stock"
            value={totalStock}
            icon={Layers}
            variant="orange"
            chartType="area"
            chartData={stockChartData}
            subtitle="Units in warehouse"
            delay={100}
          />
          
          {/* Bottom Row: Expiring Soon & Low Stock */}
          <EnhancedKPICard
            title="Expiring Soon"
            value={expiringSoon}
            icon={AlertTriangle}
            variant="coral"
            chartType="line"
            chartData={expiryChartData}
            subtitle="Within 30 days"
            delay={200}
          />
          <EnhancedKPICard
            title="Low Stock"
            value={lowStock}
            icon={TrendingDown}
            variant="mint"
            chartType="donut"
            donutTotal={totalMedicines}
            subtitle="Need reorder"
            delay={300}
          />
        </div>

        {/* Insights Panel - Right Section */}
        <div className="lg:col-span-1">
          <InsightsPanel />
        </div>
      </div>

      {/* Inventory Table */}
      <InventoryTable />
    </DashboardLayout>
  );
};

export default Dashboard;
