import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent } from "@/components/ui/card";
import { getSessionEmail } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const email = await getSessionEmail();
  if (email) redirect("/today");

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6">
          <div className="mx-auto grid size-12 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-6" />
          </div>
          <div className="mb-6 mt-4 text-center">
            <h1 className="text-2xl font-semibold">Create your Habitly account</h1>
            <p className="mt-2 text-sm text-muted-foreground">Start tracking habits with your own workspace.</p>
          </div>
          <RegisterForm />
        </CardContent>
      </Card>
    </main>
  );
}
