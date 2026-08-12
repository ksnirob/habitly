import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { ThemeSettings } from "@/components/settings/theme-settings";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
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
      <Card><CardHeader><CardTitle>Account</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Demo user architecture is isolated so full authentication can be added later without changing habit ownership.</CardContent></Card>
    </div>
  );
}
