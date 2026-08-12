"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function WeeklyChart({ data }: { data: { label: string; rate: number }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} tickLine={false} axisLine={false} width={32} />
          <Tooltip cursor={{ fill: "hsl(var(--muted))" }} formatter={(value) => [`${value}%`, "Completion"]} />
          <Bar dataKey="rate" radius={[6, 6, 2, 2]} fill="hsl(var(--primary))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
