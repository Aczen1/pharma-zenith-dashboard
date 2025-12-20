import { Pill, Beaker, AlertTriangle, TrendingDown, Download, FileText, FileSpreadsheet } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EnhancedKPICard } from "@/components/dashboard/EnhancedKPICard";
import { InsightsPanel } from "@/components/dashboard/InsightsPanel";
import { InventoryTable } from "@/components/dashboard/InventoryTable";
import { useInventory } from "@/hooks/useInventory";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToPDF, exportToExcel } from "@/lib/exportUtils";
import { toast } from "sonner";
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
  const { medicines, loading } = useInventory();

  const handleExportPDF = () => {
    exportToPDF(medicines);
    toast.success('PDF report downloaded successfully!');
  };

  const handleExportExcel = () => {
    exportToExcel(medicines);
    toast.success('Excel report downloaded successfully!');
  };

  if (loading) {
    return <div className="p-8 text-center">Loading Inventory Data...</div>;
  }

  const totalMedicines = getTotalMedicines(medicines);
  const totalStock = getTotalStock(medicines);
  const expiringSoon = getExpiringSoon(medicines).length;
  const lowStock = getLowStock(medicines).length;

  return (
    <DashboardLayout title="Inventory Dashboard">
      {/* Export Actions */}
      <div className="flex justify-end mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 glass-card">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-card">
            <DropdownMenuItem onClick={handleExportPDF} className="gap-2 cursor-pointer">
              <FileText className="w-4 h-4 text-red-500" />
              Download as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportExcel} className="gap-2 cursor-pointer">
              <FileSpreadsheet className="w-4 h-4 text-green-500" />
              Download as Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main KPI Grid with Insights */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPI Cards - Left Section */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <EnhancedKPICard
            title="Total Medicines"
            value={totalMedicines}
            icon={Pill}
            variant="lime"
            chartType="bar"
            chartData={medicineChartData}
            subtitle="Unique items"
            delay={0}
            decorativeIcon={Pill}
          />
          <EnhancedKPICard
            title="Total Stock"
            value={totalStock}
            icon={Beaker}
            variant="orange"
            chartType="area"
            chartData={stockChartData}
            subtitle="Units in warehouse"
            delay={100}
            decorativeIcon={Beaker}
          />

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
