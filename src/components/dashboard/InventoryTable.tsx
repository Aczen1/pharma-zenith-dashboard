import { useState, useMemo } from "react";
import { Search, Filter, ArrowUpDown, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { medicines as staticMedicines, getUniqueCategories, getMedicineStatus, Medicine } from "@/data/inventoryData";
import { cn } from "@/lib/utils";
import { useInventory } from "@/hooks/useInventory";

type SortField = "name" | "currentStock" | "expiryDate";
type SortOrder = "asc" | "desc";

const statusStyles = {
  Healthy: "bg-kpi-green/10 text-kpi-green border-kpi-green/20",
  Low: "bg-kpi-orange/10 text-kpi-orange border-kpi-orange/20",
  Expiring: "bg-kpi-red/10 text-kpi-red border-kpi-red/20",
};

export const InventoryTable = () => {
  const { medicines } = useInventory(); // Fetch real data
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const categories = getUniqueCategories(medicines);

  const filteredAndSortedMedicines = useMemo(() => {
    let result = [...medicines];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.batchNumber.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter((m) => m.category === selectedCategory);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "currentStock":
          comparison = a.currentStock - b.currentStock;
          break;
        case "expiryDate":
          comparison = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [searchQuery, selectedCategory, sortField, sortOrder, medicines]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-card animate-fade-in" style={{ animationDelay: "300ms" }}>
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-foreground">Medicine Inventory</h2>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 pl-9"
            />
          </div>

          {/* Category Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                {selectedCategory || "All Categories"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedCategory(null)}>
                All Categories
              </DropdownMenuItem>
              {categories
                .filter(category => category !== "General")
                .map((category) => (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-1 font-semibold hover:text-foreground"
                >
                  Medicine Name
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Batch Number</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("currentStock")}
                  className="flex items-center gap-1 font-semibold hover:text-foreground"
                >
                  Current Stock
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("expiryDate")}
                  className="flex items-center gap-1 font-semibold hover:text-foreground"
                >
                  Expiry Date
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedMedicines.map((medicine, index) => {
              const status = getMedicineStatus(medicine);
              return (
                <TableRow
                  key={medicine.id}
                  className="transition-colors hover:bg-muted/50"
                  style={{ animationDelay: `${400 + index * 50}ms` }}
                >
                  <TableCell className="font-medium">{medicine.name}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">
                    {medicine.batchNumber}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                      {medicine.category}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {medicine.currentStock.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(medicine.expiryDate)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("font-medium", statusStyles[status])}
                    >
                      {status}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredAndSortedMedicines.length} of {medicines.length} medicines
        </p>
      </div>
    </div>
  );
};
