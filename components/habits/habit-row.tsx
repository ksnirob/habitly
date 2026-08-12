"use client";

import { Minus, Plus, Check } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { toggleHabitCompletion } from "@/lib/actions/habits";
import { Button } from "@/components/ui/button";
import { IconBadge } from "@/components/habits/icon-badge";
import { Progress } from "@/components/ui/progress";
import type { HabitWithRelations } from "@/types/habit";
import { percent } from "@/lib/utils";

type Props = {
  habit: HabitWithRelations;
  completed: boolean;
  streak: number;
  value: number;
};

export function HabitRow({ habit, completed, streak, value }: Props) {
  const [pending, startTransition] = useTransition();
  const [state, setOptimistic] = useOptimistic({ completed, value }, (current, next: Partial<{ completed: boolean; value: number }>) => ({
    ...current,
    ...next
  }));
  const isBinary = habit.goalType === "BOOLEAN";
  const progress = percent(state.value, habit.targetValue);

  function update(nextValue?: number) {
    const optimisticValue = nextValue ?? habit.targetValue;
    setOptimistic({ value: optimisticValue, completed: optimisticValue >= habit.targetValue || (isBinary ? !state.completed : state.completed) });
    startTransition(async () => {
      const result = await toggleHabitCompletion(habit.id, nextValue);
      if (!result.ok) toast.error(result.message);
      else toast.success(result.message);
    });
  }

  return (
    <article className="rounded-lg border bg-card p-4 shadow-sm transition hover:border-primary/35">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => update()}
          disabled={pending}
          className="grid size-11 shrink-0 place-items-center rounded-full border bg-background text-primary transition hover:bg-primary hover:text-primary-foreground"
          aria-label={state.completed ? `Undo ${habit.name}` : `Complete ${habit.name}`}
        >
          {state.completed ? <Check className="size-5" /> : <span className="size-3 rounded-full border border-current" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-medium">{habit.name}</h3>
              <p className="text-sm text-muted-foreground">{habit.category?.name ?? "Personal"} · {streak} day streak</p>
            </div>
            <IconBadge name={habit.icon} className="size-9 rounded-full" />
          </div>
          {!isBinary && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{state.value} / {habit.targetValue} {habit.unit}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="icon" aria-label={`Decrease ${habit.name}`} onClick={() => update(Math.max(0, state.value - 1))}>
                  <Minus className="size-4" />
                </Button>
                <Button type="button" variant="outline" size="icon" aria-label={`Increase ${habit.name}`} onClick={() => update(state.value + 1)}>
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
