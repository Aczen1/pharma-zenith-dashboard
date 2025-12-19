
import { useState } from "react";
import { format, addMonths, subMonths, isSameDay, differenceInDays } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { generateDummyMedicines, Medicine } from "@/data/calendarData";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const CalendarPage = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // In a real app, this would come from an API/Query
    const allMedicines = generateDummyMedicines();

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const handleToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today);
        setIsSheetOpen(true);
    };

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        setIsSheetOpen(true);
    };

    const selectedMedicines = selectedDate
        ? allMedicines.filter((med) => isSameDay(med.expiryDate, selectedDate))
        : [];

    const getStatusBadge = (expiryDate: Date) => {
        const daysLeft = differenceInDays(expiryDate, new Date());
        let mood: "critical" | "warning" | "safe" | "expired" = "safe";
        let label = "Safe";

        if (daysLeft < 0) { mood = "expired"; label = "Expired"; }
        else if (daysLeft <= 7) { mood = "critical"; label = "Critical"; }
        else if (daysLeft <= 30) { mood = "warning"; label = "Expiring Soon"; }

        return (
            <span className={cn(
                "px-2 py-1 rounded-full text-xs font-semibold",
                mood === "critical" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                mood === "warning" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                mood === "safe" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                mood === "expired" && "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
            )}>
                {label} ({daysLeft < 0 ? `${Math.abs(daysLeft)} days ago` : `${daysLeft} days left`})
            </span>
        );
    };

    // Calculate statistics
    const today = new Date();
    const criticalMedicines = allMedicines.filter(med => {
        const daysLeft = differenceInDays(med.expiryDate, today);
        return daysLeft >= 0 && daysLeft <= 7;
    });
    const upcomingMedicines = allMedicines.filter(med => {
        const daysLeft = differenceInDays(med.expiryDate, today);
        return daysLeft > 7 && daysLeft <= 30;
    });
    const expiredMedicines = allMedicines.filter(med => differenceInDays(med.expiryDate, today) < 0);

    return (
        <DashboardLayout title="Compliance Calendar">
            <div className="flex gap-6">
                {/* Left: Calendar Grid */}
                <div className="flex-1 flex flex-col gap-4 max-w-4xl">
                    {/* Header Controls */}
                    <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border/50 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5 text-primary" />
                                <h2 className="text-xl font-bold text-foreground">
                                    {format(currentDate, "MMMM yyyy")}
                                </h2>
                            </div>
                            <div className="flex items-center border rounded-lg bg-background">
                                <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <div className="w-px h-8 bg-border"></div>
                                <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8">
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <Button variant="outline" size="sm" onClick={handleToday}>
                            Today
                        </Button>
                    </div>

                    {/* Calendar Grid - Square aspect */}
                    <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm aspect-square flex items-center justify-center">
                        <CalendarGrid
                            currentDate={currentDate}
                            allMedicines={allMedicines}
                            onDateClick={handleDateClick}
                            selectedDate={selectedDate}
                        />
                    </div>
                </div>

                {/* Right: Status Panel */}
                <div className="w-80 flex flex-col gap-4">
                    <div className="bg-card p-5 rounded-2xl border border-border/50 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <div className="w-1 h-5 bg-primary rounded-full"></div>
                            Status Overview
                        </h3>

                        <div className="space-y-3">
                            {/* Current (Safe) */}
                            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-green-700 dark:text-green-400">Current</span>
                                    <span className="text-2xl font-bold text-green-700 dark:text-green-400">
                                        {allMedicines.length - criticalMedicines.length - upcomingMedicines.length - expiredMedicines.length}
                                    </span>
                                </div>
                                <div className="h-2 bg-green-200 dark:bg-green-900/50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 rounded-full transition-all"
                                        style={{ width: `${((allMedicines.length - criticalMedicines.length - upcomingMedicines.length - expiredMedicines.length) / allMedicines.length) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Notifying (Upcoming) */}
                            <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Notifying</span>
                                    <span className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                                        {upcomingMedicines.length}
                                    </span>
                                </div>
                                <div className="h-2 bg-yellow-200 dark:bg-yellow-900/50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-500 rounded-full transition-all"
                                        style={{ width: `${(upcomingMedicines.length / allMedicines.length) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Expired */}
                            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-red-700 dark:text-red-400">Expired</span>
                                    <span className="text-2xl font-bold text-red-700 dark:text-red-400">
                                        {expiredMedicines.length}
                                    </span>
                                </div>
                                <div className="h-2 bg-red-200 dark:bg-red-900/50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-red-500 rounded-full transition-all"
                                        style={{ width: `${(expiredMedicines.length / allMedicines.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="bg-card p-4 rounded-xl border border-border/50 shadow-sm">
                        <h4 className="text-sm font-semibold mb-3">Legend</h4>
                        <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span className="text-muted-foreground">Critical (0-7 days)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                <span className="text-muted-foreground">Upcoming (8-30 days)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-muted-foreground">Safe (30+ days)</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Events / Critical Items */}
                    <div className="bg-card p-4 rounded-xl border border-border/50 shadow-sm flex-1 overflow-hidden">
                        <h4 className="text-sm font-semibold mb-3">Critical Items</h4>
                        <div className="space-y-2 overflow-y-auto max-h-64">
                            {criticalMedicines.length > 0 ? (
                                criticalMedicines.map(med => (
                                    <div key={med.id} className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 text-xs">
                                        <div className="font-medium text-red-900 dark:text-red-300 truncate">{med.medicineName}</div>
                                        <div className="text-red-700 dark:text-red-400 text-[10px] mt-0.5">
                                            Expires: {format(med.expiryDate, "MMM dd")} ({differenceInDays(med.expiryDate, today)} days)
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-xs text-center py-4">No critical items</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Side Panel */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-md w-full">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="flex items-center gap-2 text-xl">
                            <CalendarIcon className="w-5 h-5 text-primary" />
                            {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Details"}
                        </SheetTitle>
                        <SheetDescription>
                            {selectedMedicines.length > 0
                                ? `${selectedMedicines.length} medicine(s) expiring on this date.`
                                : "No medicines expiring on this date."}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-120px)] pr-2">
                        {selectedMedicines.length > 0 ? (
                            selectedMedicines.map((med) => (
                                <div key={med.id} className="p-4 rounded-xl border bg-card hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-lg">{med.medicineName}</h4>
                                        {getStatusBadge(med.expiryDate)}
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                                        <div className="text-muted-foreground">Batch Number</div>
                                        <div className="font-mono text-right">{med.batchNumber}</div>

                                        <div className="text-muted-foreground">Quantity Remaining</div>
                                        <div className="text-right font-medium">{med.quantity} units</div>

                                        <div className="text-muted-foreground">Expiry Date</div>
                                        <div className="text-right">{format(med.expiryDate, "dd MMM yyyy")}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                <div className="bg-muted/50 p-4 rounded-full mb-3">
                                    <CalendarIcon className="w-8 h-8 opacity-50" />
                                </div>
                                <p>No expiries scheduled for this day.</p>
                                <p className="text-xs mt-1 opacity-70">Select a date with a colored dot to see details.</p>
                            </div>
                        )}

                        <div className="mt-4 pt-4 border-t">
                            <Button className="w-full" variant="outline" onClick={() => setIsSheetOpen(false)}>
                                Close Details
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </DashboardLayout>
    );
};

export default CalendarPage;
