import {
  Apple,
  BookOpen,
  Brain,
  Circle,
  Code,
  Coffee,
  Dumbbell,
  Footprints,
  Heart,
  Moon,
  type LucideIcon,
  Wallet,
  Droplets,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  Apple,
  BookOpen,
  Brain,
  Circle,
  Code,
  Coffee,
  Droplets,
  Dumbbell,
  Footprints,
  Heart,
  Moon,
  User,
  Wallet
};

export function IconBadge({ name, className }: { name?: string | null; className?: string }) {
  const Icon = icons[name ?? "Circle"] ?? Circle;
  return (
    <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-primary", className)} aria-hidden="true">
      <Icon className="size-5" />
    </span>
  );
}

export const habitIconNames = Object.keys(icons);
