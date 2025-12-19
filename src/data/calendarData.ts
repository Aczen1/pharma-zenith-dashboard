
import { addDays, subDays } from "date-fns";

export interface Medicine {
    id: string;
    medicineName: string;
    batchNumber: string;
    expiryDate: Date;
    quantity: number;
}

export const generateDummyMedicines = (): Medicine[] => {
    const today = new Date();

    return [
        {
            id: "1",
            medicineName: "Paracetamol 500mg",
            batchNumber: "PCM-2024-001",
            expiryDate: addDays(today, 2), // Critical
            quantity: 50
        },
        {
            id: "2",
            medicineName: "Amoxicillin 250mg",
            batchNumber: "AMX-2023-089",
            expiryDate: addDays(today, 5), // Critical
            quantity: 120
        },
        {
            id: "3",
            medicineName: "Vitamin C 1000mg",
            batchNumber: "VTC-2024-112",
            expiryDate: addDays(today, 12), // Upcoming
            quantity: 200
        },
        {
            id: "4",
            medicineName: "Ibuprofen 400mg",
            batchNumber: "IBU-2023-055",
            expiryDate: addDays(today, 12), // Upcoming (Same day collision)
            quantity: 80
        },
        {
            id: "5",
            medicineName: "Cetirizine 10mg",
            batchNumber: "CET-2024-033",
            expiryDate: addDays(today, 25), // Upcoming
            quantity: 150
        },
        {
            id: "6",
            medicineName: "Metformin 500mg",
            batchNumber: "MET-2023-099",
            expiryDate: addDays(today, 45), // Safe
            quantity: 300
        },
        {
            id: "7",
            medicineName: "Aspirin 75mg",
            batchNumber: "ASP-2024-002",
            expiryDate: subDays(today, 10), // Expired
            quantity: 20
        },
        {
            id: "8",
            medicineName: "Atorvastatin 20mg",
            batchNumber: "ATR-2024-011",
            expiryDate: addDays(today, 2), // Critical - Same day as Paracetamol
            quantity: 45
        },
        {
            id: "9",
            medicineName: "Omeprazole 20mg",
            batchNumber: "OMP-2024-044",
            expiryDate: addDays(today, 2), // Critical - Same day as Paracetamol
            quantity: 90
        }
    ];
};
