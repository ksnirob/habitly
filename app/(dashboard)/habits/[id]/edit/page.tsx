import { notFound } from "next/navigation";
import { HabitForm } from "@/components/forms/habit-form";
import { DatabaseSetup } from "@/components/dashboard/database-setup";
import { Card, CardContent } from "@/components/ui/card";
import { updateHabit } from "@/lib/actions/habits";
import { getCategories, getHabitDetail } from "@/lib/queries/habits";

export const dynamic = "force-dynamic";

export default async function EditHabitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [detail, categories] = await Promise.all([getHabitDetail(id), getCategories()]).catch(() => [undefined, undefined] as const);
  if (detail === undefined || categories === undefined) return <DatabaseSetup />;
  if (!detail) notFound();
  const action = updateHabit.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">Edit habit</p>
        <h1 className="text-3xl font-semibold">{detail.habit.name}</h1>
      </header>
      <Card><CardContent className="p-5"><HabitForm action={action} categories={categories} habit={detail.habit} /></CardContent></Card>
    </div>
  );
}
