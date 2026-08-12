"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { createCategory } from "@/lib/actions/categories";
import { ColorPicker, IconPicker } from "@/components/forms/visual-pickers";
import { Button } from "@/components/ui/button";

export function CategoryForm() {
  const [state, formAction, pending] = useActionState(createCategory, undefined);

  useEffect(() => {
    if (!state?.message) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="grid gap-4 rounded-lg border bg-card p-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_220px_180px_auto]">
      <label className="space-y-2">
        <span className="text-sm font-medium">Name</span>
        <input name="name" required placeholder="Creative" className="h-11 w-full rounded-lg border bg-background px-3" />
      </label>
      <IconPicker defaultValue="Circle" />
      <ColorPicker defaultValue="slate" />
      <div className="flex items-end">
        <Button disabled={pending} className="w-full sm:w-auto">
          {pending ? "Adding..." : "Add"}
        </Button>
      </div>
    </form>
  );
}
