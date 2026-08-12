import Link from "next/link";
import { BarChart3, CalendarDays, Home, Plus, UserCircle } from "lucide-react";

const items = [
  { href: "/today", label: "Today", icon: Home },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/habits/new", label: "Add", icon: Plus, featured: true },
  { href: "/analytics", label: "Stats", icon: BarChart3 },
  { href: "/settings", label: "Profile", icon: UserCircle }
];

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur lg:hidden" aria-label="Mobile navigation">
      <div className="mx-auto grid max-w-md grid-cols-5 items-end gap-1">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
            <span className={item.featured ? "grid size-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm" : ""}>
              <item.icon className="size-5" />
            </span>
            {!item.featured && <span>{item.label}</span>}
          </Link>
        ))}
      </div>
    </nav>
  );
}
