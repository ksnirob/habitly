"use server";

import { redirect } from "next/navigation";
import { ADMIN_EMAIL, ADMIN_PASSWORD, clearSession, setSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";

type State = { ok: boolean; message?: string } | undefined;

export async function login(_: State, formData: FormData): Promise<State> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, message: "Invalid email or password" };
  }

  try {
    let user = await prisma.user.findUnique({ where: { email } });

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
    return { ok: false, message: "Database is not ready. Run Prisma migrate, then restart the app." };
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
    return { ok: false, message: "That account could not be created. Run Prisma migrate, then try again." };
  }

  await setSession(email);
  redirect("/today");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
