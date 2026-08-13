import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export const ADMIN_EMAIL = "admin@ksnirob.com";
export const ADMIN_PASSWORD = "681074@ks";

const sessionCookie = "habitly_session";

function sign(email: string) {
  const secret = process.env.AUTH_SECRET ?? "habitly-local-session";
  return createHmac("sha256", secret).update(email).digest("hex");
}

function sessionValue(email: string) {
  return `${Buffer.from(email).toString("base64url")}.${sign(email)}`;
}

function readSession(value: string | undefined) {
  if (!value) return null;
  const [encodedEmail, signature] = value.split(".");
  if (!encodedEmail || !signature) return null;

  const email = Buffer.from(encodedEmail, "base64url").toString("utf8");
  const expected = Buffer.from(sign(email));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  return email;
}

export async function getSessionEmail() {
  const cookieStore = await cookies();
  return readSession(cookieStore.get(sessionCookie)?.value);
}

export async function requireSession() {
  const email = await getSessionEmail();
  if (!email) redirect("/login");
  return email;
}

export async function setSession(email: string) {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookie, sessionValue(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookie);
}

export async function getCurrentUser() {
  const email = await requireSession();

  return prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: email === ADMIN_EMAIL ? "Admin" : email.split("@")[0],
      timezone: "Asia/Dhaka",
      settings: { create: {} }
    },
    include: { settings: true }
  });
}
