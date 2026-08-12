"use client";

import { Button } from "@/components/ui/button";
import { DatabaseSetup } from "@/components/dashboard/database-setup";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div>
      <DatabaseSetup />
      <div className="-mt-24 text-center">
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
