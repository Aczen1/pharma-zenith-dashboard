import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Papa from "papaparse";

interface UploadedFile {
  id: string;
  name: string;
  type: "sales" | "purchase";
  rows: number;
  status: "valid" | "invalid" | "processing";
  errors?: string[];
  data?: Record<string, unknown>[];
}

const SALES_HEADERS = ["Date", "Product_Name", "Quantity_Sold", "Unit_Price", "Total_Amount", "Customer_ID"];
const PURCHASE_HEADERS = ["Date", "Product_Name", "Quantity_Purchased", "Unit_Cost", "Supplier_Name", "Batch_Number"];

const UploadDataPage = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const validateHeaders = (headers: string[], type: "sales" | "purchase"): { valid: boolean; missing: string[] } => {
    const requiredHeaders = type === "sales" ? SALES_HEADERS : PURCHASE_HEADERS;
    const missing = requiredHeaders.filter(h => !headers.some(header => 
      header.toLowerCase().replace(/[_\s]/g, '') === h.toLowerCase().replace(/[_\s]/g, '')
    ));
    return { valid: missing.length === 0, missing };
  };

  const determineFileType = (filename: string): "sales" | "purchase" => {
    const lower = filename.toLowerCase();
    if (lower.includes("sale") || lower.includes("sold")) return "sales";
    if (lower.includes("purchase") || lower.includes("buy") || lower.includes("order")) return "purchase";
    return "sales";
  };

  const processFile = useCallback((file: File) => {
    const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fileType = determineFileType(file.name);
    
    const newFile: UploadedFile = {
      id: fileId,
      name: file.name,
      type: fileType,
      rows: 0,
      status: "processing",
    };
    
    setFiles(prev => [...prev, newFile]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const validation = validateHeaders(headers, fileType);
        
        setFiles(prev => prev.map(f => {
          if (f.id === fileId) {
            if (!validation.valid) {
              return {
                ...f,
                status: "invalid" as const,
                rows: results.data.length,
                errors: [`Missing headers: ${validation.missing.join(", ")}`],
              };
            }
            
            // Store in localStorage for persistence
            const storageKey = `pharma_${fileType}_data`;
            const existingData = JSON.parse(localStorage.getItem(storageKey) || "[]");
            const mergedData = [...existingData, ...results.data];
            localStorage.setItem(storageKey, JSON.stringify(mergedData));
            
            // Trigger storage event for cross-tab sync
            window.dispatchEvent(new StorageEvent('storage', {
              key: storageKey,
              newValue: JSON.stringify(mergedData),
            }));
            
            toast.success(`${file.name} uploaded successfully! ${results.data.length} records added.`);
            
            return {
              ...f,
              status: "valid" as const,
              rows: results.data.length,
              data: results.data as Record<string, unknown>[],
            };
          }
          return f;
        }));
      },
      error: (error) => {
        setFiles(prev => prev.map(f => {
          if (f.id === fileId) {
            return {
              ...f,
              status: "invalid" as const,
              errors: [error.message],
            };
          }
          return f;
        }));
        toast.error(`Failed to parse ${file.name}`);
      },
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      f => f.name.endsWith('.csv') || f.name.endsWith('.xlsx') || f.name.endsWith('.xls')
    );
    
    if (droppedFiles.length === 0) {
      toast.error("Please upload CSV or Excel files only");
      return;
    }
    
    droppedFiles.forEach(processFile);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    selectedFiles.forEach(processFile);
    e.target.value = "";
  }, [processFile]);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const downloadTemplate = (type: "sales" | "purchase") => {
    const headers = type === "sales" ? SALES_HEADERS : PURCHASE_HEADERS;
    const sampleData = type === "sales" 
      ? ["2024-01-15", "Paracetamol 500mg", "50", "10.00", "500.00", "CUST001"]
      : ["2024-01-15", "Paracetamol 500mg", "100", "8.00", "PharmaCorp", "PCM-2024-001"];
    
    const csvContent = [headers.join(","), sampleData.join(",")].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const validFiles = files.filter(f => f.status === "valid");
  const invalidFiles = files.filter(f => f.status === "invalid");

  return (
    <DashboardLayout title="Upload Data">
      <div className="space-y-6">
        {/* Upload Zone */}
        <Card className="glass-card border-dashed">
          <CardContent className="p-8">
            <div
              className={cn(
                "relative border-2 border-dashed rounded-2xl p-8 md:p-12 transition-all duration-200 text-center",
                isDragging 
                  ? "border-primary bg-primary/5 scale-[1.02]" 
                  : "border-border hover:border-primary/50 hover:bg-accent/50"
              )}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                multiple
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="flex flex-col items-center gap-4">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
                  isDragging ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  <Upload className="w-8 h-8" />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {isDragging ? "Drop files here" : "Upload Sales or Purchase Data"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Drag & drop CSV/Excel files or click to browse
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  <Badge variant="outline" className="text-xs">CSV</Badge>
                  <Badge variant="outline" className="text-xs">XLSX</Badge>
                  <Badge variant="outline" className="text-xs">XLS</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-primary" />
                Sales Data Template
              </CardTitle>
              <CardDescription className="text-xs">
                Required: {SALES_HEADERS.join(", ")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" onClick={() => downloadTemplate("sales")} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-primary" />
                Purchase Data Template
              </CardTitle>
              <CardDescription className="text-xs">
                Required: {PURCHASE_HEADERS.join(", ")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" onClick={() => downloadTemplate("purchase")} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Uploaded Files */}
        {files.length > 0 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Uploaded Files</CardTitle>
              <CardDescription>
                {validFiles.length} valid, {invalidFiles.length} invalid
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all",
                      file.status === "valid" && "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
                      file.status === "invalid" && "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
                      file.status === "processing" && "bg-muted border-border animate-pulse"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {file.status === "valid" && <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />}
                      {file.status === "invalid" && <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
                      {file.status === "processing" && (
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      )}
                      
                      <div>
                        <p className="font-medium text-sm text-foreground">{file.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="secondary" className="text-xs capitalize">{file.type}</Badge>
                          {file.rows > 0 && (
                            <span className="text-xs text-muted-foreground">{file.rows} rows</span>
                          )}
                        </div>
                        {file.errors && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">{file.errors[0]}</p>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(file.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UploadDataPage;
