import { DashboardLayout } from "@/components/DashboardLayout";

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Settings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure your account and platform preferences.
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <p className="text-muted-foreground">Settings panel coming soon.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
