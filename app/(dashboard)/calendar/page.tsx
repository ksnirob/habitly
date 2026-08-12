import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { DatabaseSetup } from "@/components/dashboard/database-setup";
import { getCalendarData } from "@/lib/queries/habits";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const days = await getCalendarData().catch(() => null);
  if (!days) return <DatabaseSetup />;
  const leadingBlanks = days.length ? (days[0].day.getDay() + 6) % 7 : 0;
  const completedDays = days.filter((day) => day.rate === 100 && day.scheduled.length).length;
  const activeDays = days.filter((day) => day.scheduled.length).length;

  return (
    <div className="space-y-6">
      <header className="text-center sm:text-left">
        <p className="text-sm text-muted-foreground">Month view</p>
        <h1 className="text-3xl font-semibold">{format(new Date(), "MMMM yyyy")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{completedDays} perfect days out of {activeDays} active days</p>
      </header>

      <Card>
        <CardContent className="p-2 sm:p-5">
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase text-muted-foreground sm:gap-2 sm:text-xs sm:normal-case">
            {[
              ["M", "Mon"],
              ["T", "Tue"],
              ["W", "Wed"],
              ["T", "Thu"],
              ["F", "Fri"],
              ["S", "Sat"],
              ["S", "Sun"]
            ].map(([short, full]) => (
              <div key={full}>
                <span className="sm:hidden">{short}</span>
                <span className="hidden sm:inline">{full}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1 sm:gap-2">
            {Array.from({ length: leadingBlanks }, (_, index) => (
              <div key={`blank-${index}`} aria-hidden className="min-h-16 rounded-lg border border-transparent sm:min-h-24" />
            ))}
            {days.map((day) => (
              <button
                key={day.day.toISOString()}
                className="min-h-16 rounded-lg border bg-background p-1.5 text-left transition hover:border-primary sm:min-h-24 sm:p-3"
                aria-label={`${format(day.day, "MMMM d")} ${day.rate}% complete`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="text-sm font-semibold leading-none sm:text-base">{format(day.day, "d")}</span>
                  <span className="hidden text-xs text-muted-foreground sm:inline">{day.scheduled.length ? `${day.completedCount}/${day.scheduled.length}` : "Off"}</span>
                </div>
                <div className="mt-3 flex justify-center gap-0.5 sm:mt-4 sm:justify-start sm:gap-1">
                  {Array.from({ length: Math.min(5, Math.max(day.scheduled.length, 1)) }, (_, index) => (
                    <span
                      key={index}
                      className={`h-3 w-0.5 rounded-full sm:size-1.5 ${day.scheduled.length && index < day.completedCount ? "bg-primary" : "bg-muted"}`}
                    />
                  ))}
                </div>
                <div className="mt-2 text-center text-[10px] text-muted-foreground sm:text-left sm:text-xs">{day.scheduled.length ? `${day.rate}%` : "Off"}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
