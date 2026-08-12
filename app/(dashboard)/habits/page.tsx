import Link from "next/link";
import { Archive, Bell, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DatabaseSetup } from "@/components/dashboard/database-setup";
import { Progress } from "@/components/ui/progress";
import { getHabits } from "@/lib/queries/habits";

export const dynamic = "force-dynamic";

export default async function HabitsPage({ searchParams }: { searchParams: Promise<{ filter?: string; q?: string }> }) {
  const params = await searchParams;
  const rows = await getHabits(params.filter ?? "active", params.q ?? "").catch(() => null);
  if (!rows) return <DatabaseSetup />;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Manage</p>
          <h1 className="text-3xl font-semibold">Habits</h1>
        </div>
        <Button asChild><Link href="/habits/new"><Plus className="size-4" /> New habit</Link></Button>
      </header>
      <form className="flex flex-col gap-3 sm:flex-row" action="/habits">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-3 size-5 text-muted-foreground" />
          <input name="q" defaultValue={params.q} placeholder="Search habits or categories" className="h-11 w-full rounded-lg border bg-card pl-10 pr-3" />
        </label>
        <select name="filter" defaultValue={params.filter ?? "active"} className="h-11 rounded-lg border bg-card px-3">
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        <Button variant="secondary">Filter</Button>
      </form>
      <div className="grid gap-3 md:grid-cols-2">
        {rows.map(({ habit, currentStreak, completionRate }) => (
          <Link key={habit.id} href={`/habits/${habit.id}`} className="block">
            <Card className="transition hover:border-primary/40">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-medium">{habit.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{habit.category?.name ?? "Personal"} · {habit.frequency.toLowerCase()}</p>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {habit.reminderEnabled && habit.reminderTime && <Bell className="size-4" aria-label={`Reminder at ${habit.reminderTime}`} />}
                    {habit.isArchived && <Archive className="size-4" />}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span>{currentStreak} day streak</span>
                  <span>{completionRate}%</span>
                </div>
                <Progress value={completionRate} className="mt-2" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      {!rows.length && <Card><CardContent className="p-8 text-center text-muted-foreground">No habits match this view.</CardContent></Card>}
    </div>
  );
}
