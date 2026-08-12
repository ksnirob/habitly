import { format } from "date-fns";
import Link from "next/link";
import { Plus } from "lucide-react";
import { HabitRow } from "@/components/habits/habit-row";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { DatabaseSetup } from "@/components/dashboard/database-setup";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTodayDashboard } from "@/lib/queries/habits";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const data = await getTodayDashboard().catch(() => null);
  if (!data) return <DatabaseSetup />;
  const firstName = data.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{format(data.date, "EEEE, MMMM d")}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">Good morning, {firstName}</h1>
            <p className="mt-2 text-muted-foreground">Small steps, every day.</p>
          </div>
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/habits/new"><Plus className="size-4" /> New habit</Link>
          </Button>
        </header>
        <Card>
          <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
            <ProgressRing value={data.progress} />
            <div className="flex-1">
              <h2 className="text-lg font-semibold">Daily Progress</h2>
              <p className="mt-1 text-muted-foreground">{data.completedCount} of {data.totalCount} completed</p>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${data.progress}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Today&apos;s Habits</h2>
          <span className="text-sm text-muted-foreground">{data.totalCount ? `${data.totalCount} scheduled` : "No habits scheduled"}</span>
        </div>
        {data.habits.length ? (
          <div className="grid gap-3">
            {data.habits.map((row) => (
              <HabitRow key={row.habit.id} habit={row.habit} completed={row.completed} streak={row.streak} value={row.entry?.value ?? (row.completed ? row.habit.targetValue : 0)} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold">No habits yet</h3>
              <p className="mt-2 text-muted-foreground">Start with one small habit and build from there.</p>
              <Button asChild className="mt-5"><Link href="/habits/new">Create your first habit</Link></Button>
            </CardContent>
          </Card>
        )}
      </section>
      <aside className="space-y-4">
        <Card>
          <CardHeader><CardTitle>This week</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-7 gap-2">
            {data.weekly.map((day) => (
              <div key={day.label} className="text-center">
                <div className="mb-2 text-xs text-muted-foreground">{day.label}</div>
                <div className="mx-auto flex h-24 w-8 items-end rounded-full bg-muted p-1">
                  <div className="w-full rounded-full bg-primary" style={{ height: `${Math.max(day.rate, 6)}%` }} />
                </div>
                <div className="mt-2 text-xs">{day.rate}%</div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Insight</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            You&apos;ve completed {data.weekly.at(-1)?.rate ?? 0}% of scheduled habits today.
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
