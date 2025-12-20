import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useInventory } from "@/hooks/useInventory";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, AlertTriangle, TrendingUp, CheckCircle, Clock, Check, ChevronsUpDown } from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

const SmartShelfPage = () => {
    const { medicines, forecast, loading } = useInventory();
    const [open, setOpen] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState<string | null>(null);
    const [insight, setInsight] = useState<string | null>(null);
    const [insightLoading, setInsightLoading] = useState(false);

    // Get unique medicine names for the combobox
    const uniqueMedicines = useMemo(() => {
        const names = Array.from(new Set(medicines.map(m => m.name)));
        return names.sort();
    }, [medicines]);

    // Get batches for the selected medicine (FEFO)
    const selectedBatches = useMemo(() => {
        if (!selectedMedicine) return [];
        return medicines
            .filter(m => m.name === selectedMedicine)
            .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
    }, [medicines, selectedMedicine]);

    // Prepare Chart Data
    const chartData = useMemo(() => {
        if (!selectedMedicine || forecast.length === 0) return [];
        const drugForecasts = forecast.filter(f => f.Drug_Name?.toLowerCase() === selectedMedicine.toLowerCase());
        return drugForecasts
            .map(f => ({
                date: f.Date,
                predicted: parseFloat(f.Predicted_Qty) || 0
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [forecast, selectedMedicine]);

    // Fetch Insight when medicine changes
    const fetchInsight = async (name: string, batches: any[], chartData: any[]) => {
        setInsightLoading(true);
        setInsight(null);
        try {
            const stock = batches.reduce((acc: number, b: any) => acc + b.currentStock, 0);
            const expiry = batches.length > 0 ? batches[0].expiryDate : "N/A";
            const predicted = chartData.reduce((acc: number, c: any) => acc + c.predicted, 0) || 0;

            const res = await fetch("http://localhost:5000/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    stock,
                    expiry,
                    forecast: Math.round(predicted),
                    batches: batches.map(b => ({ batch: b.batchNumber, stock: b.currentStock, expiry: b.expiryDate }))
                })
            });
            const data = await res.json();
            if (data.insight) setInsight(data.insight);
        } catch (e) {
            console.error(e);
            setInsight("Failed to load AI insight.");
        } finally {
            setInsightLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading Smart Shelf...</div>;
    }

    return (
        <DashboardLayout title="Smart Shelf & Alerts">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
                {/* Left Col: Medicine Selector */}
                <Card className="lg:col-span-1 flex flex-col h-full border-border bg-card">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Search className="w-5 h-5 text-blue-500" /> Select Medicine
                        </CardTitle>
                        <CardDescription>Choose a medicine to view details</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full justify-between"
                                >
                                    {selectedMedicine
                                        ? selectedMedicine
                                        : "Select medicine..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search medicine..." />
                                    <CommandList>
                                        <CommandEmpty>No medicine found.</CommandEmpty>
                                        <CommandGroup>
                                            {uniqueMedicines.map((medicineName) => (
                                                <CommandItem
                                                    key={medicineName}
                                                    value={medicineName}
                                                    onSelect={(currentValue) => {
                                                        const newName = currentValue === selectedMedicine ? null : currentValue;
                                                        setSelectedMedicine(newName);
                                                        setOpen(false);
                                                        if (newName) {
                                                            // Calculate derived data for insight
                                                            // We need to re-derive logic here or use useEffect. 
                                                            // For simplicity, let's trigger it via useEffect on selectedMedicine changes.
                                                        }
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedMedicine === medicineName ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {medicineName}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        {/* Trigger Insight Fetch on Selection Change */}
                        {/* We use a hidden component or logic here. Actually better to use useEffect. */}

                        {/* Selected Medicine Details Preview */}
                        {selectedMedicine && selectedBatches.length > 0 && (
                            <div className="mt-6 space-y-4 animate-fade-in">
                                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-800">
                                    <h4 className="font-semibold text-emerald-800 dark:text-emerald-400 mb-2 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" /> Pick This Batch
                                    </h4>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Batch:</span>
                                            <span className="font-mono font-medium">{selectedBatches[0].batchNumber}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Expiry:</span>
                                            <span className="font-bold text-emerald-700 dark:text-emerald-400">{selectedBatches[0].expiryDate}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Stock:</span>
                                            <span>{selectedBatches[0].currentStock}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm text-muted-foreground">Other Batches</h4>
                                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                        {selectedBatches.slice(1).map(batch => (
                                            <div key={batch.id} className="text-sm p-2 rounded border border-border bg-muted/30 flex justify-between">
                                                <span className="font-mono text-muted-foreground">{batch.batchNumber}</span>
                                                <span>Exp: {batch.expiryDate}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Right Col: Forecast & Alerts (Constant - Non Scrolling) */}
                <div className="lg:col-span-3 h-full flex flex-col gap-6 overflow-hidden">
                    {/* Graph Section */}
                    <Card className="flex-1 flex flex-col overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-500" />
                                Demand Forecast
                                {selectedMedicine && <span className="text-muted-foreground font-normal text-sm ml-2">- {selectedMedicine}</span>}
                            </CardTitle>
                            <CardDescription>30-Day Predicted Demand vs. Current Stock</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 min-h-0">
                            {selectedMedicine ? (
                                chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData} margin={{ top: 10, right: 30, bottom: 0, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                                            <XAxis
                                                dataKey="date"
                                                stroke="hsl(var(--muted-foreground))"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(value) => {
                                                    try {
                                                        const date = new Date(value);
                                                        if (isNaN(date.getTime())) return value;
                                                        return format(date, "MMM d");
                                                    } catch (e) {
                                                        return value;
                                                    }
                                                }}
                                            />
                                            <YAxis
                                                stroke="hsl(var(--muted-foreground))"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <RechartsTooltip
                                                contentStyle={{
                                                    backgroundColor: "hsl(var(--popover))",
                                                    borderColor: "hsl(var(--border))",
                                                    borderRadius: "8px",
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="predicted"
                                                stroke="hsl(var(--primary))"
                                                strokeWidth={3}
                                                dot={false}
                                                activeDot={{ r: 6 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-muted-foreground">
                                        No forecast data available for this medicine.
                                    </div>
                                )
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center text-muted-foreground gap-2">
                                    <Search className="w-8 h-8 opacity-20" />
                                    <p>Select a medicine on the left to view its forecast</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Alerts/Insights Section */}
                    {selectedMedicine && (
                        <Card className="shrink-0 h-[140px] border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
                            <CardHeader className="py-3">
                                <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-500">
                                    <AlertTriangle className="w-5 h-5" /> Gemini AI Insight
                                    {insightLoading && <span className="ml-2 text-xs font-normal text-muted-foreground animate-pulse">Analyzing...</span>}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="py-0 pb-3">
                                <div className="text-sm text-foreground/90 leading-relaxed">
                                    {insightLoading ? (
                                        "Gathering improved insights..."
                                    ) : insight ? (
                                        insight
                                    ) : (
                                        // Fallback manual checks + Button to retry
                                        <div className="flex justify-between items-center">
                                            <span>
                                                Displaying forecast and inventory data for <strong>{selectedMedicine}</strong>.
                                                {selectedBatches.length > 0 && selectedBatches[0].currentStock < 50 && (
                                                    <span className="text-amber-600 ml-1 font-medium">Stock is running low!</span>
                                                )}
                                            </span>
                                            <Button variant="ghost" size="sm" onClick={() => fetchInsight(selectedMedicine, selectedBatches, chartData)}>
                                                Generate AI Insight
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Trigger Effect */}
                    {/* We use a hidden component logic workaround or just useEffect. Re-rendering with unique key is messy. */}
                    {/* Let's use a side-effect component or simple ref. Actually, just adding a useEffect below is best. */}
                    <InsightTrigger
                        selectedMedicine={selectedMedicine}
                        selectedBatches={selectedBatches}
                        chartData={chartData}
                        onFetch={fetchInsight}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
};

// Helper component to trigger effect cleanly
const InsightTrigger = ({ selectedMedicine, selectedBatches, chartData, onFetch }: any) => {
    useMemo(() => {
        if (selectedMedicine) {
            // Debounce slightly or just call
            const timeout = setTimeout(() => {
                onFetch(selectedMedicine, selectedBatches, chartData);
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [selectedMedicine]); // Only trigger on medicine switch, batches/chartData are derived
    return null;
}

export default SmartShelfPage;
