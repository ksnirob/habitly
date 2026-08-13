import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { ThemeSettings } from "@/components/settings/theme-settings";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions/auth";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-6">
      <header><p className="text-sm text-muted-foreground">Workspace</p><h1 className="text-3xl font-semibold">Settings</h1></header>
      <Card>
        <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
        <CardContent><ThemeSettings /></CardContent>
      </Card>
      <Card><CardHeader><CardTitle>Week</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Week starts Monday. This preference is represented in the user settings model.</CardContent></Card>
      <Card>
        <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
        <CardContent><NotificationSettings /></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Account</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Signed in as {user.email}.</p>
          <form action={logout}>
            <Button variant="outline">Sign out</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
