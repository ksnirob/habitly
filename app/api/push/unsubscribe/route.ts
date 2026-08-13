import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const body = await request.json().catch(() => ({}));
  if (typeof body?.endpoint !== "string") {
    return NextResponse.json({ ok: false, message: "Missing endpoint" }, { status: 400 });
  }

  await prisma.pushSubscription.deleteMany({
    where: {
      endpoint: body.endpoint,
      userId: user.id
    }
  });

  return NextResponse.json({ ok: true });
}
