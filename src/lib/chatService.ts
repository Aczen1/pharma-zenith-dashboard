
import {
    medicines,
    shipments,
    getExpiringSoon,
    getLowStock,
    getTotalStock,
    getTotalMedicines
} from "@/data/inventoryData";

export interface ChatMessage {
    id: string;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
}

const GREETINGS = [
    "Hello! I'm Zeniee. How can I help you with your inventory today?",
    "Hi there! Ask me about stock levels, expiries, or shipments.",
    "Greetings! I'm here to assist. What information do you need?"
];

const UNKNOWN_RESPONSES = [
    "I'm not sure I understand. Try asking about 'expiring medicines', 'low stock', or 'shipments'.",
    "I can only help with inventory data. Try asking 'show me low stock' or 'check shipments'.",
    "My knowledge is limited to the current inventory. Ask about stock, expiries, or orders."
];

export const processQuery = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    // Greetings
    if (lowerQuery.match(/^(hi|hello|hey|greetings)/)) {
        return GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    }

    // Expiry Queries
    if (lowerQuery.includes("expire") || lowerQuery.includes("expiry") || lowerQuery.includes("expiring")) {
        const expiring = getExpiringSoon(30);
        if (expiring.length === 0) {
            return "Good news! There are no medicines expiring within the next 30 days.";
        }
        const list = expiring.map(m => `- ${m.name} (${m.expiryDate})`).join("\n");
        return `⚠️ Found ${expiring.length} medicines expiring soon:\n${list}`;
    }

    // Low Stock Queries
    if (lowerQuery.includes("low stock") || lowerQuery.includes("shortage") || lowerQuery.includes("reorder")) {
        const lowStock = getLowStock();
        if (lowStock.length === 0) {
            return "All stock levels appear to be healthy.";
        }
        const list = lowStock.map(m => `- ${m.name}: ${m.currentStock} units (Demand: ${m.predictedDemand})`).join("\n");
        return `📉 Found ${lowStock.length} items with low stock:\n${list}`;
    }

    // General Stock/Medicines Queries
    if (lowerQuery.includes("total stock") || lowerQuery.includes("how many medicines")) {
        return `We currently have ${getTotalMedicines()} unique medicines in the inventory, with a total of ${getTotalStock()} units in stock.`;
    }

    if (lowerQuery.includes("list") || lowerQuery.includes("medicines") || lowerQuery.includes("inventory")) {
        const top5 = medicines.slice(0, 5).map(m => `- ${m.name}`).join("\n");
        return `We have ${medicines.length} medicines. Here are the first few:\n${top5}\n...and ${medicines.length - 5} others.`;
    }

    // Shipment/Order Queries
    if (lowerQuery.includes("shipment") || lowerQuery.includes("order") || lowerQuery.includes("delivery")) {
        const activeShipments = shipments.filter(s => s.status === "In Transit" || s.status === "Pending" || s.status === "Delayed");
        if (activeShipments.length === 0) {
            return "No active shipments at the moment.";
        }
        const list = activeShipments.map(s => `- ${s.trackingNumber}: ${s.status} (Est: ${s.estimatedDelivery})`).join("\n");
        return `🚚 Here are the active shipments:\n${list}`;
    }

    // Specific Medicine Search (Simple name matching)
    const medicineMatch = medicines.find(m => lowerQuery.includes(m.name.toLowerCase()));
    if (medicineMatch) {
        return `📦 **${medicineMatch.name}**\nStock: ${medicineMatch.currentStock}\nBatch: ${medicineMatch.batchNumber}\nExpiry: ${medicineMatch.expiryDate}\nCategory: ${medicineMatch.category}`;
    }

    return UNKNOWN_RESPONSES[Math.floor(Math.random() * UNKNOWN_RESPONSES.length)];
};
