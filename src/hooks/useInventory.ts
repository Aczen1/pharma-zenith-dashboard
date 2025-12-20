import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Medicine, Shipment } from '../data/inventoryData';

interface PurchaseRow {
    Purchase_ID: string;
    Date_Received: string;
    Drug_Name: string;
    Supplier_Name: string;
    Batch_Number: string;
    Qty_Received: string; // CSV parses as string often
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

export interface ForecastRow {
    Date: string;
    Forecast_Date: string; // Adjust as per CSV content
    Drug_Name: string;
    Predicted_Qty: string;
}

export const useInventory = () => {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [forecast, setForecast] = useState<ForecastRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // FETCH STRATEGY: Try Python Backend (GSheets) -> Fallback to Local CSV
                let purchases: any[] = [];
                let sales: any[] = [];
                let forecastData: any[] = [];

                try {
                    // Try Data Server
                    const res = await fetch("http://localhost:5000/api/inventory");
                    if (!res.ok) throw new Error("Server offline");
                    const data = await res.json();

                    // Backend returns list of dicts directly
                    purchases = data.purchases;
                    sales = data.sales;
                    forecastData = data.forecast;

                } catch (serverErr) {
                    console.warn("Backend server unavailable, falling back to local csv", serverErr);

                    const [purchasesRes, salesRes, forecastRes] = await Promise.all([
                        fetch('/final_cleaned_purchases.csv'),
                        fetch('/final_cleaned_sales.csv'),
                        fetch('/pharmacy_forecast_next_30_days.csv')
                    ]);

                    const purchasesText = await purchasesRes.text();
                    const salesText = await salesRes.text();
                    const forecastText = await forecastRes.text();

                    purchases = Papa.parse(purchasesText, { header: true }).data;
                    sales = Papa.parse(salesText, { header: true }).data;
                    forecastData = Papa.parse(forecastText, { header: true }).data;
                }

                // Keep forecast in state to return it
                setForecast(forecastData);

                // 1. Calculate Stock Levels per Batch
                const batchStock = new Map<string, any>(); // Batch -> { details, stock }
                const newShipments: Shipment[] = [];
                // MOCK DATE FOR DEMO: Set to Jan 01, 2030. 
                // Set far in future to guarantee EVERY purchase is "In Stock" and visible in Inventory.
                // Logistics page will be empty (no future shipments), but Inventory will be complete.
                const today = new Date("2030-01-01");

                // Process Purchases
                purchases.forEach(p => {
                    if (!p.Batch_Number) return;
                    const qty = parseInt(p.Qty_Received) || 0;
                    const dateReceived = new Date(p.Date_Received);

                    if (dateReceived > today) {
                        // Future Shipment
                        newShipments.push({
                            id: p.Purchase_ID || Math.random().toString(),
                            trackingNumber: `TRK-${p.Purchase_ID}`, // Fabricated
                            origin: p.Supplier_Name || "Supplier",
                            destination: "Central Warehouse",
                            status: "In Transit", // Simplification
                            estimatedDelivery: p.Date_Received,
                            medicines: [p.Drug_Name],
                            quantity: qty
                        });
                        // Do NOT add to current stock
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

                // Process Sales (Subtract from Batch)
                sales.forEach(s => {
                    if (!s.Batch_Number) return;
                    const qty = parseInt(s.Qty_Sold) || 0;
                    // Only subtract if batch exists (meaning it was received)
                    if (batchStock.has(s.Batch_Number)) {
                        batchStock.get(s.Batch_Number).currentStock -= qty;
                    }
                });

                // 2. Calculate Predicted Demand per Drug (Next 7 sums)
                // Group forecast by Drug Name
                const drugForecast = new Map<string, number>();
                forecastData.forEach(f => {
                    if (!f.Drug_Name) return;
                    const drugName = f.Drug_Name.trim().toLowerCase();
                    const qty = parseFloat(f.Predicted_Qty) || 0;
                    const currentTotal = drugForecast.get(drugName) || 0;
                    drugForecast.set(drugName, currentTotal + qty);
                });

                // 3. Transform to Medicine Interface
                const newMedicines: Medicine[] = [];
                let idCounter = 1;

                batchStock.forEach((value, batchNo) => {
                    // if (value.currentStock <= 0) return; // Hide sold out (optional) <--- REMOVED FILTER

                    // Try to match forecast
                    // Forecast file names might be lowercase
                    const drugNameLower = value.Drug_Name.toLowerCase();
                    // Simple heuristic to match forecast (taking average or sum if multiple days)
                    // The forecast file is day-by-day. Let's assume the sum we calculated is rough 30 day demand.
                    // We want 7-day demand. We summed ALL rows in CSV.
                    // Let's blindly divide by 4 to get ~1 week demand if the CSV is 30 days.
                    const totalForecast = drugForecast.get(drugNameLower) || 0;
                    const weeklyDemand = Math.round(totalForecast / 4);

                    newMedicines.push({
                        id: (idCounter++).toString(),
                        name: value.Drug_Name,
                        batchNumber: batchNo,
                        category: "General", // CSV doesn't have category, defaulting
                        currentStock: value.currentStock,
                        expiryDate: value.Expiry_Date,
                        predictedDemand: weeklyDemand > 0 ? weeklyDemand : 5 // Fallback
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
        };

        fetchData();
    }, []);

    return { medicines, shipments, forecast, loading, error };
};
