
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday as dateFnsIsToday } from "date-fns";
import { DateCard } from "./DateCard";
import { Medicine } from "@/data/calendarData";

interface CalendarGridProps {
    currentDate: Date;
    allMedicines: Medicine[];
    onDateClick: (date: Date) => void;
    selectedDate: Date | null;
}

export const CalendarGrid = ({ currentDate, allMedicines, onDateClick, selectedDate }: CalendarGridProps) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return (
        <div className="w-full">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 mb-2">
                {weekDays.map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2">
                {days.map((day) => {
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const dayMedicines = allMedicines.filter((med) => isSameDay(med.expiryDate, day));
                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                    const isToday = dateFnsIsToday(day);

                    return (
                        <div key={day.toISOString()} className={!isCurrentMonth ? "opacity-40" : ""}>
                            <DateCard
                                date={day}
                                medicines={dayMedicines}
                                onClick={onDateClick}
                                isSelected={isSelected}
                                isToday={isToday}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
