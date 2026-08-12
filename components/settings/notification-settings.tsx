"use client";

import { Bell, BellOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function NotificationSettings() {
  const [enabled, setEnabled] = useState(() =>
    typeof window === "undefined" ? false : window.localStorage.getItem("habitly-reminders") === "enabled"
  );
  const [supported, setSupported] = useState(() =>
    typeof window === "undefined" ? true : "Notification" in window && "serviceWorker" in navigator
  );

  useEffect(() => {
    const sync = () => {
      setSupported("Notification" in window && "serviceWorker" in navigator);
      setEnabled(window.localStorage.getItem("habitly-reminders") === "enabled");
    };
    window.addEventListener("habitly-reminders-change", sync);
    return () => window.removeEventListener("habitly-reminders-change", sync);
  }, []);

  async function enable() {
    if (!supported) {
      toast.error("Notifications are not supported in this browser");
      return;
    }

    const registration = await navigator.serviceWorker.register("/sw.js");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      toast.error("Notifications were not enabled");
      return;
    }

    window.localStorage.setItem("habitly-reminders", "enabled");
    setEnabled(true);
    window.dispatchEvent(new Event("habitly-reminders-change"));
    registration.active?.postMessage({
      type: "SHOW_HABIT_REMINDER",
      body: "Reminders are on. Habitly will nudge you daily."
    });
    toast.success("Daily reminders enabled");
  }

  function disable() {
    window.localStorage.removeItem("habitly-reminders");
    setEnabled(false);
    window.dispatchEvent(new Event("habitly-reminders-change"));
    toast.success("Daily reminders disabled");
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-muted text-primary">
          {enabled ? <Bell className="size-5" /> : <BellOff className="size-5" />}
        </span>
        <div className="min-w-0">
          <div className="font-medium">Daily habit reminder</div>
          <div className="text-sm text-muted-foreground">
            {enabled ? "Habitly will use the reminder time set on each habit." : "Enable mobile browser reminders for today's habits."}
          </div>
        </div>
      </div>
      <Button type="button" variant={enabled ? "outline" : "default"} onClick={enabled ? disable : enable}>
        {enabled ? "Turn off" : "Enable"}
      </Button>
    </div>
  );
}
