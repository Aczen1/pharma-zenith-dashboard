import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Medicine } from '@/data/inventoryData';

export const exportToPDF = (medicines: Medicine[], filename: string = 'inventory_report') => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Pharmacy Inventory Report', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 30);
  
  // Summary stats
  const totalMedicines = medicines.length;
  const totalStock = medicines.reduce((sum, m) => sum + m.currentStock, 0);
  const lowStock = medicines.filter(m => m.currentStock < m.predictedDemand).length;
  
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text(`Total Medicines: ${totalMedicines}`, 14, 42);
  doc.text(`Total Stock: ${totalStock} units`, 14, 50);
  doc.text(`Low Stock Items: ${lowStock}`, 14, 58);
  
  // Table
  const tableData = medicines.map(m => [
    m.name,
    m.batchNumber,
    m.category,
    m.currentStock.toString(),
    m.predictedDemand.toString(),
    m.expiryDate,
    m.currentStock < m.predictedDemand ? 'Low' : 'OK'
  ]);
  
  autoTable(doc, {
    startY: 68,
    head: [['Medicine', 'Batch', 'Category', 'Stock', 'Demand', 'Expiry', 'Status']],
    body: tableData,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 40 },
      6: { cellWidth: 15 }
    }
  });
  
  doc.save(`${filename}.pdf`);
};

export const exportToExcel = (medicines: Medicine[], filename: string = 'inventory_report') => {
  const worksheetData = medicines.map(m => ({
    'Medicine Name': m.name,
    'Batch Number': m.batchNumber,
    'Category': m.category,
    'Current Stock': m.currentStock,
    'Predicted Demand': m.predictedDemand,
    'Expiry Date': m.expiryDate,
    'Status': m.currentStock < m.predictedDemand ? 'Low Stock' : 'Adequate'
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  
  // Add summary sheet
  const summaryData = [
    { 'Metric': 'Total Medicines', 'Value': medicines.length },
    { 'Metric': 'Total Stock', 'Value': medicines.reduce((sum, m) => sum + m.currentStock, 0) },
    { 'Metric': 'Low Stock Items', 'Value': medicines.filter(m => m.currentStock < m.predictedDemand).length },
    { 'Metric': 'Report Date', 'Value': new Date().toLocaleDateString() }
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
  
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
