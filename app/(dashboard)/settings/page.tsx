import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { ThemeSettings } from "@/components/settings/theme-settings";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { InstallApp } from "@/components/settings/install-app";
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
        <CardHeader><CardTitle>Install app</CardTitle></CardHeader>
        <CardContent><InstallApp /></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Account</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">Signed in as {user.email}.</p>
          <div className="rounded-lg border bg-background p-6">
            <h3 className="mb-6 font-medium">Change password</h3>
            <ChangePasswordForm />
          </div>
          <form action={logout} className="border-t pt-4">
            <Button variant="outline">Sign out</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
