import { subDays } from "date-fns";
import type { HabitEntry } from "@prisma/client";
import { dayKey, eachLocalDay } from "@/lib/dates/local-day";
import { cn, percent } from "@/lib/utils";

export function Heatmap({ entries, targetValue }: { entries: HabitEntry[]; targetValue: number }) {
  const today = new Date();
  const days = eachLocalDay(subDays(today, 364), today);
  const byDate = new Map(entries.map((entry) => [dayKey(entry.date), entry]));
  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid w-max grid-flow-col grid-rows-7 gap-1" aria-label="Yearly completion heatmap">
        {days.map((day) => {
          const entry = byDate.get(dayKey(day));
          const rate = entry?.completed ? 100 : percent(entry?.value ?? 0, targetValue);
          return (
            <div
              key={dayKey(day)}
              title={`${day.toLocaleDateString()}: ${rate}%`}
              className={cn(
                "size-3 rounded-sm border border-transparent",
                rate === 0 && "bg-muted",
                rate > 0 && rate < 50 && "bg-primary/30",
                rate >= 50 && rate < 100 && "bg-primary/60",
                rate >= 100 && "bg-primary"
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
