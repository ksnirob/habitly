import { HabitForm } from "@/components/forms/habit-form";
import { DatabaseSetup } from "@/components/dashboard/database-setup";
import { Card, CardContent } from "@/components/ui/card";
import { createHabit } from "@/lib/actions/habits";
import { getCategories } from "@/lib/queries/habits";

export const dynamic = "force-dynamic";

export default async function NewHabitPage() {
  const categories = await getCategories().catch(() => null);
  if (!categories) return <DatabaseSetup />;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">Habits</p>
        <h1 className="text-3xl font-semibold">New Habit</h1>
      </header>
      <Card><CardContent className="p-5"><HabitForm action={createHabit} categories={categories} submitLabel="Create habit" /></CardContent></Card>
    </div>
  );
}
