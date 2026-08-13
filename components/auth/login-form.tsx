"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Lock, Mail } from "lucide-react";
import { login } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

type State = { ok: boolean; message?: string } | undefined;

export function LoginForm() {
  const [state, formAction, pending] = useActionState<State, FormData>(login, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {state?.message && <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{state.message}</p>}
      <label className="space-y-2">
        <span className="text-sm font-medium">Email</span>
        <span className="relative block">
          <Mail className="pointer-events-none absolute left-3 top-3 size-5 text-muted-foreground" />
          <input name="email" type="email" autoComplete="email" required className="h-11 w-full rounded-lg border bg-background pl-10 pr-3" placeholder="Enter your email" />
        </span>
      </label>
      <label className="space-y-2">
        <span className="text-sm font-medium">Password</span>
        <span className="relative block">
          <Lock className="pointer-events-none absolute left-3 top-3 size-5 text-muted-foreground" />
          <input name="password" type="password" autoComplete="current-password" required className="h-11 w-full rounded-lg border bg-background pl-10 pr-3" placeholder="Password" />
        </span>
      </label>
      <div className="pt-3">
        <Button className="w-full" disabled={pending}>{pending ? "Signing in..." : "Sign in"}</Button>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        New here? <Link href="/register" className="font-medium text-primary hover:underline">Create an account</Link>
      </p>
    </form>
  );
}
