"use client";

import { useActionState } from "react";
import type { Category, Habit } from "@prisma/client";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColorPicker, IconPicker } from "@/components/forms/visual-pickers";

const days = [
  ["1", "M"],
  ["2", "T"],
  ["3", "W"],
  ["4", "T"],
  ["5", "F"],
  ["6", "S"],
  ["0", "S"]
];

type State = { ok: boolean; message?: string } | undefined;

export function HabitForm({
  action,
  categories,
  habit,
  submitLabel = "Save habit"
}: {
  action: (state: State, formData: FormData) => Promise<State>;
  categories: Category[];
  habit?: Habit;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const reminderEnabled =
    "reminderEnabled" in (habit ?? {}) ? Boolean((habit as Habit & { reminderEnabled?: boolean }).reminderEnabled) : true;
  const reminderTime = "reminderTime" in (habit ?? {}) ? (habit as Habit & { reminderTime?: string | null }).reminderTime ?? "09:00" : "09:00";

  return (
    <form action={formAction} className="space-y-6">
      {state?.message && <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{state.message}</p>}
      <section className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-medium">Habit name</span>
          <input name="name" required defaultValue={habit?.name} className="h-11 w-full rounded-lg border bg-card px-3" placeholder="Read 20 minutes" />
        </label>
        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-medium">Description</span>
          <textarea name="description" defaultValue={habit?.description ?? ""} className="min-h-24 w-full rounded-lg border bg-card px-3 py-2" placeholder="What makes this habit worth doing?" />
        </label>
        <IconPicker defaultValue={habit?.icon ?? "BookOpen"} />
        <ColorPicker defaultValue={habit?.color ?? "emerald"} />
        <label className="space-y-2">
          <span className="text-sm font-medium">Category</span>
          <select name="categoryId" defaultValue={habit?.categoryId ?? ""} className="h-11 w-full rounded-lg border bg-card px-3">
            <option value="">Personal</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Goal type</span>
          <select name="goalType" defaultValue={habit?.goalType ?? "BOOLEAN"} className="h-11 w-full rounded-lg border bg-card px-3">
            <option value="BOOLEAN">Complete once</option>
            <option value="NUMBER">Number</option>
            <option value="DURATION">Duration</option>
            <option value="DISTANCE">Distance</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Target</span>
          <input name="targetValue" type="number" min="1" defaultValue={habit?.targetValue ?? 1} className="h-11 w-full rounded-lg border bg-card px-3" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Unit</span>
          <input name="unit" defaultValue={habit?.unit ?? ""} className="h-11 w-full rounded-lg border bg-card px-3" placeholder="minutes, pages, km" />
        </label>
      </section>
      <section className="space-y-4">
        <label className="space-y-2">
          <span className="text-sm font-medium">Schedule</span>
          <select name="frequency" defaultValue={habit?.frequency ?? "DAILY"} className="h-11 w-full rounded-lg border bg-card px-3">
            <option value="DAILY">Every day</option>
            <option value="WEEKDAYS">Weekdays</option>
            <option value="WEEKENDS">Weekends</option>
            <option value="CUSTOM">Specific days</option>
            <option value="WEEKLY">X times per week</option>
          </select>
        </label>
        <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
          {days.map(([value, label]) => (
            <label key={value} className="relative grid size-11 place-items-center rounded-full border bg-card text-sm transition has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground">
              <input type="checkbox" name="weekdays" value={value} defaultChecked={habit?.weekdays.includes(Number(value))} className="peer sr-only" />
              <span className="peer-checked:opacity-0">{label}</span>
              <Check className="absolute size-4 opacity-0 peer-checked:opacity-100" />
            </label>
          ))}
        </div>
        <div className="grid gap-3 rounded-lg border bg-card p-3 sm:grid-cols-[minmax(0,1fr)_10rem] sm:items-center">
          <label className="flex min-h-12 items-center gap-3">
            <input type="checkbox" name="reminderEnabled" defaultChecked={reminderEnabled} className="peer sr-only" />
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted text-primary transition peer-checked:bg-primary peer-checked:text-primary-foreground">
              <Bell className="size-4 peer-checked:hidden" />
              <Check className="hidden size-4 peer-checked:block" />
            </span>
            <span>
              <span className="block text-sm font-medium">Habit reminder</span>
              <span className="block text-xs text-muted-foreground">Show a mobile notification for this habit.</span>
            </span>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">When</span>
            <input name="reminderTime" type="time" defaultValue={reminderTime} className="h-11 w-full rounded-lg border bg-background px-3" />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium">Start date</span>
            <input name="startDate" type="date" defaultValue={(habit?.startDate ?? new Date()).toISOString().slice(0, 10)} className="h-11 w-full rounded-lg border bg-card px-3" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">End date</span>
            <input name="endDate" type="date" defaultValue={habit?.endDate?.toISOString().slice(0, 10)} className="h-11 w-full rounded-lg border bg-card px-3" />
          </label>
        </div>
      </section>
      <Button disabled={pending}>{pending ? "Saving..." : submitLabel}</Button>
    </form>
  );
}
