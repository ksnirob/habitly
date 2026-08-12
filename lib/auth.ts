import { prisma } from "@/lib/db";

export async function getCurrentUser() {
  const email = process.env.DEMO_USER_EMAIL ?? "khaled@example.com";

  return prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: process.env.DEMO_USER_NAME ?? "Khaled",
      timezone: process.env.DEMO_USER_TIMEZONE ?? "Asia/Dhaka",
      settings: { create: {} }
    },
    include: { settings: true }
  });
}
