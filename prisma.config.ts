import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "prisma/config";

function loadLocalDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const envFiles = [".env.local", ".env"];

  for (const file of envFiles) {
    const envPath = resolve(process.cwd(), file);
    if (!existsSync(envPath)) continue;

    const match = readFileSync(envPath, "utf8").match(/^DATABASE_URL=(.+)$/m);
    const value = match?.[1]?.trim().replace(/^"|"$/g, "");
    if (value) return value;
  }

  return "";
}

const databaseUrl = loadLocalDatabaseUrl();
if (databaseUrl && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = databaseUrl;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts"
  },
  datasource: {
    url: databaseUrl
  }
});
