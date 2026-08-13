import webpush, { type PushSubscription as WebPushSubscription } from "web-push";

export type HabitPushPayload = {
  title: string;
  body: string;
  tag: string;
  data: {
    url: string;
    habitId: string;
    goalType: string;
  };
  actions: { action: string; title: string; icon?: string }[];
};

type StoredSubscription = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export function getVapidPublicKey() {
  return process.env.VAPID_PUBLIC_KEY ?? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
}

export function isPushConfigured() {
  return Boolean(getVapidPublicKey() && process.env.VAPID_PRIVATE_KEY);
}

export function configureWebPush() {
  if (!isPushConfigured()) return false;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:admin@ksnirob.com",
    getVapidPublicKey(),
    process.env.VAPID_PRIVATE_KEY ?? ""
  );
  return true;
}

export function toWebPushSubscription(subscription: StoredSubscription): WebPushSubscription {
  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth
    }
  };
}

export async function sendHabitPush(subscription: StoredSubscription, payload: HabitPushPayload) {
  configureWebPush();
  return webpush.sendNotification(toWebPushSubscription(subscription), JSON.stringify(payload));
}
