import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, CalendarIcon } from "lucide-react";
import { PlatformHealthKPIs } from "@/components/reports/PlatformHealthKPIs";
import { PlatformGrowthModule } from "@/components/reports/PlatformGrowthModule";
import { AuditsCompletedModule } from "@/components/reports/AuditsCompletedModule";
import { SLAPerformanceModule } from "@/components/reports/SLAPerformanceModule";
import { OnboardingMetricsModule } from "@/components/reports/OnboardingMetricsModule";
import { AlertMetricsModule } from "@/components/reports/AlertMetricsModule";
import { ReCheckMetricsModule } from "@/components/reports/ReCheckMetricsModule";
import reportMetrics from "@/data/tcg/reportMetrics.json";
import { useToast } from "@/hooks/use-toast";

const Reports = () => {
  const { toast } = useToast();
  const [activeModule, setActiveModule] = useState("overview");

  const handleExportPDF = () => {
    toast({
      title: "PDF Export",
      description: "Report export is being generated…",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Reports & Analytics</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Platform-wide performance metrics · {reportMetrics.periodCoverage}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="h-9 gap-2">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>

        {/* Platform Health KPIs */}
        <PlatformHealthKPIs />

        {/* Module Tabs */}
        <Tabs value={activeModule} onValueChange={setActiveModule}>
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="overview">Platform Growth</TabsTrigger>
            <TabsTrigger value="audits">Audits</TabsTrigger>
            <TabsTrigger value="sla">SLA Performance</TabsTrigger>
            <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="rechecks">Re-Checks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <PlatformGrowthModule />
          </TabsContent>

          <TabsContent value="audits" className="mt-6">
            <AuditsCompletedModule />
          </TabsContent>

          <TabsContent value="sla" className="mt-6">
            <SLAPerformanceModule />
          </TabsContent>

          <TabsContent value="onboarding" className="mt-6">
            <OnboardingMetricsModule />
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <AlertMetricsModule />
          </TabsContent>

          <TabsContent value="rechecks" className="mt-6">
            <ReCheckMetricsModule />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
