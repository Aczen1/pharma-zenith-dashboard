import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import { Medicine, Shipment } from '../data/inventoryData';

interface PurchaseRow {
    Purchase_ID: string;
    Date_Received: string;
    Drug_Name: string;
    Supplier_Name: string;
    Batch_Number: string;
    Qty_Received: string;
    Unit_Cost_Price: string;
    Total_Purchase_Cost: string;
    Expiry_Date: string;
}

interface SaleRow {
    Transaction_ID: string;
    Date: string;
    Drug_Name: string;
    Batch_Number: string;
    Qty_Sold: string;
}

interface UploadedPurchaseRow {
    Date: string;
    Product_Name: string;
    Quantity_Purchased: string;
    Unit_Cost: string;
    Supplier_Name: string;
    Batch_Number: string;
}

interface UploadedSaleRow {
    Date: string;
    Product_Name: string;
    Quantity_Sold: string;
    Unit_Price: string;
    Total_Amount: string;
    Customer_ID: string;
}

export interface ForecastRow {
    Date: string;
    Forecast_Date: string;
    Drug_Name: string;
    Predicted_Qty: string;
}

export const useInventory = () => {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [forecast, setForecast] = useState<ForecastRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const [purchasesRes, salesRes, forecastRes] = await Promise.all([
                fetch('/final_cleaned_purchases.csv'),
                fetch('/final_cleaned_sales.csv'),
                fetch('/pharmacy_forecast_next_30_days.csv')
            ]);

            const purchasesText = await purchasesRes.text();
            const salesText = await salesRes.text();
            const forecastText = await forecastRes.text();

            const purchases = Papa.parse<PurchaseRow>(purchasesText, { header: true }).data;
            const sales = Papa.parse<SaleRow>(salesText, { header: true }).data;
            const forecastData = Papa.parse<ForecastRow>(forecastText, { header: true }).data;

            // Get uploaded data from localStorage
            const uploadedPurchases: UploadedPurchaseRow[] = JSON.parse(localStorage.getItem('pharma_purchase_data') || '[]');
            const uploadedSales: UploadedSaleRow[] = JSON.parse(localStorage.getItem('pharma_sales_data') || '[]');

            setForecast(forecastData);

            const batchStock = new Map<string, any>();
            const newShipments: Shipment[] = [];
            const today = new Date();

            // Process CSV Purchases
            purchases.forEach(p => {
                if (!p.Batch_Number) return;
                const qty = parseInt(p.Qty_Received) || 0;
                const dateReceived = new Date(p.Date_Received);

                if (dateReceived > today) {
                    newShipments.push({
                        id: p.Purchase_ID || Math.random().toString(),
                        trackingNumber: `TRK-${p.Purchase_ID}`,
                        origin: p.Supplier_Name || "Supplier",
                        destination: "Central Warehouse",
                        status: "In Transit",
                        estimatedDelivery: p.Date_Received,
                        medicines: [p.Drug_Name],
                        quantity: qty
                    });
                    return;
                }

                if (!batchStock.has(p.Batch_Number)) {
                    batchStock.set(p.Batch_Number, {
                        ...p,
                        currentStock: 0,
                        initialStock: 0
                    });
                }
                const batch = batchStock.get(p.Batch_Number);
                batch.currentStock += qty;
                batch.initialStock += qty;
            });

            // Process Uploaded Purchases
            uploadedPurchases.forEach(p => {
                if (!p.Batch_Number || !p.Product_Name) return;
                const qty = parseInt(p.Quantity_Purchased) || 0;
                const batchKey = p.Batch_Number;

                if (!batchStock.has(batchKey)) {
                    batchStock.set(batchKey, {
                        Drug_Name: p.Product_Name,
                        Batch_Number: p.Batch_Number,
                        Supplier_Name: p.Supplier_Name,
                        Expiry_Date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        currentStock: 0,
                        initialStock: 0
                    });
                }
                const batch = batchStock.get(batchKey);
                batch.currentStock += qty;
                batch.initialStock += qty;
            });

            // Process CSV Sales
            sales.forEach(s => {
                if (!s.Batch_Number) return;
                const qty = parseInt(s.Qty_Sold) || 0;
                if (batchStock.has(s.Batch_Number)) {
                    batchStock.get(s.Batch_Number).currentStock -= qty;
                }
            });

            // Process Uploaded Sales
            uploadedSales.forEach(s => {
                if (!s.Product_Name) return;
                const qty = parseInt(s.Quantity_Sold) || 0;
                // Find matching product and subtract
                batchStock.forEach((value) => {
                    if (value.Drug_Name?.toLowerCase() === s.Product_Name?.toLowerCase()) {
                        value.currentStock -= qty;
                    }
                });
            });

            // Calculate Predicted Demand per Drug
            const drugForecast = new Map<string, number>();
            forecastData.forEach(f => {
                if (!f.Drug_Name) return;
                const drugName = f.Drug_Name.trim().toLowerCase();
                const qty = parseFloat(f.Predicted_Qty) || 0;
                const currentTotal = drugForecast.get(drugName) || 0;
                drugForecast.set(drugName, currentTotal + qty);
            });

            // Transform to Medicine Interface
            const newMedicines: Medicine[] = [];
            let idCounter = 1;

            batchStock.forEach((value, batchNo) => {
                if (value.currentStock <= 0) return;

                const drugNameLower = (value.Drug_Name || '').toLowerCase();
                const totalForecast = drugForecast.get(drugNameLower) || 0;
                const weeklyDemand = Math.round(totalForecast / 4);

                newMedicines.push({
                    id: (idCounter++).toString(),
                    name: value.Drug_Name || 'Unknown',
                    batchNumber: batchNo,
                    category: "General",
                    currentStock: Math.max(0, value.currentStock),
                    expiryDate: value.Expiry_Date || 'N/A',
                    predictedDemand: weeklyDemand > 0 ? weeklyDemand : 5
                });
            });

            setMedicines(newMedicines);
            setShipments(newShipments);
            setLoading(false);

        } catch (err) {
            console.error("Failed to load inventory data", err);
            setError("Failed to load data");
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();

        // Listen for storage changes to sync uploaded data
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key?.startsWith('pharma_')) {
                fetchData();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        
        // Also listen for custom events within same tab
        const handleCustomStorage = () => fetchData();
        window.addEventListener('pharma-data-updated', handleCustomStorage);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('pharma-data-updated', handleCustomStorage);
        };
    }, [fetchData]);

    return { medicines, shipments, forecast, loading, error, refetch: fetchData };
};
