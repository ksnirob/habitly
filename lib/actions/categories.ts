"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { categorySchema } from "@/lib/validations/category";

export async function createCategory(_: unknown, formData: FormData) {
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    icon: formData.get("icon") ?? "Circle",
    color: formData.get("color") ?? "slate"
  });

  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid category" };

  try {
    const user = await getCurrentUser();
    await prisma.category.create({
      data: {
        ...parsed.data,
        userId: user.id
      }
    });
    revalidatePath("/categories");
    revalidatePath("/habits/new");
    return { ok: true, message: "Category created" };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, message: "That category already exists" };
    }
    return { ok: false, message: "Please sign in and connect PostgreSQL before creating categories" };
  }
}
