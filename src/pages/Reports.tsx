import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import { DashboardLayout } from "@/components/DashboardLayout";
import { dealers, portfolioStats } from "@/data/dealers";
import { generateDealerAudit, AUDIT_SECTIONS } from "@/data/auditFramework";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  TrendingUp,
  Users,
  ShieldCheck,
  AlertTriangle,
  BarChart3,
  CalendarIcon,
  Calendar as CalendarRange,
  Download,
} from "lucide-react";
import { RagBadge } from "@/components/RagBadge";
import { cn } from "@/lib/utils";
import { generateReportsAnalyticsPDF } from "@/utils/reportsPdfExport";
import { useToast } from "@/hooks/use-toast";

// RAG colors
const RAG_COLORS = {
  green: "hsl(142, 71%, 45%)",
  amber: "hsl(38, 92%, 50%)",
  red: "hsl(0, 84%, 60%)",
};

// Preset date ranges
const DATE_PRESETS = [
  { label: "Last 30 days", value: "30d" },
  { label: "Last 3 months", value: "3m" },
  { label: "Last 6 months", value: "6m" },
  { label: "Last 12 months", value: "12m" },
  { label: "Year to date", value: "ytd" },
  { label: "Custom", value: "custom" },
] as const;

type DatePreset = typeof DATE_PRESETS[number]["value"];

const Reports = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Date range state
  const [datePreset, setDatePreset] = useState<DatePreset>("6m");
  const [startDate, setStartDate] = useState<Date | undefined>(subMonths(new Date(), 6));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  // Calculate date range based on preset
  const dateRange = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    switch (datePreset) {
      case "30d":
        start = subMonths(now, 1);
        break;
      case "3m":
        start = subMonths(now, 3);
        break;
      case "6m":
        start = subMonths(now, 6);
        break;
      case "12m":
        start = subMonths(now, 12);
        break;
      case "ytd":
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case "custom":
        start = startDate || subMonths(now, 6);
        end = endDate || now;
        break;
      default:
        start = subMonths(now, 6);
    }

    return { start: startOfMonth(start), end: endOfMonth(end) };
  }, [datePreset, startDate, endDate]);

  // Generate months within the date range
  const monthsInRange = useMemo(() => {
    return eachMonthOfInterval({ start: dateRange.start, end: dateRange.end });
  }, [dateRange]);

  // Generate section-level aggregated data
  const sectionAnalytics = useMemo(() => {
    const sectionData = AUDIT_SECTIONS.map((section) => ({
      id: section.id,
      name: section.name,
      shortName: section.name.split(" ")[0],
      green: 0,
      amber: 0,
      red: 0,
      totalControls: 0,
      passRate: 0,
    }));

    dealers.forEach((dealer, index) => {
      const audit = generateDealerAudit(dealer.name, index);
      audit.sections.forEach((auditSection) => {
        const sectionEntry = sectionData.find((s) => s.id === auditSection.id);
        if (sectionEntry) {
          sectionEntry.green += auditSection.summary.green;
          sectionEntry.amber += auditSection.summary.amber;
          sectionEntry.red += auditSection.summary.red;
          sectionEntry.totalControls +=
            auditSection.summary.green + auditSection.summary.amber + auditSection.summary.red;
        }
      });
    });

    // Calculate pass rates
    sectionData.forEach((section) => {
      section.passRate = section.totalControls > 0
        ? Math.round((section.green / section.totalControls) * 100)
        : 0;
    });

    return sectionData;
  }, []);

  // Trend data based on date range
  const trendData = useMemo(() => {
    const baseScore = portfolioStats.avgScore;
    return monthsInRange.map((date, i) => {
      // Simulate variation based on month
      const variation = Math.sin(i * 0.5) * 3 + (i / monthsInRange.length) * 5;
      return {
        month: format(date, "MMM yy"),
        fullDate: date,
        score: Math.max(60, Math.min(95, Math.round(baseScore + variation))),
        green: Math.round(portfolioStats.green * (0.9 + (i / monthsInRange.length) * 0.1)),
        amber: Math.round(portfolioStats.amber * (1.05 - (i / monthsInRange.length) * 0.1)),
        red: Math.round(portfolioStats.red * (1.1 - (i / monthsInRange.length) * 0.15)),
      };
    });
  }, [monthsInRange]);

  // Distribution data for pie chart
  const distributionData = [
    { name: "Safe (Green)", value: portfolioStats.green, color: RAG_COLORS.green },
    { name: "Warning (Amber)", value: portfolioStats.amber, color: RAG_COLORS.amber },
    { name: "Critical (Red)", value: portfolioStats.red, color: RAG_COLORS.red },
  ];

  // Score distribution (histogram)
  const scoreDistribution = useMemo(() => {
    const buckets = [
      { range: "30-39", count: 0 },
      { range: "40-49", count: 0 },
      { range: "50-59", count: 0 },
      { range: "60-69", count: 0 },
      { range: "70-79", count: 0 },
      { range: "80-89", count: 0 },
      { range: "90-100", count: 0 },
    ];

    dealers.forEach((dealer) => {
      if (dealer.score >= 90) buckets[6].count++;
      else if (dealer.score >= 80) buckets[5].count++;
      else if (dealer.score >= 70) buckets[4].count++;
      else if (dealer.score >= 60) buckets[3].count++;
      else if (dealer.score >= 50) buckets[2].count++;
      else if (dealer.score >= 40) buckets[1].count++;
      else buckets[0].count++;
    });

    return buckets;
  }, []);

  // Top risk dealers
  const topRiskDealers = useMemo(() => {
    return [...dealers]
      .filter((d) => d.rag === "red" || d.rag === "amber")
      .sort((a, b) => a.score - b.score)
      .slice(0, 10);
  }, []);

  // Radar chart data for section compliance
  const radarData = useMemo(() => {
    return sectionAnalytics.map((section) => ({
      section: section.shortName,
      passRate: section.passRate,
      fullMark: 100,
    }));
  }, [sectionAnalytics]);

  // Calculate aggregate stats
  const totalControls = sectionAnalytics.reduce((sum, s) => sum + s.totalControls, 0);
  const totalGreen = sectionAnalytics.reduce((sum, s) => sum + s.green, 0);
  const totalAmber = sectionAnalytics.reduce((sum, s) => sum + s.amber, 0);
  const totalRed = sectionAnalytics.reduce((sum, s) => sum + s.red, 0);
  const overallPassRate = Math.round((totalGreen / totalControls) * 100);

  // Handle PDF export
  const handleExportPDF = () => {
    try {
      generateReportsAnalyticsPDF({
        dateRange,
        portfolioStats,
        overallPassRate,
        totalAlerts: totalAmber + totalRed,
        sectionAnalytics,
        trendData,
        topRiskDealers: topRiskDealers.map((d) => ({
          name: d.name,
          score: d.score,
          rag: d.rag,
          lastAudit: d.lastAudit,
        })),
      });
      toast({
        title: "PDF Exported",
        description: "Your portfolio analytics report has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error generating the PDF.",
        variant: "destructive",
      });
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Date Range Filter */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Reports & Analytics</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Portfolio-wide compliance trends and performance insights.
            </p>
          </div>

          {/* Date Range Controls */}
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <Select value={datePreset} onValueChange={(v) => setDatePreset(v as DatePreset)}>
              <SelectTrigger className="w-full sm:w-40 h-9 bg-background">
                <CalendarRange className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                {DATE_PRESETS.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {datePreset === "custom" && (
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[130px] justify-start text-left font-normal h-9",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "MMM d, yy") : "Start"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={(date) => date > new Date() || (endDate ? date > endDate : false)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[130px] justify-start text-left font-normal h-9",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "MMM d, yy") : "End"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => date > new Date() || (startDate ? date < startDate : false)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Export Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              className="h-9 gap-2"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Date Range Display */}
        <div className="bg-muted/30 rounded-lg px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" />
          Showing data from <span className="font-medium text-foreground">{format(dateRange.start, "MMM d, yyyy")}</span> to <span className="font-medium text-foreground">{format(dateRange.end, "MMM d, yyyy")}</span>
          <span className="text-xs">({monthsInRange.length} months)</span>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <Users className="w-4 h-4" />
              Total Dealers
            </div>
            <span className="text-3xl font-bold text-foreground">{portfolioStats.total}</span>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <ShieldCheck className="w-4 h-4" />
              Avg Score
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-foreground">{portfolioStats.avgScore}%</span>
              <span className="text-sm text-rag-green flex items-center mb-1">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +2.3%
              </span>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <BarChart3 className="w-4 h-4" />
              Overall Pass Rate
            </div>
            <span className="text-3xl font-bold text-foreground">{overallPassRate}%</span>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <AlertTriangle className="w-4 h-4 text-rag-red" />
              Active Alerts
            </div>
            <span className="text-3xl font-bold text-rag-red">{totalAmber + totalRed}</span>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Compliance Trend */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Compliance Score Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis domain={[50, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="Avg Score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RAG Distribution */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Portfolio Distribution</h3>
            <div className="h-64 flex items-center">
              <ResponsiveContainer width="60%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-3 pl-4">
                {distributionData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                    <span className="text-sm font-semibold text-foreground ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section Performance Bar Chart */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Section Pass Rates</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectionAnalytics} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis
                    dataKey="shortName"
                    type="category"
                    width={80}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="passRate" name="Pass Rate %" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Score Distribution Histogram */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Score Distribution</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="range" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Dealers" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Radar Chart */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Section Compliance Radar</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="section" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar
                    name="Pass Rate"
                    dataKey="passRate"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Risk Dealers */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-border">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Top 10 At-Risk Dealers</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left px-5 py-3 font-medium">Dealer</th>
                    <th className="text-left px-3 py-3 font-medium">Score</th>
                    <th className="text-left px-3 py-3 font-medium">Status</th>
                    <th className="text-left px-3 py-3 font-medium hidden sm:table-cell">Last Audit</th>
                  </tr>
                </thead>
                <tbody>
                  {topRiskDealers.map((dealer) => (
                    <tr key={dealer.name} className="border-b border-border last:border-0">
                      <td className="px-5 py-3 font-medium">
                        <button
                          onClick={() => navigate(`/dealers/${encodeURIComponent(dealer.name)}`)}
                          className="text-primary hover:underline text-left"
                        >
                          {dealer.name}
                        </button>
                      </td>
                      <td className="px-3 py-3 text-foreground font-semibold">{dealer.score}</td>
                      <td className="px-3 py-3">
                        <RagBadge status={dealer.rag} size="sm" />
                      </td>
                      <td className="px-3 py-3 text-muted-foreground hidden sm:table-cell">{dealer.lastAudit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section Breakdown Table */}
        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Audit Section Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left px-5 py-3 font-medium">Section</th>
                  <th className="text-center px-3 py-3 font-medium">Total Checks</th>
                  <th className="text-center px-3 py-3 font-medium text-rag-green">Green</th>
                  <th className="text-center px-3 py-3 font-medium text-rag-amber">Amber</th>
                  <th className="text-center px-3 py-3 font-medium text-rag-red">Red</th>
                  <th className="text-center px-3 py-3 font-medium">Pass Rate</th>
                </tr>
              </thead>
              <tbody>
                {sectionAnalytics.map((section) => (
                  <tr key={section.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 font-medium text-foreground">{section.name}</td>
                    <td className="px-3 py-3 text-center text-foreground">{section.totalControls}</td>
                    <td className="px-3 py-3 text-center text-rag-green font-semibold">{section.green}</td>
                    <td className="px-3 py-3 text-center text-rag-amber font-semibold">{section.amber}</td>
                    <td className="px-3 py-3 text-center text-rag-red font-semibold">{section.red}</td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`font-semibold ${
                          section.passRate >= 90
                            ? "text-rag-green"
                            : section.passRate >= 70
                            ? "text-rag-amber"
                            : "text-rag-red"
                        }`}
                      >
                        {section.passRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
