import { Trophy, Flame, Percent, CheckCircle2 } from "lucide-react";
import { WeeklyChart } from "@/components/analytics/weekly-chart";
import { DatabaseSetup } from "@/components/dashboard/database-setup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalytics } from "@/lib/queries/habits";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const data = await getAnalytics().catch(() => null);
  if (!data) return <DatabaseSetup />;
  const metrics = [
    { label: "Current streak", value: Math.max(0, ...data.habits.map((row) => row.currentStreak)), icon: Flame },
    { label: "Longest streak", value: data.longestStreak, icon: Trophy },
    { label: "Completion rate", value: `${data.monthRate}%`, icon: Percent },
    { label: "Habits completed", value: data.totalCompletions, icon: CheckCircle2 }
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">Progress</p>
        <h1 className="text-3xl font-semibold">Analytics</h1>
      </header>
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
          <CardHeader><CardTitle>Last 7 days</CardTitle></CardHeader>
          <CardContent><WeeklyChart data={data.weekly} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>August</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Successful days</span><strong>{data.successfulDays}</strong></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Missed days</span><strong>{data.missedDays}</strong></div>
            <div className="flex justify-between"><span className="text-muted-foreground">vs previous month</span><strong>{data.monthDelta >= 0 ? "+" : ""}{data.monthDelta}%</strong></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
