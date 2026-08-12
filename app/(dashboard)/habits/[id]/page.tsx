import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Edit } from "lucide-react";
import { addHabitNote } from "@/lib/actions/habits";
import { HabitDangerActions } from "@/components/habits/habit-danger-actions";
import { Button } from "@/components/ui/button";
import { DatabaseSetup } from "@/components/dashboard/database-setup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heatmap } from "@/components/analytics/heatmap";
import { getHabitDetail } from "@/lib/queries/habits";

export const dynamic = "force-dynamic";

export default async function HabitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getHabitDetail(id).catch(() => undefined);
  if (data === undefined) return <DatabaseSetup />;
  if (!data) notFound();
  const { habit } = data;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{habit.category?.name ?? "Personal"}</p>
          <h1 className="text-3xl font-semibold">{habit.name}</h1>
          <p className="mt-2 text-muted-foreground">{data.currentStreak} day streak · {data.completionRate}% completion</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link href={`/habits/${habit.id}/edit`}><Edit className="size-4" /> Edit</Link></Button>
          <HabitDangerActions habitId={habit.id} habitName={habit.name} />
        </div>
      </header>
      <section className="grid gap-3 sm:grid-cols-4">
        {[
          [data.currentStreak, "Current streak"],
          [data.longestStreak, "Longest streak"],
          [`${data.completionRate}%`, "Completion rate"],
          [data.totalCompletions, "Total completions"]
        ].map(([value, label]) => (
          <Card key={label}><CardContent className="p-4"><div className="text-2xl font-semibold">{value}</div><div className="text-sm text-muted-foreground">{label}</div></CardContent></Card>
        ))}
      </section>
      <Card>
        <CardHeader><CardTitle>Yearly History</CardTitle></CardHeader>
        <CardContent><Heatmap entries={habit.entries} targetValue={habit.targetValue} /></CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <form action={addHabitNote} className="space-y-3">
              <input type="hidden" name="habitId" value={habit.id} />
              <input type="date" name="date" defaultValue={new Date().toISOString().slice(0, 10)} className="h-11 w-full rounded-lg border bg-card px-3" />
              <textarea name="content" required maxLength={500} placeholder="Add a short note" className="min-h-24 w-full rounded-lg border bg-card px-3 py-2" />
              <Button>Add note</Button>
            </form>
            {habit.notes?.map((note) => (
              <div key={note.id} className="rounded-lg border p-3 text-sm">
                <div className="mb-1 text-xs text-muted-foreground">{format(note.date, "MMM d, yyyy")}</div>
                {note.content}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Schedule</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {habit.frequency.toLowerCase()} · target {habit.targetValue} {habit.unit ?? "completion"} · since {format(habit.startDate, "MMM d, yyyy")}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
