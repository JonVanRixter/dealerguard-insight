import { useState } from "react";
import { format } from "date-fns";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Download,
  CalendarIcon,
  TrendingUp,
  CheckCircle2,
  Timer,
  Landmark,
  Bell,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import { PlatformHealthKPIs } from "@/components/reports/PlatformHealthKPIs";
import { PlatformGrowthModule } from "@/components/reports/PlatformGrowthModule";
import { AuditsCompletedModule } from "@/components/reports/AuditsCompletedModule";
import { SLAPerformanceModule } from "@/components/reports/SLAPerformanceModule";
import { OnboardingMetricsModule } from "@/components/reports/OnboardingMetricsModule";
import { AlertMetricsModule } from "@/components/reports/AlertMetricsModule";
import { ReCheckMetricsModule } from "@/components/reports/ReCheckMetricsModule";
import reportMetrics from "@/data/tcg/reportMetrics.json";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const PERIOD_OPTIONS = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "This quarter", value: "q1-2026" },
  { label: "Last quarter", value: "q4-2025" },
  { label: "Custom range", value: "custom" },
] as const;

type PeriodValue = typeof PERIOD_OPTIONS[number]["value"];

const Reports = () => {
  const { toast } = useToast();
  const [activeModule, setActiveModule] = useState("overview");
  const [activePeriod, setActivePeriod] = useState<PeriodValue>("30d");
  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();

  const handleExportPDF = () => {
    toast({
      title: "PDF Export",
      description: "PDF export will be available in the full MVP build.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header strip */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">Reports & Analytics</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Platform-wide performance reporting for TCG operations and compliance review
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportPDF} className="h-9 gap-2 shrink-0">
              <Download className="w-4 h-4" />
              Export full report PDF
            </Button>
          </div>

          {/* Period selector */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground mr-1">Period:</span>
            {PERIOD_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant={activePeriod === opt.value ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs px-3"
                onClick={() => setActivePeriod(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>

          {/* Custom date pickers */}
          {activePeriod === "custom" && (
            <div className="mt-3 flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn("h-8 w-[140px] justify-start text-left text-xs font-normal", !customFrom && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {customFrom ? format(customFrom, "dd MMM yyyy") : "From"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customFrom}
                    onSelect={setCustomFrom}
                    disabled={(d) => d > new Date() || (customTo ? d > customTo : false)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <span className="text-xs text-muted-foreground">to</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn("h-8 w-[140px] justify-start text-left text-xs font-normal", !customTo && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {customTo ? format(customTo, "dd MMM yyyy") : "To"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customTo}
                    onSelect={setCustomTo}
                    disabled={(d) => d > new Date() || (customFrom ? d < customFrom : false)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Data as-of */}
          <p className="mt-3 text-[11px] text-muted-foreground flex items-center gap-1.5">
            <CalendarIcon className="w-3 h-3" />
            Data as of: {format(new Date(reportMetrics.generatedAt), "dd MMM yyyy HH:mm")}
          </p>
        </div>

        {/* Platform Health KPIs */}
        <PlatformHealthKPIs />

        {/* Module Tabs */}
        <Tabs value={activeModule} onValueChange={setActiveModule}>
          <TabsList className="flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="overview" className="gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Platform Growth
            </TabsTrigger>
            <TabsTrigger value="audits" className="gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Audits & Checks
            </TabsTrigger>
            <TabsTrigger value="sla" className="gap-1.5">
              <Timer className="w-3.5 h-3.5" />
              SLA Performance
            </TabsTrigger>
            <TabsTrigger value="onboarding" className="gap-1.5">
              <Landmark className="w-3.5 h-3.5" />
              Onboarding
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-1.5">
              <Bell className="w-3.5 h-3.5" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="rechecks" className="gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              Re-Checks
            </TabsTrigger>
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
