import Link from "next/link";
import { Archive, BarChart3, CalendarDays, Folder, Home, ListChecks, Settings, Sparkles, UserCircle } from "lucide-react";

const primary = [
  { href: "/today", label: "Today", icon: Home },
  { href: "/habits", label: "Habits", icon: ListChecks },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/analytics", label: "Analytics", icon: BarChart3 }
];

const manage = [
  { href: "/categories", label: "Categories", icon: Folder },
  { href: "/archive", label: "Archive", icon: Archive }
];

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r bg-background/85 px-4 py-5 backdrop-blur lg:flex lg:flex-col">
      <Link href="/today" className="mb-8 flex items-center gap-3 rounded-lg px-2">
        <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="size-5" />
        </span>
        <span>
          <span className="block font-semibold">Habitly</span>
          <span className="text-xs text-muted-foreground">One day at a time</span>
        </span>
      </Link>
      <nav className="space-y-1" aria-label="Main navigation">
        {primary.map((item) => (
          <Link key={item.href} href={item.href} className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-8 text-xs font-medium uppercase text-muted-foreground">Manage</div>
      <nav className="mt-2 space-y-1" aria-label="Management navigation">
        {manage.map((item) => (
          <Link key={item.href} href={item.href} className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto space-y-1 border-t pt-4">
        <Link href="/settings" className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
          <Settings className="size-4" />
          Settings
        </Link>
        <div className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm">
          <UserCircle className="size-8 text-muted-foreground" />
          <span>
            <span className="block font-medium">Khaled</span>
            <span className="text-xs text-muted-foreground">Demo workspace</span>
          </span>
        </div>
      </div>
    </aside>
  );
}
