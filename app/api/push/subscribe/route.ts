import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type BrowserPushSubscription = {
  endpoint?: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const body = await request.json().catch(() => ({}));
  const subscription = body?.subscription as BrowserPushSubscription | undefined;

  if (!subscription?.endpoint || !subscription.keys?.p256dh || !subscription.keys.auth) {
    return NextResponse.json({ ok: false, message: "Invalid push subscription" }, { status: 400 });
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    create: {
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent: typeof body?.userAgent === "string" ? body.userAgent : null,
      userId: user.id
    },
    update: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent: typeof body?.userAgent === "string" ? body.userAgent : null,
      userId: user.id
    }
  });

  return NextResponse.json({ ok: true });
}
