import { DashboardLayout } from "@/components/DashboardLayout";

const Reports = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Reports</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Generate and download compliance reports.
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <p className="text-muted-foreground">Reports dashboard coming soon.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
