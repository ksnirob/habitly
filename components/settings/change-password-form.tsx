"use client";

import { useActionState } from "react";
import { Lock } from "lucide-react";
import { changePassword } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

type State = { ok: boolean; message?: string } | undefined;

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState<State, FormData>(changePassword, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {state?.message && (
        <p className={`rounded-lg border p-3 text-sm ${state.ok ? "border-primary/30 bg-primary/10 text-primary" : "border-destructive/30 bg-destructive/10 text-destructive"}`}>
          {state.message}
        </p>
      )}
      {[
        ["currentPassword", "Current password", "current-password"],
        ["newPassword", "New password", "new-password"],
        ["confirmPassword", "Confirm new password", "new-password"]
      ].map(([name, label, autoComplete]) => (
        <label key={name} className="space-y-2">
          <span className="text-sm font-medium">{label}</span>
          <span className="relative block">
            <Lock className="pointer-events-none absolute left-3 top-3 size-5 text-muted-foreground" />
            <input
              name={name}
              type="password"
              autoComplete={autoComplete}
              required
              className="h-11 w-full rounded-lg border bg-background pl-10 pr-3"
              placeholder={label}
            />
          </span>
        </label>
      ))}
      <div className="pt-3">
        <Button type="submit" variant="outline" disabled={pending}>{pending ? "Updating..." : "Change password"}</Button>
      </div>
    </form>
  );
}
