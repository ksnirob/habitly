import Link from "next/link";
import { format } from "date-fns";
import { Trophy, Flame, Percent, CheckCircle2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeeklyChart } from "@/components/analytics/weekly-chart";
import { DatabaseSetup } from "@/components/dashboard/database-setup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalytics } from "@/lib/queries/habits";
import { cn, percent } from "@/lib/utils";

export const dynamic = "force-dynamic";

const months = [
  ["1", "January"],
  ["2", "February"],
  ["3", "March"],
  ["4", "April"],
  ["5", "May"],
  ["6", "June"],
  ["7", "July"],
  ["8", "August"],
  ["9", "September"],
  ["10", "October"],
  ["11", "November"],
  ["12", "December"]
];

function selectedMonthDate(month?: string, year?: string) {
  const today = new Date();
  const parsedMonth = Number(month);
  const parsedYear = Number(year);
  const safeMonth = Number.isInteger(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12 ? parsedMonth : today.getMonth() + 1;
  const safeYear = Number.isInteger(parsedYear) && parsedYear >= 2000 && parsedYear <= today.getFullYear() + 1 ? parsedYear : today.getFullYear();
  return new Date(safeYear, safeMonth - 1, 1);
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: string; month?: string; year?: string }> }) {
  const params = await searchParams;
  const range = params.range === "monthly" ? "monthly" : "weekly";
  const selectedDate = selectedMonthDate(params.month, params.year);
  const selectedMonth = String(selectedDate.getMonth() + 1);
  const selectedYear = String(selectedDate.getFullYear());
  const currentYear = new Date().getFullYear();
  const firstYear = Math.min(Number(selectedYear), currentYear - 4);
  const lastYear = Math.max(Number(selectedYear), currentYear + 1);
  const yearOptions = Array.from({ length: lastYear - firstYear + 1 }, (_, index) => String(firstYear + index));
  const data = await getAnalytics(selectedDate).catch(() => null);
  if (!data) return <DatabaseSetup />;
  const weeklyRate = percent(data.weekly.reduce((sum, day) => sum + day.rate, 0), data.weekly.length * 100);
  const weeklySuccessfulDays = data.weekly.filter((day) => day.rate === 100).length;
  const weeklyMissedDays = data.weekly.filter((day) => day.rate === 0).length;
  const chartData = range === "monthly" ? data.monthDaily : data.weekly;
  const chartTitle = range === "monthly" ? format(data.monthStart, "MMMM yyyy") : "Last 7 days";
  const rangeRate = range === "monthly" ? data.monthRate : weeklyRate;
  const successfulDays = range === "monthly" ? data.successfulDays : weeklySuccessfulDays;
  const missedDays = range === "monthly" ? data.missedDays : weeklyMissedDays;
  const metrics = [
    { label: "Current streak", value: Math.max(0, ...data.habits.map((row) => row.currentStreak)), icon: Flame },
    { label: "Longest streak", value: data.longestStreak, icon: Trophy },
    { label: range === "monthly" ? "Monthly rate" : "Weekly rate", value: `${rangeRate}%`, icon: Percent },
    { label: "Habits completed", value: data.totalCompletions, icon: CheckCircle2 }
  ];
  const filters = [
    { label: "Weekly", href: "/analytics?range=weekly", active: range === "weekly" },
    { label: "Monthly", href: `/analytics?range=monthly&month=${selectedMonth}&year=${selectedYear}`, active: range === "monthly" }
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Progress</p>
          <h1 className="text-3xl font-semibold">Analytics</h1>
        </div>
        <nav className="grid grid-cols-2 rounded-lg border bg-card p-1 text-sm">
          {filters.map((filter) => (
            <Link
              key={filter.href}
              href={filter.href}
              className={cn(
                "rounded-md px-4 py-2 text-center font-medium text-muted-foreground transition",
                filter.active && "bg-primary text-primary-foreground shadow-sm"
              )}
            >
              {filter.label}
            </Link>
          ))}
        </nav>
      </header>
      {range === "monthly" && (
        <form action="/analytics" className="grid grid-cols-[minmax(0,1fr)_5.5rem_3rem] gap-2 rounded-lg border bg-card p-2 sm:grid-cols-[minmax(0,1fr)_140px_3rem]">
          <input type="hidden" name="range" value="monthly" />
          <label>
            <span className="sr-only">Month</span>
            <select name="month" defaultValue={selectedMonth} className="h-11 w-full rounded-lg border bg-background px-3 text-sm">
              {months.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Year</span>
            <select name="year" defaultValue={selectedYear} className="h-11 w-full rounded-lg border bg-background px-2 text-sm">
              {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </label>
          <Button aria-label="Apply month and year" title="Apply" className="px-0"><Check className="size-5" /></Button>
        </form>
      )}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <span className="grid size-11 place-items-center rounded-lg bg-muted"><metric.icon className="size-5 text-primary" /></span>
              <div><div className="text-2xl font-semibold">{metric.value}</div><div className="text-sm text-muted-foreground">{metric.label}</div></div>
            </CardContent>
          </Card>
        ))}
      </section>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader><CardTitle>{chartTitle}</CardTitle></CardHeader>
          <CardContent><WeeklyChart data={chartData} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{range === "monthly" ? "Monthly data" : "Weekly data"}</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Completion rate</span><strong>{rangeRate}%</strong></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Successful days</span><strong>{successfulDays}</strong></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Missed days</span><strong>{missedDays}</strong></div>
            {range === "monthly" && (
              <div className="flex justify-between"><span className="text-muted-foreground">vs previous month</span><strong>{data.monthDelta >= 0 ? "+" : ""}{data.monthDelta}%</strong></div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
