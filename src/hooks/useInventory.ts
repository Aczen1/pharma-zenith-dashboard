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

interface ForecastRow {
    Date: string;
    Forecast_Date: string; // Adjust as per CSV content
    Drug_Name: string;
    Predicted_Qty: string;
}

export const useInventory = () => {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
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
                const forecast = Papa.parse<ForecastRow>(forecastText, { header: true }).data;

                // 1. Calculate Stock Levels per Batch
                const batchStock = new Map<string, any>(); // Batch -> { details, stock }
                const newShipments: Shipment[] = [];
                const today = new Date(); // Use real today

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
                forecast.forEach(f => {
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
                    if (value.currentStock <= 0) return; // Hide sold out (optional)

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

    return { medicines, shipments, loading, error };
};
