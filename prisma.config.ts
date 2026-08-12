import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "prisma/config";

function loadLocalDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const envLocal = resolve(process.cwd(), ".env.local");
  if (!existsSync(envLocal)) return "";

  const match = readFileSync(envLocal, "utf8").match(/^DATABASE_URL=(.+)$/m);
  return match?.[1]?.replace(/^"|"$/g, "") ?? "";
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts"
  },
  datasource: {
    url: loadLocalDatabaseUrl()
  }
});
