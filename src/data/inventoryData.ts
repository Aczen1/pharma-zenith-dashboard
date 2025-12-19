// Static dummy data for the inventory management system

export interface Medicine {
  id: string;
  name: string;
  batchNumber: string;
  category: string;
  currentStock: number;
  expiryDate: string;
  predictedDemand: number; // 7-day forecast
}

export const medicines: Medicine[] = [
  {
    id: "1",
    name: "Paracetamol 500mg",
    batchNumber: "PCM-2024-001",
    category: "Pain Relief",
    currentStock: 1250,
    expiryDate: "2025-08-15",
    predictedDemand: 200,
  },
  {
    id: "2",
    name: "Amoxicillin 250mg",
    batchNumber: "AMX-2024-042",
    category: "Antibiotics",
    currentStock: 45,
    expiryDate: "2025-01-10",
    predictedDemand: 80,
  },
  {
    id: "3",
    name: "Ibuprofen 400mg",
    batchNumber: "IBU-2024-088",
    category: "Pain Relief",
    currentStock: 890,
    expiryDate: "2026-03-20",
    predictedDemand: 150,
  },
  {
    id: "4",
    name: "Omeprazole 20mg",
    batchNumber: "OMP-2024-156",
    category: "Gastric",
    currentStock: 320,
    expiryDate: "2025-01-05",
    predictedDemand: 100,
  },
  {
    id: "5",
    name: "Metformin 500mg",
    batchNumber: "MTF-2024-203",
    category: "Diabetes",
    currentStock: 1560,
    expiryDate: "2025-11-30",
    predictedDemand: 250,
  },
  {
    id: "6",
    name: "Atorvastatin 10mg",
    batchNumber: "ATV-2024-067",
    category: "Cardiovascular",
    currentStock: 25,
    expiryDate: "2025-06-18",
    predictedDemand: 60,
  },
  {
    id: "7",
    name: "Cetirizine 10mg",
    batchNumber: "CTZ-2024-289",
    category: "Antihistamine",
    currentStock: 780,
    expiryDate: "2025-01-02",
    predictedDemand: 120,
  },
  {
    id: "8",
    name: "Losartan 50mg",
    batchNumber: "LST-2024-134",
    category: "Cardiovascular",
    currentStock: 410,
    expiryDate: "2025-09-22",
    predictedDemand: 90,
  },
  {
    id: "9",
    name: "Azithromycin 500mg",
    batchNumber: "AZT-2024-445",
    category: "Antibiotics",
    currentStock: 15,
    expiryDate: "2025-04-10",
    predictedDemand: 40,
  },
  {
    id: "10",
    name: "Vitamin D3 1000IU",
    batchNumber: "VTD-2024-567",
    category: "Supplements",
    currentStock: 2100,
    expiryDate: "2026-12-01",
    predictedDemand: 300,
  },
  {
    id: "11",
    name: "Salbutamol Inhaler",
    batchNumber: "SLB-2024-089",
    category: "Respiratory",
    currentStock: 55,
    expiryDate: "2025-01-15",
    predictedDemand: 70,
  },
  {
    id: "12",
    name: "Prednisolone 5mg",
    batchNumber: "PRD-2024-312",
    category: "Corticosteroids",
    currentStock: 180,
    expiryDate: "2025-07-28",
    predictedDemand: 45,
  },
];

export interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  status: "In Transit" | "Delivered" | "Pending" | "Delayed";
  estimatedDelivery: string;
  medicines: string[];
  quantity: number;
}

export const shipments: Shipment[] = [
  {
    id: "1",
    trackingNumber: "PZ-SHP-2024-001",
    origin: "Mumbai Warehouse",
    destination: "Delhi Distribution Center",
    status: "In Transit",
    estimatedDelivery: "2024-12-22",
    medicines: ["Paracetamol 500mg", "Ibuprofen 400mg"],
    quantity: 5000,
  },
  {
    id: "2",
    trackingNumber: "PZ-SHP-2024-002",
    origin: "Chennai Factory",
    destination: "Bangalore Hub",
    status: "Delivered",
    estimatedDelivery: "2024-12-18",
    medicines: ["Amoxicillin 250mg", "Azithromycin 500mg"],
    quantity: 3200,
  },
  {
    id: "3",
    trackingNumber: "PZ-SHP-2024-003",
    origin: "Hyderabad Plant",
    destination: "Kolkata Warehouse",
    status: "Pending",
    estimatedDelivery: "2024-12-25",
    medicines: ["Metformin 500mg", "Atorvastatin 10mg"],
    quantity: 8500,
  },
  {
    id: "4",
    trackingNumber: "PZ-SHP-2024-004",
    origin: "Pune Distribution",
    destination: "Ahmedabad Center",
    status: "Delayed",
    estimatedDelivery: "2024-12-20",
    medicines: ["Omeprazole 20mg", "Losartan 50mg"],
    quantity: 2100,
  },
  {
    id: "5",
    trackingNumber: "PZ-SHP-2024-005",
    origin: "Jaipur Warehouse",
    destination: "Lucknow Hub",
    status: "In Transit",
    estimatedDelivery: "2024-12-23",
    medicines: ["Cetirizine 10mg", "Vitamin D3 1000IU"],
    quantity: 4200,
  },
];

// Helper functions
export const getUniqueCategories = (): string[] => {
  return [...new Set(medicines.map((m) => m.category))];
};

export const getTotalMedicines = (): number => {
  return medicines.length;
};

export const getTotalStock = (): number => {
  return medicines.reduce((sum, m) => sum + m.currentStock, 0);
};

export const getExpiringSoon = (days: number = 30): Medicine[] => {
  const today = new Date();
  const threshold = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
  return medicines.filter((m) => new Date(m.expiryDate) <= threshold);
};

export const getLowStock = (): Medicine[] => {
  return medicines.filter((m) => m.currentStock < m.predictedDemand);
};

export const getMedicineStatus = (medicine: Medicine): "Healthy" | "Low" | "Expiring" => {
  const today = new Date();
  const expiryDate = new Date(medicine.expiryDate);
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry <= 30) return "Expiring";
  if (medicine.currentStock < medicine.predictedDemand) return "Low";
  return "Healthy";
};
