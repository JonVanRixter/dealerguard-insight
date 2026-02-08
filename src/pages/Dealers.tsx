import { DashboardLayout } from "@/components/DashboardLayout";

const Dealers = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Dealer Portfolio</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            View and manage your complete dealer network.
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <p className="text-muted-foreground">Dealer portfolio view coming soon.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dealers;
