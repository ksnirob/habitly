self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Required by some browsers when evaluating installability.
});

self.addEventListener("message", (event) => {
  if (!event.data || event.data.type !== "SHOW_HABIT_REMINDER") return;

  event.waitUntil(
    self.registration.showNotification("Habitly", {
      body: event.data.body || "Check in with today's habits.",
      icon: "/icon.svg",
      badge: "/icon.svg",
      tag: "habitly-daily-reminder",
      renotify: true,
      data: {
        url: "/today"
      }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data || {};

  if ((event.action === "complete" || event.action === "increment") && data.habitId) {
    event.waitUntil(
      fetch(`/api/habits/${data.habitId}/complete`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ mode: event.action })
      })
        .then(() => self.registration.showNotification("Habitly", {
          body: event.action === "increment" ? "Progress added." : "Habit completed.",
          icon: "/icon.svg",
          badge: "/icon.svg",
          tag: "habitly-action-confirmed",
          data: {
            url: "/today"
          }
        }))
        .catch(() => self.clients.openWindow(data.url || "/today"))
    );
    return;
  }

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => "focus" in client);
      if (existing) return existing.focus();
      return self.clients.openWindow(data.url || "/today");
    })
  );
});
