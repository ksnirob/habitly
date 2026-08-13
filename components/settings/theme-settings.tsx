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
    <div className="grid grid-cols-3 gap-1 rounded-lg border bg-background p-1">
      {themes.map(({ value, label, Icon }) => (
        <Button
          key={value}
          type="button"
          variant="ghost"
          onClick={() => setTheme(value)}
          className={cn(
            "h-11 min-h-11 rounded-md px-2 text-xs sm:text-sm",
            theme === value && "bg-primary text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground"
          )}
          aria-pressed={theme === value}
        >
          <Icon className="size-4" />
          <span>{label}</span>
        </Button>
      ))}
    </div>
  );
}
