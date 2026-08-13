import { redirect } from "next/navigation";
import { getSessionEmail } from "@/lib/auth";

export default async function Home() {
  const email = await getSessionEmail();
  if (!email) redirect("/login");
  redirect("/today");
}
