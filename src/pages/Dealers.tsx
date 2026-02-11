import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { RagBadge } from "@/components/RagBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  Search,
  ShieldAlert,
  Award,
  ArrowUpDown,
  MapPin,
  BarChart3,
  Users,
  Activity,
  ChevronDown,
  ChevronRight,
  Download,
  X,
  FolderOpen,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { dealers, portfolioStats } from "@/data/dealers";
import { generateDealerAudit } from "@/data/auditFramework";
import { useUserSettings } from "@/hooks/useUserSettings";
import { BatchAiSummary } from "@/components/dealer/BatchAiSummary";
import { DuplicateFlagsBanner } from "@/components/dealer/DuplicateFlagsBanner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const ITEMS_PER_PAGE = 15;

type SortKey = "name" | "score" | "rag" | "css" | "region";
type SortDir = "asc" | "desc";

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === "up") return <TrendingUp className="w-4 h-4 text-rag-green" />;
  if (trend === "down") return <TrendingDown className="w-4 h-4 text-rag-red" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
};

const ragOrder = { red: 0, amber: 1, green: 2 };

const Dealers = () => {
  const navigate = useNavigate();
  const { settings } = useUserSettings();
  const [searchParams] = useSearchParams();
  const initialRegion = searchParams.get("region") || "all";
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState(initialRegion);
  const [docCounts, setDocCounts] = useState<Map<string, number>>(new Map());

  const fetchDocCounts = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("dealer_documents")
      .select("dealer_name");
    if (data) {
      const counts = new Map<string, number>();
      data.forEach((d) => counts.set(d.dealer_name, (counts.get(d.dealer_name) || 0) + 1));
      setDocCounts(counts);
    }
  }, []);

  useEffect(() => { fetchDocCounts(); }, [fetchDocCounts]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"table" | "region">("table");
  const [quickFilter, setQuickFilter] = useState<"all" | "oversight" | "reward" | "green" | "amber" | "red">("all");

  const activeFilterCount = [searchQuery !== "", statusFilter !== "all", regionFilter !== "all", quickFilter !== "all"].filter(Boolean).length;
  const isFiltering = activeFilterCount > 0;

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setRegionFilter("all");
    setQuickFilter("all");
    setCurrentPage(1);
  };

  const dealerCssScores = useMemo(() => {
    const map = new Map<string, number>();
    dealers.forEach((d, i) => {
      const audit = generateDealerAudit(d.name, i);
      map.set(d.name, audit.customerSentimentScore);
    });
    return map;
  }, []);

  const regions = useMemo(() => [...new Set(dealers.map((d) => d.region))].sort(), []);

  const filteredDealers = useMemo(() => {
    return dealers.filter((d) => {
      const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchesStatus = statusFilter === "all" || d.rag === statusFilter;
      const matchesRegion = regionFilter === "all" || d.region === regionFilter;
      if (!matchesSearch || !matchesStatus || !matchesRegion) return false;
      if (quickFilter === "oversight") return (dealerCssScores.get(d.name) ?? 10) < settings.css_oversight_threshold;
      if (quickFilter === "reward") return (dealerCssScores.get(d.name) ?? 0) >= settings.css_reward_threshold;
      if (quickFilter === "green" || quickFilter === "amber" || quickFilter === "red") return d.rag === quickFilter;
      return true;
    });
  }, [searchQuery, statusFilter, regionFilter, quickFilter, dealerCssScores, settings]);

  const sortedDealers = useMemo(() => {
    const sorted = [...filteredDealers].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "score":
          cmp = a.score - b.score;
          break;
        case "rag":
          cmp = ragOrder[a.rag] - ragOrder[b.rag];
          break;
        case "css":
          cmp = (dealerCssScores.get(a.name) ?? 0) - (dealerCssScores.get(b.name) ?? 0);
          break;
        case "region":
          cmp = a.region.localeCompare(b.region);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [filteredDealers, sortKey, sortDir, dealerCssScores]);

  const totalPages = Math.ceil(sortedDealers.length / ITEMS_PER_PAGE);
  const validPage = Math.min(currentPage, Math.max(1, totalPages));
  const paginatedDealers = sortedDealers.slice(
    (validPage - 1) * ITEMS_PER_PAGE,
    validPage * ITEMS_PER_PAGE
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" || key === "region" ? "asc" : "desc");
    }
    setCurrentPage(1);
  };

  const toggleRegion = (region: string) => {
    setExpandedRegions((prev) => {
      const next = new Set(prev);
      next.has(region) ? next.delete(region) : next.add(region);
      return next;
    });
  };

  // Regional grouping data
  const regionalData = useMemo(() => {
    const groups = new Map<string, typeof filteredDealers>();
    filteredDealers.forEach((d) => {
      const arr = groups.get(d.region) || [];
      arr.push(d);
      groups.set(d.region, arr);
    });
    return [...groups.entries()]
      .map(([region, dls]) => ({
        region,
        dealers: dls,
        count: dls.length,
        avgScore: Math.round(dls.reduce((s, d) => s + d.score, 0) / dls.length),
        green: dls.filter((d) => d.rag === "green").length,
        amber: dls.filter((d) => d.rag === "amber").length,
        red: dls.filter((d) => d.rag === "red").length,
      }))
      .sort((a, b) => a.region.localeCompare(b.region));
  }, [filteredDealers]);

  // Summary stats
  const oversightCount = useMemo(
    () => dealers.filter((d) => (dealerCssScores.get(d.name) ?? 10) < settings.css_oversight_threshold).length,
    [dealerCssScores, settings.css_oversight_threshold]
  );
  const rewardCount = useMemo(
    () => dealers.filter((d) => (dealerCssScores.get(d.name) ?? 0) >= settings.css_reward_threshold).length,
    [dealerCssScores, settings.css_reward_threshold]
  );
  const avgCss = useMemo(() => {
    let total = 0;
    dealerCssScores.forEach((v) => (total += v));
    return (total / dealerCssScores.size).toFixed(1);
  }, [dealerCssScores]);

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (validPage > 3) pages.push("ellipsis");
      for (let i = Math.max(2, validPage - 1); i <= Math.min(totalPages - 1, validPage + 1); i++) pages.push(i);
      if (validPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  const exportCsv = () => {
    const headers = ["Dealer Name", "Score", "RAG Status", "CSS Score", "Region", "Last Audit", "Trend"];
    const rows = sortedDealers.map((d) => [
      d.name,
      d.score,
      d.rag.toUpperCase(),
      (dealerCssScores.get(d.name) ?? 0).toFixed(1),
      d.region,
      d.lastAudit,
      d.trend,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dealer-portfolio-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortHeader = ({ label, sortKeyVal }: { label: string; sortKeyVal: SortKey }) => (
    <th
      className="text-left px-3 py-3 font-medium cursor-pointer hover:text-foreground select-none"
      onClick={() => handleSort(sortKeyVal)}
    >
      <span className="flex items-center gap-1">
        {label}
        {sortKey === sortKeyVal && (
          <ArrowUpDown className="w-3 h-3" />
        )}
      </span>
    </th>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Dealer Portfolio</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            View and manage your complete dealer network across {regions.length} regions.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => { setQuickFilter(quickFilter === "all" ? "all" : "all"); setCurrentPage(1); }}
            className="bg-card rounded-xl border border-border p-5 cursor-default"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <Users className="w-4 h-4" />
              Total Dealers
            </div>
            <span className="text-3xl font-bold text-foreground">{portfolioStats.total}</span>
            <div className="flex gap-2 mt-2 text-xs">
              <button onClick={(e) => { e.stopPropagation(); setQuickFilter(quickFilter === "green" ? "all" : "green"); setViewMode("table"); setCurrentPage(1); }} className={`hover:underline ${quickFilter === "green" ? "font-bold underline" : ""} text-rag-green`}>{portfolioStats.green} Green</button>
              <button onClick={(e) => { e.stopPropagation(); setQuickFilter(quickFilter === "amber" ? "all" : "amber"); setViewMode("table"); setCurrentPage(1); }} className={`hover:underline ${quickFilter === "amber" ? "font-bold underline" : ""} text-rag-amber`}>{portfolioStats.amber} Amber</button>
              <button onClick={(e) => { e.stopPropagation(); setQuickFilter(quickFilter === "red" ? "all" : "red"); setViewMode("table"); setCurrentPage(1); }} className={`hover:underline ${quickFilter === "red" ? "font-bold underline" : ""} text-rag-red`}>{portfolioStats.red} Red</button>
            </div>
          </div>

          <div
            onClick={() => { setSortKey("css"); setSortDir("desc"); setViewMode("table"); setCurrentPage(1); }}
            className={`bg-card rounded-xl border p-5 cursor-pointer transition-colors hover:bg-muted/50 ${sortKey === "css" && sortDir === "desc" ? "border-primary ring-1 ring-primary/30" : "border-border"}`}
          >
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <Activity className="w-4 h-4" />
              Avg CSS Score
            </div>
            <span className="text-3xl font-bold text-foreground">{avgCss}</span>
            <span className="text-lg text-muted-foreground ml-1">/ 10</span>
            {sortKey === "css" && sortDir === "desc" && <p className="text-xs text-muted-foreground mt-1">Sorted by CSS ↓</p>}
          </div>

          <div
            onClick={() => { setQuickFilter(quickFilter === "oversight" ? "all" : "oversight"); setViewMode("table"); setCurrentPage(1); }}
            className={`bg-card rounded-xl border p-5 cursor-pointer transition-colors hover:bg-muted/50 ${quickFilter === "oversight" ? "border-rag-red ring-1 ring-rag-red/30" : "border-border"}`}
          >
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <ShieldAlert className="w-4 h-4 text-rag-red" />
              Oversight Flagged
            </div>
            <span className="text-3xl font-bold text-rag-red">{oversightCount}</span>
            <p className="text-xs text-muted-foreground mt-1">Below {settings.css_oversight_threshold.toFixed(1)}{quickFilter === "oversight" ? " · Filtering" : ""}</p>
          </div>

          <div
            onClick={() => { setQuickFilter(quickFilter === "reward" ? "all" : "reward"); setViewMode("table"); setCurrentPage(1); }}
            className={`bg-card rounded-xl border p-5 cursor-pointer transition-colors hover:bg-muted/50 ${quickFilter === "reward" ? "border-accent ring-1 ring-accent/30" : "border-border"}`}
          >
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <Award className="w-4 h-4 text-accent" />
              Reward Eligible
            </div>
            <span className="text-3xl font-bold text-accent">{rewardCount}</span>
            <p className="text-xs text-muted-foreground mt-1">Above {settings.css_reward_threshold.toFixed(1)}{quickFilter === "reward" ? " · Filtering" : ""}</p>
          </div>
        </div>

        {/* Duplicate Flags */}
        <DuplicateFlagsBanner limit={5} />

        {/* Controls */}
        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search dealers..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="pl-9 h-9 bg-background"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-full sm:w-36 h-9 bg-background">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="amber">Amber</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={regionFilter} onValueChange={(v) => { setRegionFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-full sm:w-40 h-9 bg-background">
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {regions.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-1 items-center">
                {isFiltering && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters} className="gap-1.5 text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Clear Filters</span>
                    <span className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold min-w-5 h-5 px-1.5">{activeFilterCount}</span>
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={exportCsv} className="gap-1.5">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export CSV</span>
                </Button>
                  <Button
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="gap-1.5"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Table</span>
                </Button>
                <Button
                  variant={viewMode === "region" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("region")}
                  className="gap-1.5"
                >
                  <MapPin className="w-4 h-4" />
                  <span className="hidden sm:inline">By Region</span>
                </Button>
              </div>
            </div>
          </div>

          {viewMode === "table" ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <SortHeader label="Dealer Name" sortKeyVal="name" />
                      <SortHeader label="Score" sortKeyVal="score" />
                      <SortHeader label="Status" sortKeyVal="rag" />
                      <SortHeader label="CSS" sortKeyVal="css" />
                      <SortHeader label="Region" sortKeyVal="region" />
                       <th className="text-left px-3 py-3 font-medium hidden lg:table-cell">Last Audit</th>
                      <th className="text-left px-3 py-3 font-medium hidden xl:table-cell">Credit Score</th>
                      <th className="text-center px-3 py-3 font-medium">Trend</th>
                      <th className="px-3 py-3 font-medium"><span className="sr-only">Actions</span></th>
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
                            style={{ animationDelay: `${index * 30}ms`, animationFillMode: "forwards" }}
                          >
                            <td className="px-3 py-3 font-medium text-foreground">
                              <span className="flex items-center gap-2">
                                {dealer.name}
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${dealer.firmType === "DA" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                                  {dealer.firmType}
                                </span>
                              </span>
                            </td>
                            <td className="px-3 py-3 text-foreground font-semibold">{dealer.score}</td>
                            <td className="px-3 py-3"><RagBadge status={dealer.rag} /></td>
                            <td className="px-3 py-3">
                              {isOversight ? (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <span className="inline-flex items-center gap-1 text-rag-red font-semibold">
                                      <ShieldAlert className="w-3.5 h-3.5" /> {cssScore.toFixed(1)}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent><p className="text-xs">Enhanced Oversight</p></TooltipContent>
                                </Tooltip>
                              ) : isReward ? (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <span className="inline-flex items-center gap-1 text-accent font-semibold">
                                      <Award className="w-3.5 h-3.5" /> {cssScore.toFixed(1)}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent><p className="text-xs">Positive Reward</p></TooltipContent>
                                </Tooltip>
                              ) : (
                                <span className="text-muted-foreground">{cssScore.toFixed(1)}</span>
                              )}
                            </td>
                            <td className="px-3 py-3 text-muted-foreground">{dealer.region}</td>
                            <td className="px-3 py-3 text-muted-foreground hidden lg:table-cell">{dealer.lastAudit}</td>
                            <td className="px-3 py-3 hidden xl:table-cell">
                              {(() => {
                                // Deterministic mock credit score based on dealer compliance score
                                const cs = Math.min(100, Math.max(1, Math.round(dealer.score * 0.85 + (dealer.name.charCodeAt(0) % 20))));
                                const color = cs >= 71 ? "text-emerald-600" : cs >= 40 ? "text-amber-600" : "text-destructive";
                                return <span className={`font-semibold text-sm ${color}`}>{cs}</span>;
                              })()}
                            </td>
                            <td className="px-3 py-3 text-center"><TrendIcon trend={dealer.trend} /></td>
                            <td className="px-3 py-3 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1.5 text-muted-foreground hover:text-foreground"
                                onClick={(e) => { e.stopPropagation(); navigate(`/documents?dealer=${encodeURIComponent(dealer.name)}`); }}
                              >
                                <FolderOpen className="w-4 h-4" />
                                <span className="hidden xl:inline">Docs</span>
                                {(docCounts.get(dealer.name) || 0) > 0 && (
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 min-w-5 h-5 justify-center">
                                    {docCounts.get(dealer.name)}
                                  </Badge>
                                )}
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-5 py-8 text-center text-muted-foreground">
                          No dealers found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="px-5 py-4 border-t border-border flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {(validPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(validPage * ITEMS_PER_PAGE, sortedDealers.length)} of {sortedDealers.length}
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className={validPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {getPageNumbers().map((page, idx) => (
                        <PaginationItem key={idx}>
                          {page === "ellipsis" ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={validPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          className={validPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            /* Region grouping view */
            <div className="divide-y divide-border">
              {regionalData.length > 0 ? (
                regionalData.map((group) => (
                  <div key={group.region}>
                    <button
                      onClick={() => toggleRegion(group.region)}
                      className="w-full px-5 py-3.5 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
                    >
                      {expandedRegions.has(group.region) ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-medium text-foreground">{group.region}</span>
                      <span className="text-xs text-muted-foreground ml-1">({group.count} dealers)</span>
                      <div className="flex gap-2 ml-auto text-xs">
                        <span className="text-muted-foreground">Avg: <span className="font-semibold text-foreground">{group.avgScore}%</span></span>
                        <span className="text-rag-green">{group.green}G</span>
                        <span className="text-rag-amber">{group.amber}A</span>
                        <span className="text-rag-red">{group.red}R</span>
                      </div>
                    </button>
                    {expandedRegions.has(group.region) && (
                      <div className="bg-muted/20">
                        <table className="w-full text-sm">
                          <tbody>
                            {group.dealers.map((dealer) => {
                              const cssScore = dealerCssScores.get(dealer.name) ?? 0;
                              const isOversight = cssScore < settings.css_oversight_threshold;
                              const isReward = cssScore >= settings.css_reward_threshold;
                              return (
                                <tr
                                  key={dealer.name}
                                  onClick={() => navigate(`/dealer/${encodeURIComponent(dealer.name)}`)}
                                  className="border-b border-border/50 last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
                                >
                                  <td className="pl-12 pr-3 py-2.5 font-medium text-foreground">{dealer.name}</td>
                                  <td className="px-3 py-2.5 font-semibold text-foreground w-16">{dealer.score}</td>
                                  <td className="px-3 py-2.5 w-24"><RagBadge status={dealer.rag} /></td>
                                  <td className="px-3 py-2.5 w-20">
                                    {isOversight ? (
                                      <span className="inline-flex items-center gap-1 text-rag-red text-xs font-semibold">
                                        <ShieldAlert className="w-3 h-3" /> {cssScore.toFixed(1)}
                                      </span>
                                    ) : isReward ? (
                                      <span className="inline-flex items-center gap-1 text-accent text-xs font-semibold">
                                        <Award className="w-3 h-3" /> {cssScore.toFixed(1)}
                                      </span>
                                    ) : (
                                      <span className="text-xs text-muted-foreground">{cssScore.toFixed(1)}</span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2.5 text-center w-12"><TrendIcon trend={dealer.trend} /></td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-5 py-8 text-center text-muted-foreground">
                  No dealers found matching your criteria.
                </div>
              )}
            </div>
        )}
        </div>

        {/* Batch AI Summary Generator */}
        <BatchAiSummary />
      </div>
    </DashboardLayout>
  );
};

export default Dealers;
