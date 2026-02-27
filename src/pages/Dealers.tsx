import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
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
import { Progress } from "@/components/ui/progress";
import { dealers, portfolioStats } from "@/data/dealers";
import { BatchAiSummary } from "@/components/dealer/BatchAiSummary";
import { DuplicateFlagsBanner } from "@/components/dealer/DuplicateFlagsBanner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const ITEMS_PER_PAGE = 15;

type SortKey = "name" | "score" | "region";
type SortDir = "asc" | "desc";

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === "up") return <TrendingUp className="w-4 h-4 text-foreground" />;
  if (trend === "down") return <TrendingDown className="w-4 h-4 text-foreground" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
};

const Dealers = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRegion = searchParams.get("region") || "all";
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState(initialRegion);
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 100]);
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

  const isScoreFiltered = scoreRange[0] > 0 || scoreRange[1] < 100;
  const activeFilterCount = [searchQuery !== "", regionFilter !== "all", isScoreFiltered].filter(Boolean).length;
  const isFiltering = activeFilterCount > 0;

  const clearAllFilters = () => {
    setSearchQuery("");
    setRegionFilter("all");
    setScoreRange([0, 100]);
    setCurrentPage(1);
  };

  const regions = useMemo(() => [...new Set(dealers.map((d) => d.region))].sort(), []);

  const filteredDealers = useMemo(() => {
    return dealers.filter((d) => {
      const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchesRegion = regionFilter === "all" || d.region === regionFilter;
      const matchesScore = d.score >= scoreRange[0] && d.score <= scoreRange[1];
      return matchesSearch && matchesRegion && matchesScore;
    });
  }, [searchQuery, regionFilter, scoreRange]);

  const sortedDealers = useMemo(() => {
    const sorted = [...filteredDealers].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name": cmp = a.name.localeCompare(b.name); break;
        case "score": cmp = a.score - b.score; break;
        case "region": cmp = a.region.localeCompare(b.region); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [filteredDealers, sortKey, sortDir]);

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
      }))
      .sort((a, b) => a.region.localeCompare(b.region));
  }, [filteredDealers]);

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
    const headers = ["Dealer Name", "Score", "Region", "Last Audit", "Trend"];
    const rows = sortedDealers.map((d) => [d.name, d.score, d.region, d.lastAudit, d.trend]);
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
        {sortKey === sortKeyVal && <ArrowUpDown className="w-3 h-3" />}
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
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <Users className="w-4 h-4" />
              Total Dealers
            </div>
            <span className="text-3xl font-bold text-foreground">{portfolioStats.total}</span>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <Activity className="w-4 h-4" />
              Avg Score
            </div>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-bold text-foreground">{portfolioStats.avgScore}</span>
              <span className="text-lg text-muted-foreground">/ 100</span>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5 col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <MapPin className="w-4 h-4" />
              Regions
            </div>
            <span className="text-3xl font-bold text-foreground">{regions.length}</span>
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

            {/* Score Range Filter */}
            <div className="mt-4 pt-3 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs text-muted-foreground">Filter by score range</Label>
                <span className="text-xs font-semibold text-foreground">{scoreRange[0]} – {scoreRange[1]}</span>
              </div>
              <Slider
                value={scoreRange}
                onValueChange={(v) => { setScoreRange(v as [number, number]); setCurrentPage(1); }}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {viewMode === "table" ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <SortHeader label="Dealer Name" sortKeyVal="name" />
                      <th className="text-left px-3 py-3 font-medium hidden lg:table-cell">Trading Name</th>
                      <SortHeader label="Score" sortKeyVal="score" />
                      <SortHeader label="Region" sortKeyVal="region" />
                      <th className="text-left px-3 py-3 font-medium hidden lg:table-cell">Last Audit</th>
                      <th className="text-center px-3 py-3 font-medium">Alerts</th>
                      <th className="text-center px-3 py-3 font-medium">Trend</th>
                      <th className="px-3 py-3 font-medium"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDealers.length > 0 ? (
                      paginatedDealers.map((dealer, index) => (
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
                          <td className="px-3 py-3 text-muted-foreground hidden lg:table-cell">{dealer.tradingName}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2 min-w-[100px]">
                              <span className="font-semibold text-foreground w-8 text-right">{dealer.score}</span>
                              <Progress value={dealer.score} className="h-1.5 flex-1 max-w-[60px] [&>div]:bg-muted-foreground" />
                            </div>
                          </td>
                          <td className="px-3 py-3 text-muted-foreground">{dealer.region}</td>
                          <td className="px-3 py-3 text-muted-foreground hidden lg:table-cell">{dealer.lastAudit}</td>
                          <td className="px-3 py-3 text-center">
                            {dealer.alertCount > 0 ? (
                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 min-w-5 h-5 justify-center">
                                {dealer.alertCount}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">0</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-center"><TrendIcon trend={dealer.trend} /></td>
                          <td className="px-3 py-3 text-right">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                                  onClick={(e) => { e.stopPropagation(); navigate(`/documents?dealer=${encodeURIComponent(dealer.name)}`); }}
                                >
                                  <FolderOpen className="w-4 h-4" />
                                  {(docCounts.get(dealer.name) || 0) > 0 && (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 min-w-5 h-5 justify-center">
                                      {docCounts.get(dealer.name)}
                                    </Badge>
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p className="text-xs">View dealer documents</p></TooltipContent>
                            </Tooltip>
                          </td>
                        </tr>
                      ))
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
                      <span className="ml-auto text-xs text-muted-foreground">
                        Avg: <span className="font-semibold text-foreground">{group.avgScore}</span>
                      </span>
                    </button>
                    {expandedRegions.has(group.region) && (
                      <div className="bg-muted/20">
                        <table className="w-full text-sm">
                          <tbody>
                            {group.dealers.map((dealer) => (
                              <tr
                                key={dealer.name}
                                onClick={() => navigate(`/dealer/${encodeURIComponent(dealer.name)}`)}
                                className="border-b border-border/50 last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
                              >
                                <td className="pl-12 pr-3 py-2.5 font-medium text-foreground">{dealer.name}</td>
                                <td className="px-3 py-2.5 w-28">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-foreground w-8 text-right">{dealer.score}</span>
                                    <Progress value={dealer.score} className="h-1.5 flex-1 max-w-[48px] [&>div]:bg-muted-foreground" />
                                  </div>
                                </td>
                                <td className="px-3 py-2.5 text-center w-12"><TrendIcon trend={dealer.trend} /></td>
                              </tr>
                            ))}
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
