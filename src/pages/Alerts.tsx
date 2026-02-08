import { DashboardLayout } from "@/components/DashboardLayout";

const Alerts = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Alerts</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor and respond to compliance alerts.
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <p className="text-muted-foreground">Alerts management coming soon.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Alerts;
