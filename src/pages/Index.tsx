import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { RagBadge } from "@/components/RagBadge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  TrendingDown,
  TrendingUp,
  Minus,
  AlertTriangle,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Award,
  Clock,
  Search,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { dealers, activities, portfolioStats } from "@/data/dealers";
import { generateDealerAudit } from "@/data/auditFramework";
import { TrendHighlightsWidget } from "@/components/dashboard/TrendHighlightsWidget";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { useUserSettings } from "@/hooks/useUserSettings";
import { ScoreDistributionChart } from "@/components/dashboard/ScoreDistributionChart";
import { SectionComplianceChart } from "@/components/dashboard/SectionComplianceChart";
import { RegionalSummaryTable } from "@/components/dashboard/RegionalSummaryTable";
import { PortfolioTrendMini } from "@/components/dashboard/PortfolioTrendMini";
import { TopRiskDealers } from "@/components/dashboard/TopRiskDealers";

const ITEMS_PER_PAGE = 10;

const portfolioData = [
  { name: "Safe", value: portfolioStats.green, color: "hsl(142, 71%, 45%)" },
  { name: "Warning", value: portfolioStats.amber, color: "hsl(38, 92%, 50%)" },
  { name: "Critical", value: portfolioStats.red, color: "hsl(0, 84%, 60%)" },
];

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === "up") return <TrendingUp className="w-4 h-4 text-rag-green" />;
  if (trend === "down") return <TrendingDown className="w-4 h-4 text-rag-red" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-sm font-medium text-foreground">
          {payload[0].name}: {payload[0].value} dealers
        </p>
      </div>
    );
  }
  return null;
};

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { settings } = useUserSettings();

  // Precompute CSS scores for all dealers
  const dealerCssScores = useMemo(() => {
    const map = new Map<string, number>();
    dealers.forEach((dealer, index) => {
      const audit = generateDealerAudit(dealer.name, index);
      map.set(dealer.name, audit.customerSentimentScore);
    });
    return map;
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const animatedTotal = useAnimatedCounter(portfolioStats.total);
  const animatedRed = useAnimatedCounter(portfolioStats.red);
  const animatedAvgScore = useAnimatedCounter(portfolioStats.avgScore);

  const filteredDealers = useMemo(() => {
    return dealers.filter((dealer) => {
      const matchesSearch = dealer.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim());
      const matchesStatus =
        statusFilter === "all" || dealer.rag === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredDealers.length / ITEMS_PER_PAGE);
  const validCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  
  const paginatedDealers = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredDealers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredDealers, validCurrentPage]);

  // Reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (validCurrentPage > 3) pages.push("ellipsis");
      for (let i = Math.max(2, validCurrentPage - 1); i <= Math.min(totalPages - 1, validCurrentPage + 1); i++) {
        pages.push(i);
      }
      if (validCurrentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page title */}
        <div>
          <h2 className="text-xl font-semibold text-foreground">Portfolio Overview</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Monitor compliance risk across your dealer network.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Portfolio Health with Donut Chart */}
          <div className="bg-card rounded-xl border border-border p-5 opacity-0 animate-fade-in" style={{ animationDelay: "0ms", animationFillMode: "forwards" }}>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
              <ShieldCheck className="w-4 h-4" />
              Portfolio Health
            </div>
            <div className="flex items-center gap-4">
              {/* Donut Chart */}
              <div className="w-24 h-24 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolioData}
                      cx="50%"
                      cy="50%"
                      innerRadius={28}
                      outerRadius={42}
                      paddingAngle={2}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {portfolioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-foreground">{animatedTotal}</span>
                </div>
              </div>
              {/* Legend */}
              <div className="flex flex-col gap-1.5 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rag-green" /> {portfolioStats.green} Safe
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rag-amber" /> {portfolioStats.amber} Warning
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rag-red" /> {portfolioStats.red} Critical
                </span>
              </div>
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="bg-card rounded-xl border border-border p-5 opacity-0 animate-fade-in" style={{ animationDelay: "150ms", animationFillMode: "forwards" }}>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
              <AlertTriangle className="w-4 h-4" />
              Critical Alerts
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-rag-red">{animatedRed}</span>
              <span className="text-sm text-muted-foreground mb-1">dealers require attention</span>
            </div>
          </div>

          {/* Avg Risk Score */}
          <div className="bg-card rounded-xl border border-border p-5 opacity-0 animate-fade-in" style={{ animationDelay: "300ms", animationFillMode: "forwards" }}>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
              <Activity className="w-4 h-4" />
              Avg Risk Score
            </div>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-bold text-foreground">{animatedAvgScore}</span>
              <span className="text-lg text-muted-foreground mb-0.5">/100</span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PortfolioTrendMini />
          <ScoreDistributionChart />
        </div>

        {/* Section Compliance + Regional Summary + Top Risk */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SectionComplianceChart />
          <RegionalSummaryTable />
          <TopRiskDealers />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dealer Watchlist */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-border">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground mb-3">Dealer Watchlist</h3>
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search dealers..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9 h-9 bg-background"
                  />
                </div>
                <Select value={statusFilter} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full sm:w-40 h-9 bg-background">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="green">Green (Safe)</SelectItem>
                    <SelectItem value="amber">Amber (Warning)</SelectItem>
                    <SelectItem value="red">Red (Critical)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left px-5 py-3 font-medium">Dealer Name</th>
                    <th className="text-left px-3 py-3 font-medium">Score</th>
                    <th className="text-left px-3 py-3 font-medium">Status</th>
                     <th className="text-left px-3 py-3 font-medium hidden sm:table-cell">Last Audit</th>
                     <th className="text-center px-3 py-3 font-medium">Trend</th>
                     <th className="text-center px-3 py-3 font-medium">CSS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDealers.length > 0 ? (
                     paginatedDealers.map((dealer, index) => {
                       const cssScore = dealerCssScores.get(dealer.name) ?? 0;
                       const isOversight = cssScore < settings.css_oversight_threshold;
                       const isReward = cssScore >= settings.css_reward_threshold;
                       return (
                         <tr
                           key={dealer.name}
                           onClick={() => navigate(`/dealer/${encodeURIComponent(dealer.name)}`)}
                           className="border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer transition-colors opacity-0 animate-fade-in"
                           style={{ animationDelay: `${index * 50}ms`, animationFillMode: "forwards" }}
                         >
                           <td className="px-5 py-3.5 font-medium text-foreground">{dealer.name}</td>
                           <td className="px-3 py-3.5 text-foreground font-semibold">{dealer.score}</td>
                           <td className="px-3 py-3.5"><RagBadge status={dealer.rag} /></td>
                           <td className="px-3 py-3.5 text-muted-foreground hidden sm:table-cell">{dealer.lastAudit}</td>
                           <td className="px-3 py-3.5 text-center"><TrendIcon trend={dealer.trend} /></td>
                           <td className="px-3 py-3.5 text-center">
                             {isOversight ? (
                               <Tooltip>
                                 <TooltipTrigger>
                                   <ShieldAlert className="w-4 h-4 text-rag-red inline-block" />
                                 </TooltipTrigger>
                                 <TooltipContent>
                                   <p className="text-xs">CSS {cssScore.toFixed(1)} — Enhanced Oversight</p>
                                 </TooltipContent>
                               </Tooltip>
                             ) : isReward ? (
                               <Tooltip>
                                 <TooltipTrigger>
                                   <Award className="w-4 h-4 text-accent inline-block" />
                                 </TooltipTrigger>
                                 <TooltipContent>
                                   <p className="text-xs">CSS {cssScore.toFixed(1)} — Positive Reward</p>
                                 </TooltipContent>
                               </Tooltip>
                             ) : (
                               <span className="text-xs text-muted-foreground">{cssScore.toFixed(1)}</span>
                             )}
                           </td>
                         </tr>
                       );
                     })
                   ) : (
                     <tr>
                       <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                         No dealers found matching your criteria.
                       </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-border flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {((validCurrentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(validCurrentPage * ITEMS_PER_PAGE, filteredDealers.length)} of {filteredDealers.length} dealers
                </p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={validCurrentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {getPageNumbers().map((page, idx) => (
                      <PaginationItem key={idx}>
                        {page === "ellipsis" ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={validCurrentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={validCurrentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Trend Highlights */}
            <TrendHighlightsWidget />

            {/* Recent Activity */}
            <div className="bg-card rounded-xl border border-border">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
              </div>
              <div className="divide-y divide-border">
                {activities.map((activity, i) => (
                  <div key={i} className="px-5 py-3.5 flex gap-3">
                    <div className="mt-0.5">
                      <span
                        className={`block w-2 h-2 rounded-full ${
                          activity.type === "green"
                            ? "bg-rag-green"
                            : activity.type === "amber"
                            ? "bg-rag-amber"
                            : "bg-rag-red"
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-foreground leading-snug">{activity.text}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
