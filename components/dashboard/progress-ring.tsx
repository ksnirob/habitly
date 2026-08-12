import { cn } from "@/lib/utils";

export function ProgressRing({ value, className }: { value: number; className?: string }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={cn("relative grid size-28 place-items-center", className)}>
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={radius} className="fill-none stroke-muted" strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          className="fill-none stroke-primary transition-all duration-300"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-2xl font-semibold">{value}%</span>
    </div>
  );
}
