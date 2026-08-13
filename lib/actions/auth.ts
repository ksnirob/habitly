"use server";

import { redirect } from "next/navigation";
import { ADMIN_EMAIL, ADMIN_PASSWORD, clearSession, requireSession, setSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";

type State = { ok: boolean; message?: string } | undefined;

async function findUserForLogin(email: string) {
  try {
    return await prisma.user.findUnique({ where: { email } });
  } catch (error) {
    console.error("Login database lookup failed, retrying once", error);
    await new Promise((resolve) => setTimeout(resolve, 750));
    return prisma.user.findUnique({ where: { email } });
  }
}

export async function login(_: State, formData: FormData): Promise<State> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, message: "Invalid email or password" };
  }

  try {
    let user = await findUserForLogin(email);

    if (!user && email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      user = await prisma.user.create({
        data: {
          email: ADMIN_EMAIL,
          name: "Admin",
          passwordHash: hashPassword(ADMIN_PASSWORD),
          timezone: "Asia/Dhaka",
          settings: { create: {} }
        }
      });
    }

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return { ok: false, message: "Invalid email or password" };
    }
  } catch (error) {
    console.error("Login database error", error);
    return { ok: false, message: "Database is not ready. Check DATABASE_URL and run migrations on Vercel." };
  }

  await setSession(email);
  redirect("/today");
}

export async function register(_: State, formData: FormData): Promise<State> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (name.length < 2) return { ok: false, message: "Name must be at least 2 characters" };
  if (!email.includes("@")) return { ok: false, message: "Enter a valid email address" };
  if (password.length < 6) return { ok: false, message: "Password must be at least 6 characters" };
  if (password !== confirmPassword) return { ok: false, message: "Passwords do not match" };

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashPassword(password),
        timezone: "Asia/Dhaka",
        settings: { create: {} }
      }
    });
  } catch (error) {
    console.error("Register database error", error);
    return { ok: false, message: "That account could not be created. Check DATABASE_URL and run migrations." };
  }

  await setSession(email);
  redirect("/today");
}

export async function changePassword(_: State, formData: FormData): Promise<State> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { ok: false, message: "Fill in all password fields" };
  }
  if (newPassword.length < 6) return { ok: false, message: "New password must be at least 6 characters" };
  if (newPassword !== confirmPassword) return { ok: false, message: "New passwords do not match" };

  try {
    const email = await requireSession();
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, passwordHash: true } });
    if (!user || !verifyPassword(currentPassword, user.passwordHash)) {
      return { ok: false, message: "Current password is incorrect" };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(newPassword) }
    });
    return { ok: true, message: "Password changed" };
  } catch (error) {
    console.error("Change password error", error);
    return { ok: false, message: "Could not change password right now" };
  }
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
