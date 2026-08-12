import Link from "next/link";
import { restoreHabit } from "@/lib/actions/habits";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DatabaseSetup } from "@/components/dashboard/database-setup";
import { getHabits } from "@/lib/queries/habits";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const rows = await getHabits("archived").catch(() => null);
  if (!rows) return <DatabaseSetup />;
  return (
    <div className="space-y-6">
      <header><p className="text-sm text-muted-foreground">Manage</p><h1 className="text-3xl font-semibold">Archive</h1></header>
      <div className="grid gap-3">
        {rows.map(({ habit }) => {
          const action = restoreHabit.bind(null, habit.id);
          return (
            <Card key={habit.id}><CardContent className="flex items-center justify-between gap-4 p-4">
              <Link href={`/habits/${habit.id}`} className="font-medium">{habit.name}</Link>
              <form action={action}><Button variant="outline">Restore</Button></form>
            </CardContent></Card>
          );
        })}
      </div>
      {!rows.length && <Card><CardContent className="p-8 text-center text-muted-foreground">Archived habits will appear here.</CardContent></Card>}
    </div>
  );
}
