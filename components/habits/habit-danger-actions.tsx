"use client";

import { Archive, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { archiveHabit, deleteHabit } from "@/lib/actions/habits";
import { Button } from "@/components/ui/button";

export function HabitDangerActions({ habitId, habitName }: { habitId: string; habitName: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            await archiveHabit(habitId);
            toast.success("Habit archived");
          });
        }}
      >
        <Archive className="size-4" />
        Archive
      </Button>
      <Button
        type="button"
        variant="destructive"
        disabled={pending}
        onClick={() => {
          if (!window.confirm(`Delete "${habitName}"? This permanently removes the habit and its history.`)) return;
          startTransition(async () => {
            await deleteHabit(habitId);
          });
        }}
      >
        <Trash2 className="size-4" />
        Delete
      </Button>
    </div>
  );
}
