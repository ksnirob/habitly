"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const themes = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor }
] as const;

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {themes.map(({ value, label, Icon }) => (
        <Button
          key={value}
          type="button"
          variant="outline"
          onClick={() => setTheme(value)}
          className={cn("min-h-20 justify-start p-4", theme === value && "border-primary bg-primary/10")}
          aria-pressed={theme === value}
        >
          <Icon className="size-5 text-primary" />
          {label}
        </Button>
      ))}
    </div>
  );
}
