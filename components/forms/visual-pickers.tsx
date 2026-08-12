"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { IconBadge, habitIconNames } from "@/components/habits/icon-badge";
import { cn } from "@/lib/utils";

export const colorOptions = [
  { value: "emerald", label: "Emerald", className: "bg-emerald-500" },
  { value: "sky", label: "Sky", className: "bg-sky-500" },
  { value: "rose", label: "Rose", className: "bg-rose-500" },
  { value: "amber", label: "Amber", className: "bg-amber-500" },
  { value: "violet", label: "Violet", className: "bg-violet-500" },
  { value: "slate", label: "Slate", className: "bg-slate-500" }
];

export function IconPicker({ name = "icon", defaultValue = "BookOpen" }: { name?: string; defaultValue?: string }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={wrapperRef} className="relative space-y-2">
      <label className="text-sm font-medium" id={`${name}-label`}>
        Icon
      </label>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        aria-labelledby={`${name}-label`}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-11 w-full items-center justify-between rounded-lg border bg-card px-3 text-left"
      >
        <span className="flex min-w-0 items-center gap-2">
          <IconBadge name={value} className="size-8 rounded-md bg-muted" />
          <span className="truncate">{value}</span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-lg border bg-card p-1 shadow-lg">
          {habitIconNames.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => {
                setValue(icon);
                setOpen(false);
              }}
              className="flex min-h-10 w-full items-center justify-between rounded-md px-2 text-sm hover:bg-muted"
            >
              <span className="flex items-center gap-2">
                <IconBadge name={icon} className="size-8 rounded-md bg-muted" />
                {icon}
              </span>
              {value === icon && <Check className="size-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ColorPicker({ name = "color", defaultValue = "emerald" }: { name?: string; defaultValue?: string }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selected = colorOptions.find((color) => color.value === value) ?? colorOptions[0];

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={wrapperRef} className="relative space-y-2">
      <label className="text-sm font-medium" id={`${name}-label`}>
        Color
      </label>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        aria-labelledby={`${name}-label`}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-11 w-full items-center justify-between rounded-lg border bg-card px-3 text-left"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className={cn("size-5 shrink-0 rounded-full", selected.className)} />
          <span className="truncate">{selected.label}</span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 w-full rounded-lg border bg-card p-1 shadow-lg">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => {
                setValue(color.value);
                setOpen(false);
              }}
              className="flex min-h-10 w-full items-center justify-between rounded-md px-2 text-sm hover:bg-muted"
            >
              <span className="flex items-center gap-2">
                <span className={cn("size-5 rounded-full", color.className)} />
                {color.label}
              </span>
              {value === color.value && <Check className="size-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ColorSwatch({ value, className }: { value?: string | null; className?: string }) {
  const color = colorOptions.find((option) => option.value === value) ?? colorOptions.at(-1)!;
  return <span className={cn("inline-block size-2.5 rounded-full", color.className, className)} aria-hidden="true" />;
}
