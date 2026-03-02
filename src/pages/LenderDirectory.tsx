import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Users, Building2, AlertTriangle, ChevronRight, LayoutGrid, List, Clock, Send } from "lucide-react";
import { allTcgLenders } from "@/data/tcg/lenders";

type SortKey = "name" | "dealerCount" | "avgPortfolioScore" | "pendingAlerts" | "openActions" | "status" | "lastLogin";

const LenderDirectory = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"card" | "table">("card");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    let list = allTcgLenders.filter(
      (l) =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.tradingName.toLowerCase().includes(search.toLowerCase())
    );
    list = [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name": cmp = a.tradingName.localeCompare(b.tradingName); break;
        case "dealerCount": cmp = a.dealerCount - b.dealerCount; break;
        case "avgPortfolioScore": cmp = (a.avgPortfolioScore ?? -1) - (b.avgPortfolioScore ?? -1); break;
        case "pendingAlerts": cmp = a.pendingAlerts - b.pendingAlerts; break;
        case "openActions": cmp = a.openActions - b.openActions; break;
        case "status": cmp = a.status.localeCompare(b.status); break;
        case "lastLogin": cmp = (a.lastLogin ?? "").localeCompare(b.lastLogin ?? ""); break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [search, sortKey, sortAsc]);

  const totalDealers = allTcgLenders.reduce((s, l) => s + l.dealerCount, 0);
  const activeLenders = allTcgLenders.filter((l) => l.status === "Active").length;
  const pendingLenders = allTcgLenders.filter((l) => l.status === "Pending Activation").length;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (sortAsc ? " ↑" : " ↓") : "";

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatDateTime = (iso: string | null) => {
    if (!iso) return "Never";
    const d = new Date(iso);
    return `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
  };

  const extractCity = (address: string) => {
    const parts = address.split(",").map((p) => p.trim());
    return parts.length >= 2 ? parts[parts.length - 2] : parts[0];
  };

  const statusColor = (s: string) => {
    if (s === "Active") return "hsl(var(--outcome-pass))";
    if (s === "Pending Activation") return "hsl(var(--outcome-pending))";
    return "hsl(var(--muted-foreground))";
  };

  const alertIndicator = (count: number) => {
    if (count === 0) return <span className="text-muted-foreground">0</span>;
    if (count <= 3) return <span className="text-[hsl(var(--outcome-pending))] font-semibold">🟡 {count}</span>;
    return <span className="text-[hsl(var(--outcome-fail))] font-semibold">🔴 {count}</span>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-foreground">Lender Directory</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            All lenders onboarded to the DealerGuard platform. Click a lender to view their profile. Lender-specific configuration is read-only from the TCG view.
          </p>
        </div>

        {/* KPI strip */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Total Lenders", value: allTcgLenders.length },
            { label: "Active", value: activeLenders },
            { label: "Pending Activation", value: pendingLenders },
            { label: "Total Dealers Across Platform", value: totalDealers },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="bg-card border border-border rounded-lg px-4 py-2.5 flex items-center gap-2"
            >
              <span className="text-sm text-muted-foreground">{kpi.label}:</span>
              <span className="text-lg font-bold text-foreground">{kpi.value}</span>
            </div>
          ))}
        </div>

        {/* Search + view toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search lenders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 bg-background"
            />
          </div>
          <div className="flex gap-1 border border-border rounded-lg p-0.5">
            <Button
              size="sm"
              variant={view === "card" ? "default" : "ghost"}
              className="h-7 px-2.5 text-xs gap-1.5"
              onClick={() => setView("card")}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Cards
            </Button>
            <Button
              size="sm"
              variant={view === "table" ? "default" : "ghost"}
              className="h-7 px-2.5 text-xs gap-1.5"
              onClick={() => setView("table")}
            >
              <List className="w-3.5 h-3.5" /> Table
            </Button>
          </div>
        </div>

        {/* Card view */}
        {view === "card" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((lender) => {
              const isPending = lender.status === "Pending Activation";
              return (
                <Card
                  key={lender.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/tcg/lenders/${lender.id}`)}
                >
                  <CardContent className="p-5 space-y-3">
                    {/* Row 1: Name + status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-foreground">{lender.name}</div>
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-medium shrink-0 px-2 py-0.5 rounded-full"
                        style={{
                          color: statusColor(lender.status),
                          backgroundColor: `color-mix(in srgb, ${statusColor(lender.status)} 12%, transparent)`,
                        }}
                      >
                        {isPending ? "⏳" : "●"} {lender.status}
                      </span>
                    </div>

                    {/* Row 2: Contact */}
                    <div className="text-sm text-muted-foreground">
                      {lender.contactName} · {lender.contactEmail}
                    </div>

                    {/* Row 3: Location + contract */}
                    <div className="text-sm text-muted-foreground">
                      {extractCity(lender.billingAddress)} · On platform since: {formatDate(lender.contractStart)}
                    </div>

                    {/* Row 4: Stats */}
                    {!isPending ? (
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                        <span><span className="text-muted-foreground">Dealers:</span> <span className="font-semibold text-foreground">{lender.dealerCount}</span></span>
                        <span><span className="text-muted-foreground">Avg Score:</span> <span className="font-semibold text-foreground">{lender.avgPortfolioScore ?? "—"}</span></span>
                        <span><span className="text-muted-foreground">Score Range:</span> <span className="font-semibold text-foreground">{lender.scoreRange ? `${lender.scoreRange.min} – ${lender.scoreRange.max}` : "—"}</span></span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                        <span><span className="text-muted-foreground">Dealers:</span> <span className="font-semibold text-foreground">0</span></span>
                        <span><span className="text-muted-foreground">Avg Score:</span> <span className="font-semibold text-foreground">—</span></span>
                        <span><span className="text-muted-foreground">Score Range:</span> <span className="font-semibold text-foreground">—</span></span>
                      </div>
                    )}

                    {/* Row 5: Alerts / Actions OR pending message */}
                    {!isPending ? (
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                        <span><span className="text-muted-foreground">Pending Alerts:</span> {alertIndicator(lender.pendingAlerts)}</span>
                        <span><span className="text-muted-foreground">Open Actions:</span> <span className="font-semibold text-foreground">{lender.openActions}</span></span>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground italic">
                        Account not yet activated — invitation sent {formatDate(lender.contractStart)}
                      </div>
                    )}

                    {/* Row 6: Last login + actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-border">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last login: {lender.lastLoginUser ? `${lender.lastLoginUser} · ` : ""}
                        {formatDateTime(lender.lastLogin)}
                      </div>
                      <div className="flex gap-2">
                        {isPending && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                            onClick={(e) => { e.stopPropagation(); }}
                          >
                            <Send className="w-3 h-3" /> Resend Invite
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs gap-1 text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tcg/lenders/${lender.id}`);
                          }}
                        >
                          View Profile <ChevronRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No lenders found matching your search.
              </div>
            )}
          </div>
        )}

        {/* Table view */}
        {view === "table" && (
          <div className="bg-card rounded-xl border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("name")}>Lender Name{sortIndicator("name")}</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-center cursor-pointer select-none" onClick={() => toggleSort("dealerCount")}>Dealers{sortIndicator("dealerCount")}</TableHead>
                  <TableHead className="text-center cursor-pointer select-none" onClick={() => toggleSort("avgPortfolioScore")}>Avg Score{sortIndicator("avgPortfolioScore")}</TableHead>
                  <TableHead className="text-center">Score Range</TableHead>
                  <TableHead className="text-center cursor-pointer select-none" onClick={() => toggleSort("pendingAlerts")}>Pending Alerts{sortIndicator("pendingAlerts")}</TableHead>
                  <TableHead className="text-center cursor-pointer select-none" onClick={() => toggleSort("openActions")}>Open Actions{sortIndicator("openActions")}</TableHead>
                  <TableHead className="text-center cursor-pointer select-none" onClick={() => toggleSort("status")}>Status{sortIndicator("status")}</TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("lastLogin")}>Last Login{sortIndicator("lastLogin")}</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((lender) => {
                  const isPending = lender.status === "Pending Activation";
                  return (
                    <TableRow
                      key={lender.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/tcg/lenders/${lender.id}`)}
                    >
                      <TableCell>
                        <span className="font-medium text-foreground">{lender.tradingName}</span>
                        <p className="text-xs text-muted-foreground">{lender.name}</p>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-foreground">{lender.contactName}</span>
                        <p className="text-xs text-muted-foreground">{lender.contactEmail}</p>
                      </TableCell>
                      <TableCell className="text-center font-semibold">{lender.dealerCount}</TableCell>
                      <TableCell className="text-center font-semibold">
                        {lender.avgPortfolioScore !== null ? lender.avgPortfolioScore : "—"}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {lender.scoreRange ? `${lender.scoreRange.min}–${lender.scoreRange.max}` : "—"}
                      </TableCell>
                      <TableCell className="text-center">{alertIndicator(lender.pendingAlerts)}</TableCell>
                      <TableCell className="text-center font-semibold">
                        {lender.openActions > 0 ? lender.openActions : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            color: statusColor(lender.status),
                            backgroundColor: `color-mix(in srgb, ${statusColor(lender.status)} 12%, transparent)`,
                          }}
                        >
                          {isPending ? "⏳" : "●"} {isPending ? "Pending" : lender.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDateTime(lender.lastLogin)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-7 text-xs">View</Button>
                          {isPending && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Resend
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No lenders found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LenderDirectory;
