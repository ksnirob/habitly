"use client";

import { Bell, BellOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function NotificationSettings() {
  const [nextReminder, setNextReminder] = useState<string | null>(null);
  const [pushReady, setPushReady] = useState(false);
  const [enabled, setEnabled] = useState(() =>
    typeof window === "undefined" ? false : window.localStorage.getItem("habitly-reminders") === "enabled"
  );
  const [supported, setSupported] = useState(() =>
    typeof window === "undefined" ? true : "Notification" in window && "serviceWorker" in navigator && "PushManager" in window
  );

  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = `${base64String}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  }

  useEffect(() => {
    async function loadNextReminder() {
      try {
        const response = await fetch("/api/reminders", { cache: "no-store" });
        const reminders: { name: string; date: string; time: string }[] = (await response.json()).reminders ?? [];
        const next = reminders
          .map((reminder) => ({ reminder, date: new Date(`${reminder.date}T${reminder.time}:00`) }))
          .filter((item) => !Number.isNaN(item.date.getTime()) && item.date.getTime() > Date.now())
          .sort((a, b) => a.date.getTime() - b.date.getTime())[0];
        setNextReminder(next ? `${next.reminder.name} at ${next.date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}` : null);
      } catch {
        setNextReminder(null);
      }
    }

    const sync = () => {
      setSupported("Notification" in window && "serviceWorker" in navigator && "PushManager" in window);
      setEnabled(window.localStorage.getItem("habitly-reminders") === "enabled");
      setPushReady(window.localStorage.getItem("habitly-push") === "enabled");
      loadNextReminder();
    };
    sync();
    navigator.serviceWorker?.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setPushReady(Boolean(subscription)))
      .catch(() => undefined);
    window.addEventListener("habitly-reminders-change", sync);
    return () => window.removeEventListener("habitly-reminders-change", sync);
  }, []);

  async function enable() {
    if (!supported) {
      toast.error("Notifications are not supported in this browser");
      return;
    }

    await navigator.serviceWorker.register("/sw.js");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      toast.error("Notifications were not enabled");
      return;
    }

    const keyResponse = await fetch("/api/push/public-key", { cache: "no-store" });
    const keyData = (await keyResponse.json()) as { configured?: boolean; publicKey?: string | null };
    if (!keyData.configured || !keyData.publicKey) {
      toast.error("Push reminders need VAPID keys on the server");
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyData.publicKey)
      }));

    const subscribeResponse = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscription,
        userAgent: navigator.userAgent
      })
    });

    if (!subscribeResponse.ok) {
      toast.error("Could not save this device for reminders");
      return;
    }

    window.localStorage.setItem("habitly-reminders", "enabled");
    window.localStorage.setItem("habitly-push", "enabled");
    setEnabled(true);
    setPushReady(true);
    window.dispatchEvent(new Event("habitly-reminders-change"));
    toast.success("Habit reminders enabled");
  }

  async function disable() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });
        await subscription.unsubscribe();
      }
    } catch {
      // The local toggle should still turn off even if the browser has already removed the subscription.
    }
    window.localStorage.removeItem("habitly-reminders");
    window.localStorage.removeItem("habitly-push");
    setEnabled(false);
    setPushReady(false);
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
            {enabled
              ? pushReady
                ? "Habitly will notify this device even when the app is closed."
                : "Habitly will use the reminder time set on each habit."
              : "Enable mobile browser reminders for today's habits."}
          </div>
          {enabled && nextReminder && <div className="mt-1 text-xs text-muted-foreground">Next: {nextReminder}</div>}
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant={enabled ? "outline" : "default"} onClick={enabled ? disable : enable}>
          {enabled ? "Turn off" : "Enable"}
        </Button>
      </div>
    </div>
  );
}
