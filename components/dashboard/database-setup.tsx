import { Database } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function DatabaseSetup() {
  return (
    <div className="grid min-h-[70vh] place-items-center">
      <Card className="max-w-lg">
        <CardContent className="p-6 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-lg bg-muted">
            <Database className="size-6 text-primary" />
          </div>
          <h1 className="mt-4 text-xl font-semibold">Database connection needed</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Habitly is ready, but it needs a running PostgreSQL database and a valid <code>DATABASE_URL</code> before it can load your habits.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
