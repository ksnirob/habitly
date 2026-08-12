"use client";

import Link from "next/link";
import { Archive, BarChart3, CalendarDays, Ellipsis, Folder, Home, ListChecks, Plus, Settings } from "lucide-react";
import { useState } from "react";

const items = [
  { href: "/today", label: "Today", icon: Home },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/habits/new", label: "Add habit", icon: Plus, featured: true },
  { href: "/analytics", label: "Stats", icon: BarChart3 }
];

const moreItems = [
  { href: "/habits", label: "Habits", icon: ListChecks },
  { href: "/categories", label: "Categories", icon: Folder },
  { href: "/archive", label: "Archive", icon: Archive },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur lg:hidden" aria-label="Mobile navigation">
      {open && (
        <div className="mx-auto mb-2 grid max-w-md grid-cols-4 gap-2 rounded-lg border bg-card p-2 shadow-lg">
          {moreItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label={item.label}
              title={item.label}
            >
              <item.icon className="size-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}
      <div className="mx-auto grid max-w-md grid-cols-5 items-center gap-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label={item.label}
            title={item.label}
          >
            <span className={item.featured ? "grid size-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm" : ""}>
              <item.icon className="size-5" />
            </span>
            {!item.featured && <span className="leading-none">{item.label}</span>}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-expanded={open}
          aria-label="More menu"
          title="More"
        >
          <Ellipsis className="size-5" />
          <span className="leading-none">More</span>
        </button>
      </div>
    </nav>
  );
}
