import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, Plus, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";
import Papa from "papaparse";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const DataUpdatePage = () => {
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();

    // Manual Entry State
    const [entryType, setEntryType] = useState("Sales");
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        drugName: "",
        batchNumber: "",
        quantity: "",
        extra: "" // Price or Supplier depending on type
    });

    // CSV State
    const [csvFile, setCsvFile] = useState<File | null>(null);

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Construct row based on sheet schema
            let row: any[] = [];
            if (entryType === "Sales") {
                // Schema: Transaction_ID, Date, Drug_Name, Batch_Number, Qty_Sold, MRP, Total
                const id = "TXN-" + Math.floor(Math.random() * 10000);
                const total = parseFloat(formData.extra || "0") * parseInt(formData.quantity);
                row = [id, formData.date, formData.drugName, formData.batchNumber, formData.quantity, formData.extra, total];
            } else {
                // Purchases Schema: PO_ID, Date, Drug, Supplier, Batch, Qty, UnitCost, Total, Expiry, Date
                const id = "PO-" + Math.floor(Math.random() * 10000);
                const total = parseFloat(formData.extra || "0") * parseInt(formData.quantity);
                // Assumption for Purchase Form: extra is Unit Cost. Supplier hardcoded for demo simplicity or add field.
                row = [id, formData.date, formData.drugName, "Manual Entry", formData.batchNumber, formData.quantity, formData.extra, total, "2025-12-31", ""];
            }

            const res = await fetch("http://localhost:5000/api/transaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sheet: entryType, row })
            });

            if (!res.ok) throw new Error("Failed to add transaction");

            toast.success("Entry added successfully!", { description: "Google Sheet updated." });
            setFormData({ ...formData, drugName: "", batchNumber: "", quantity: "", extra: "" });

            // Invalidate queries to refresh data (simple reload for now)
            setTimeout(() => window.location.reload(), 1500);

        } catch (err) {
            toast.error("Error adding entry", { description: String(err) });
        } finally {
            setLoading(false);
        }
    };

    const handleCsvUpload = async () => {
        if (!csvFile) return;
        setLoading(true);

        Papa.parse(csvFile, {
            header: false, // Parse as arrays to check first row manually
            skipEmptyLines: true,
            complete: async (results) => {
                const data = results.data as string[][];
                if (data.length < 2) {
                    toast.error("CSV is empty or missing data rows.");
                    setLoading(false);
                    return;
                }

                // Header Validation
                const headers = data[0].map(h => h.trim());
                const rows = data.slice(1);

                // Define Expected Headers (Order must match db_manager expectations if strict, 
                // but since we send rows directly, order is critical.)
                let isValid = false;
                let expectedHeaders = "";

                if (entryType === "Sales") {
                    // Check for key columns. Exact match required for simplicity/safety.
                    // Expected: Transaction_ID,Date,Drug_Name,Batch_Number,Qty_Sold,MRP,Total_Amount
                    // Allow partial match on key fields if needed, but strict is safer.
                    const required = ["Transaction_ID", "Date", "Drug_Name", "Batch_Number", "Qty_Sold"];
                    isValid = required.every(field => headers.includes(field));
                    expectedHeaders = required.join(", ");
                } else {
                    // Purchases
                    // Expected: Purchase_ID,Date_Received,Drug_Name,Supplier_Name,Batch_Number,Qty_Received,Unit_Cost_Price,Total_Purchase_Cost,Expiry_Date
                    const required = ["Purchase_ID", "Date_Received", "Drug_Name", "Supplier_Name", "Batch_Number", "Qty_Received", "Expiry_Date"];
                    isValid = required.every(field => headers.includes(field));
                    expectedHeaders = required.join(", ");
                }

                if (!isValid) {
                    toast.error("Invalid CSV format", {
                        description: `Missing required headers. Expected: ${expectedHeaders}`,
                        duration: 5000
                    });
                    setLoading(false);
                    return;
                }

                try {
                    const res = await fetch("http://localhost:5000/api/upload", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ sheet: entryType, data: rows })
                    });

                    if (!res.ok) throw new Error("Upload failed");

                    toast.success(`Uploaded ${rows.length} rows!`, { description: "Dashboard syncing..." });
                    setCsvFile(null);
                    // Refresh
                    setTimeout(() => window.location.reload(), 1500);
                } catch (err) {
                    toast.error("Upload failed", { description: String(err) });
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    return (
        <DashboardLayout title="Update Inventory Data">
            <div className="max-w-4xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Data Management</CardTitle>
                        <CardDescription>
                            Add new transactions manually or bulk upload via CSV.
                            Updates are synced to the master Google Sheet.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="manual" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                                <TabsTrigger value="csv">CSV Bulk Upload</TabsTrigger>
                            </TabsList>

                            {/* Manual Entry Tab */}
                            <TabsContent value="manual" className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Transaction Type</Label>
                                        <Select value={entryType} onValueChange={setEntryType}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Sales">Values (Sales)</SelectItem>
                                                <SelectItem value="Purchases">Stock (Purchases)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Date</Label>
                                        <Input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Medicine Name</Label>
                                        <Input placeholder="e.g. Dolo 650" value={formData.drugName} onChange={e => setFormData({ ...formData, drugName: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Batch Number</Label>
                                        <Input placeholder="e.g. BATCH-001" value={formData.batchNumber} onChange={e => setFormData({ ...formData, batchNumber: e.target.value })} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Quantity</Label>
                                        <Input type="number" placeholder="0" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{entryType === "Sales" ? "Unit Price" : "Unit Cost"}</Label>
                                        <Input type="number" placeholder="0.00" value={formData.extra} onChange={e => setFormData({ ...formData, extra: e.target.value })} />
                                    </div>
                                </div>

                                <Button className="w-full" onClick={handleManualSubmit} disabled={loading}>
                                    {loading ? <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full" /> : <Plus className="mr-2 h-4 w-4" />}
                                    Add Entry
                                </Button>
                            </TabsContent>

                            {/* CSV Upload Tab */}
                            <TabsContent value="csv" className="space-y-4 pt-4">
                                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-10 bg-gray-50 dark:bg-gray-900/50">
                                    <FileSpreadsheet className="h-10 w-10 text-gray-400 mb-4" />
                                    <Label htmlFor="csv-upload" className="mb-2 text-lg font-medium cursor-pointer text-blue-600 hover:text-blue-500">
                                        {csvFile ? csvFile.name : "Click to select CSV file"}
                                    </Label>
                                    <Input
                                        id="csv-upload"
                                        type="file"
                                        accept=".csv"
                                        className="hidden"
                                        onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                                    />
                                    <p className="text-sm text-gray-500">
                                        Please ensure headers match the {entryType} template.
                                    </p>
                                </div>

                                {csvFile && (
                                    <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-md">
                                        <CheckCircle className="h-4 w-4" />
                                        <span className="text-sm font-medium">Ready to upload: {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)</span>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label>Target Sheet</Label>
                                    <Select value={entryType} onValueChange={setEntryType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Sales">Sales Records</SelectItem>
                                            <SelectItem value="Purchases">Purchase Records</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button className="w-full" variant="secondary" onClick={handleCsvUpload} disabled={!csvFile || loading}>
                                    {loading ? "Uploading..." : "Upload & Sync"}
                                </Button>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default DataUpdatePage;
