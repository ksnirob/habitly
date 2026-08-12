import { describe, expect, it } from "vitest";
import { subDays } from "date-fns";
import { startOfLocalDay } from "../lib/dates/local-day";
import { habitScheduledForDate } from "../lib/habits/schedule";
import { currentStreak, longestStreak } from "../lib/habits/streaks";

const monday = startOfLocalDay(new Date("2026-08-10T12:00:00"));

const daily = {
  frequency: "DAILY" as const,
  weekdays: [],
  startDate: subDays(monday, 10),
  endDate: null,
  targetValue: 1
};

describe("habit schedule and streak logic", () => {
  it("schedules daily habits every day", () => {
    expect(habitScheduledForDate(daily, monday)).toBe(true);
    expect(habitScheduledForDate(daily, subDays(monday, 1))).toBe(true);
  });

  it("does not schedule custom weekdays on off days", () => {
    const habit = { ...daily, frequency: "CUSTOM" as const, weekdays: [1, 3, 5] };
    expect(habitScheduledForDate(habit, monday)).toBe(true);
    expect(habitScheduledForDate(habit, new Date("2026-08-11T12:00:00"))).toBe(false);
  });

  it("current streak stops at a missed scheduled day", () => {
    const entries = [
      { date: monday, completed: true, value: 1 },
      { date: subDays(monday, 1), completed: false, value: 0 },
      { date: subDays(monday, 2), completed: true, value: 1 }
    ];
    expect(currentStreak(daily, entries, monday)).toBe(1);
  });

  it("custom streak ignores unscheduled days", () => {
    const habit = { ...daily, frequency: "CUSTOM" as const, weekdays: [1, 3, 5] };
    const friday = new Date("2026-08-07T12:00:00");
    const entries = [
      { date: monday, completed: true, value: 1 },
      { date: friday, completed: true, value: 1 }
    ];
    expect(currentStreak(habit, entries, monday)).toBe(2);
  });

  it("calculates longest streak", () => {
    const entries = [
      { date: subDays(monday, 3), completed: true, value: 1 },
      { date: subDays(monday, 2), completed: true, value: 1 },
      { date: subDays(monday, 1), completed: false, value: 0 },
      { date: monday, completed: true, value: 1 }
    ];
    expect(longestStreak(daily, entries, subDays(monday, 3), monday)).toBe(2);
  });
});
