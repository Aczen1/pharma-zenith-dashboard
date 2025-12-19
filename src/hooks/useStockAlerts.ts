import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { useInventory } from './useInventory';

interface StockAlert {
    medicineName: string;
    currentStock: number;
    threshold: number;
    severity: 'critical' | 'warning';
}

export const useStockAlerts = () => {
    const { medicines } = useInventory();
    const [alerts, setAlerts] = useState<StockAlert[]>([]);
    const alertedMedicines = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!medicines || medicines.length === 0) return;

        // Group by medicine name and sum stock
        const stockByMedicine = medicines.reduce((acc, med) => {
            if (!acc[med.name]) {
                acc[med.name] = 0;
            }
            acc[med.name] += med.currentStock;
            return acc;
        }, {} as Record<string, number>);

        const newAlerts: StockAlert[] = [];

        Object.entries(stockByMedicine).forEach(([name, stock]) => {
            let severity: 'critical' | 'warning' | null = null;
            let threshold = 0;

            if (stock < 20) {
                severity = 'critical';
                threshold = 20;
            } else if (stock < 50) {
                severity = 'warning';
                threshold = 50;
            }

            if (severity && !alertedMedicines.current.has(name)) {
                newAlerts.push({ medicineName: name, currentStock: stock, threshold, severity });
                alertedMedicines.current.add(name);

                // Show toast notification
                const message = `${name}: Only ${stock} units left!`;
                if (severity === 'critical') {
                    toast.error(message, {
                        description: 'Critical stock level - Reorder immediately',
                        duration: 5000,
                    });
                } else {
                    toast.warning(message, {
                        description: 'Low stock warning - Consider reordering',
                        duration: 4000,
                    });
                }
            }
        });

        if (newAlerts.length > 0) {
            setAlerts(prev => [...prev, ...newAlerts]);
        }
    }, [medicines]);

    return {
        alerts,
        alertCount: alerts.length,
    };
};
