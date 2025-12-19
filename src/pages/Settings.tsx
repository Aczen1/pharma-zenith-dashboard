import { Settings as SettingsIcon, User, Bell, Shield, Palette } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const Settings = () => {
  return (
    <DashboardLayout title="Settings">
      <div className="flex flex-col items-center justify-center py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary mb-4">
          <SettingsIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Settings Coming Soon</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Configure your preferences, notifications, and account settings. This feature is under development.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
