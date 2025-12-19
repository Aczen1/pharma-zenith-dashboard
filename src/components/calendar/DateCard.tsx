
import { format, isSameDay, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Medicine } from "@/data/calendarData";

interface DateCardProps {
    date: Date;
    medicines: Medicine[];
    onClick: (date: Date) => void;
    isSelected: boolean;
    isToday: boolean;
}

export const DateCard = ({ date, medicines, onClick, isSelected, isToday }: DateCardProps) => {
    const getStatusColor = (daysLeft: number) => {
        if (daysLeft <= 7) return "bg-red-500";
        if (daysLeft <= 30) return "bg-yellow-500";
        return "bg-green-500";
    };

    const getPriorityColor = () => {
        let hasCritical = false;
        let hasUpcoming = false;
        let hasSafe = false;

        medicines.forEach((med) => {
            const daysLeft = differenceInDays(med.expiryDate, new Date());
            if (daysLeft <= 7) hasCritical = true;
            else if (daysLeft <= 30) hasUpcoming = true;
            else hasSafe = true;
        });

        if (hasCritical) return "bg-red-500";
        if (hasUpcoming) return "bg-yellow-500";
        if (hasSafe) return "bg-green-500";
        return null;
    };

    const dotColor = getPriorityColor();
    const hasMedicines = medicines.length > 0;

    return (
        <div
            onClick={() => onClick(date)}
            className={cn(
                "relative h-28 p-2 rounded-xl border border-border/60 bg-card transition-all duration-200 cursor-pointer hover:shadow-md hover:border-primary/30 flex flex-col justify-start gap-1",
                isSelected && "ring-2 ring-primary/50 bg-primary/5",
                isToday && "bg-accent/30"
            )}
        >
            <div className="flex justify-between items-start">
                <span className={cn(
                    "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full",
                    isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}>
                    {format(date, "d")}
                </span>
                {dotColor && <div className={cn("h-2 w-2 rounded-full", dotColor)} />}
            </div>

            <div className="flex-1 overflow-hidden flex flex-col justify-center">
                {hasMedicines ? (
                    <div className="flex flex-col gap-0.5">
                        <div className="text-xs font-medium text-foreground truncate px-1 py-0.5 rounded bg-secondary/50">
                            {medicines[0].medicineName}
                        </div>
                        {medicines.length > 1 && (
                            <div className="text-[10px] text-muted-foreground font-medium pl-1">
                                +{medicines.length - 1} more
                            </div>
                        )}
                    </div>
                ) : (
                    null
                )}
            </div>
        </div>
    );
};
