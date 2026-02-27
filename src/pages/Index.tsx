import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
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
  Activity,
  Clock,
  Search,
  Users,
  Building2,
  ClipboardList,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { dealers, activities } from "@/data/dealers";
import { tcgDealers, tcgPortfolioStats } from "@/data/tcg/dealers";
import { tcgLenders, getLenderDealerStats } from "@/data/tcg/lenders";
import { TrendHighlightsWidget } from "@/components/dashboard/TrendHighlightsWidget";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { SectionComplianceChart } from "@/components/dashboard/SectionComplianceChart";
import { RegionalSummaryTable } from "@/components/dashboard/RegionalSummaryTable";
import { PortfolioTrendMini } from "@/components/dashboard/PortfolioTrendMini";
import { TopRiskDealers } from "@/components/dashboard/TopRiskDealers";
import { RecheckWidget } from "@/components/dashboard/RecheckWidget";
import { OnboardingValidityWidget } from "@/components/dashboard/OnboardingValidityWidget";

const ITEMS_PER_PAGE = 10;

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === "up") return <TrendingUp className="w-4 h-4 text-foreground" />;
  if (trend === "down") return <TrendingDown className="w-4 h-4 text-foreground" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
};

/* Score distribution bar chart data — neutral bands */
function buildScoreDistribution() {
  const bands = [
    { label: "0–24", min: 0, max: 24 },
    { label: "25–49", min: 25, max: 49 },
    { label: "50–74", min: 50, max: 74 },
    { label: "75–100", min: 75, max: 100 },
  ];
  return bands.map((b) => ({
    band: b.label,
    count: tcgDealers.filter((d) => d.score >= b.min && d.score <= b.max).length,
  }));
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-sm font-medium text-foreground">
          {label}: {payload[0].value} dealer{payload[0].value !== 1 ? "s" : ""}
        </p>
      </div>
    );
  }
  return null;
};

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const scoreDistribution = useMemo(buildScoreDistribution, []);

  // Pending reviews count (simulated — dealers with alertCount > 0 treated as pending review)
  const pendingReviews = useMemo(
    () => tcgDealers.filter((d) => d.alertCount > 0).length,
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const animatedLenders = useAnimatedCounter(tcgLenders.length);
  const animatedDealers = useAnimatedCounter(tcgPortfolioStats.total);
  const animatedAvgScore = useAnimatedCounter(tcgPortfolioStats.avgScore);
  const animatedPending = useAnimatedCounter(pendingReviews);

  const filteredDealers = useMemo(() => {
    return dealers.filter((dealer) =>
      dealer.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredDealers.length / ITEMS_PER_PAGE);
  const validCurrentPage = Math.min(currentPage, Math.max(1, totalPages));

  const paginatedDealers = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredDealers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredDealers, validCurrentPage]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
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
          <h2 className="text-xl font-semibold text-foreground">TCG Portfolio Overview</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Compliance scores and dealer activity across all lenders.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Lenders */}
          <div className="bg-card rounded-xl border border-border p-5 opacity-0 animate-fade-in" style={{ animationDelay: "0ms", animationFillMode: "forwards" }}>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
              <Users className="w-4 h-4" />
              Total Lenders
            </div>
            <span className="text-4xl font-bold text-foreground">{animatedLenders}</span>
          </div>

          {/* Total Dealers */}
          <div className="bg-card rounded-xl border border-border p-5 opacity-0 animate-fade-in" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
              <Building2 className="w-4 h-4" />
              Total Dealers
            </div>
            <span className="text-4xl font-bold text-foreground">{animatedDealers}</span>
          </div>

          {/* Average Portfolio Score */}
          <div className="bg-card rounded-xl border border-border p-5 opacity-0 animate-fade-in" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
              <Activity className="w-4 h-4" />
              Avg Portfolio Score
            </div>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-bold text-foreground">{animatedAvgScore}</span>
              <span className="text-lg text-muted-foreground mb-0.5">/100</span>
            </div>
          </div>

          {/* Pending Reviews */}
          <div className="bg-card rounded-xl border border-border p-5 opacity-0 animate-fade-in" style={{ animationDelay: "300ms", animationFillMode: "forwards" }}>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
              <ClipboardList className="w-4 h-4" />
              Pending Reviews
            </div>
            <span className="text-4xl font-bold text-foreground">{animatedPending}</span>
          </div>
        </div>

        {/* Score Distribution + Portfolio Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Distribution Bar Chart */}
          <div className="bg-card rounded-xl border border-border">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Score Distribution</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Across all active dealers</p>
            </div>
            <div className="p-5 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistribution} barSize={48}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="band" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <RechartsTooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <PortfolioTrendMini />
        </div>

        {/* Lender Activity Summary */}
        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Lender Activity Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lender Name</TableHead>
                  <TableHead className="text-center">Dealer Count</TableHead>
                  <TableHead className="text-center">Avg Score</TableHead>
                  <TableHead className="text-center">Score Range</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tcgLenders.map((lender) => {
                  const stats = getLenderDealerStats(lender.id);
                  const lastLogin = new Date(lender.lastLogin);
                  return (
                    <TableRow key={lender.id}>
                      <TableCell className="font-medium text-foreground">{lender.name}</TableCell>
                      <TableCell className="text-center">{stats.dealerCount}</TableCell>
                      <TableCell className="text-center font-semibold">{stats.avgScore}</TableCell>
                      <TableCell className="text-center font-mono text-sm">{stats.scoreRange}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {lastLogin.toLocaleDateString("en-GB")} {lastLogin.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={lender.status === "Active" ? "default" : "secondary"}>
                          {lender.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search dealers..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 h-9 bg-background"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left px-5 py-3 font-medium">Dealer Name</th>
                    <th className="text-left px-3 py-3 font-medium">Score</th>
                    <th className="text-left px-3 py-3 font-medium hidden sm:table-cell">Last Audit</th>
                    <th className="text-center px-3 py-3 font-medium">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDealers.length > 0 ? (
                    paginatedDealers.map((dealer, index) => (
                      <tr
                        key={dealer.name}
                        onClick={() => navigate(`/dealer/${encodeURIComponent(dealer.name)}`)}
                        className="border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer transition-colors opacity-0 animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms`, animationFillMode: "forwards" }}
                      >
                        <td className="px-5 py-3.5 font-medium text-foreground">{dealer.name}</td>
                        <td className="px-3 py-3.5 text-foreground font-semibold">{dealer.score}</td>
                        <td className="px-3 py-3.5 text-muted-foreground hidden sm:table-cell">{dealer.lastAudit}</td>
                        <td className="px-3 py-3.5 text-center"><TrendIcon trend={dealer.trend} /></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
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
            <RecheckWidget />
            <OnboardingValidityWidget />
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
                      <span className="block w-2 h-2 rounded-full bg-muted-foreground" />
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
