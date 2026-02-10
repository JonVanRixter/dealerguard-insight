import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { RagBadge } from "@/components/RagBadge";
import { Badge } from "@/components/ui/badge";
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
  AlertTriangle,
  ShieldAlert,
  Search,
  ExternalLink,
  Filter,
  Zap,
  CalendarCheck,
  Check,
} from "lucide-react";
import { dealers } from "@/data/dealers";
import { generateDealerAudit, AUDIT_SECTIONS, ControlCheck, AuditSection } from "@/data/auditFramework";
import { RagStatus } from "@/data/dealers";
import { getOverdueRechecks } from "@/utils/recheckSchedule";
import { useCompletedRechecks } from "@/hooks/useCompletedRechecks";

interface Alert {
  id: string;
  dealerName: string;
  dealerIndex: number;
  sectionId: string;
  sectionName: string;
  controlArea: string;
  objective: string;
  result: "pass" | "fail" | "partial";
  riskRating: RagStatus;
  comments: string;
  automated: boolean;
  frequency: string;
}

const ITEMS_PER_PAGE = 15;

const Alerts = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Aggregate all alerts across all dealers
  const allAlerts = useMemo(() => {
    const alerts: Alert[] = [];
    
    dealers.forEach((dealer, index) => {
      const audit = generateDealerAudit(dealer.name, index);
      
      audit.sections.forEach((section) => {
        section.controls.forEach((control) => {
          // Only include amber and red alerts
          if (control.riskRating === "amber" || control.riskRating === "red") {
            alerts.push({
              id: `${dealer.name}-${section.id}-${control.id}`,
              dealerName: dealer.name,
              dealerIndex: index,
              sectionId: section.id,
              sectionName: section.name,
              controlArea: control.controlArea,
              objective: control.objective,
              result: control.result,
              riskRating: control.riskRating,
              comments: control.comments,
              automated: control.automated,
              frequency: control.frequency,
            });
          }
        });
      });
    });

    // Sort by severity (red first) then by dealer name
    return alerts.sort((a, b) => {
      if (a.riskRating === "red" && b.riskRating !== "red") return -1;
      if (a.riskRating !== "red" && b.riskRating === "red") return 1;
      return a.dealerName.localeCompare(b.dealerName);
    });
  }, []);

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    return allAlerts.filter((alert) => {
      const matchesSearch =
        alert.dealerName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        alert.controlArea.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        alert.comments.toLowerCase().includes(searchQuery.toLowerCase().trim());
      
      const matchesSeverity =
        severityFilter === "all" || alert.riskRating === severityFilter;
      
      const matchesSection =
        sectionFilter === "all" || alert.sectionId === sectionFilter;
      
      return matchesSearch && matchesSeverity && matchesSection;
    });
  }, [allAlerts, searchQuery, severityFilter, sectionFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredAlerts.length / ITEMS_PER_PAGE);
  const validCurrentPage = Math.min(currentPage, Math.max(1, totalPages));

  const paginatedAlerts = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredAlerts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAlerts, validCurrentPage]);

  // Reset page on filter change
  const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value);
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

  // Stats
  const criticalCount = allAlerts.filter((a) => a.riskRating === "red").length;
  const warningCount = allAlerts.filter((a) => a.riskRating === "amber").length;

  // Overdue re-checks
  const { isCompleted, markComplete } = useCompletedRechecks();
  const allOverdueRechecks = useMemo(() => getOverdueRechecks(), []);
  const overdueRechecks = useMemo(
    () => allOverdueRechecks.filter((r) => !isCompleted(r.dealerName, r.recheckMonth)),
    [allOverdueRechecks, isCompleted]
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-foreground">Alerts</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor and respond to compliance alerts across all dealers.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <ShieldAlert className="w-4 h-4 text-rag-red" />
              Critical Alerts
            </div>
            <span className="text-3xl font-bold text-rag-red">{criticalCount}</span>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <AlertTriangle className="w-4 h-4 text-rag-amber" />
              Warning Alerts
            </div>
            <span className="text-3xl font-bold text-rag-amber">{warningCount}</span>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <CalendarCheck className="w-4 h-4 text-rag-red" />
              Overdue Re-Checks
            </div>
            <span className={`text-3xl font-bold ${overdueRechecks.length > 0 ? "text-rag-red" : "text-foreground"}`}>
              {overdueRechecks.length}
            </span>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <Filter className="w-4 h-4" />
              Showing
            </div>
            <span className="text-3xl font-bold text-foreground">{filteredAlerts.length}</span>
            <span className="text-sm text-muted-foreground ml-1">of {allAlerts.length}</span>
          </div>
        </div>

        {/* Overdue Re-Checks Banner */}
        {overdueRechecks.length > 0 && (
          <div className="bg-card rounded-xl border border-border">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-rag-red" />
                <h3 className="text-sm font-semibold text-foreground">Overdue Re-Checks</h3>
              </div>
              <Badge variant="destructive" className="text-xs">
                {overdueRechecks.length} overdue
              </Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left px-5 py-3 font-medium">Dealer</th>
                    <th className="text-left px-3 py-3 font-medium">Re-Check</th>
                    <th className="text-left px-3 py-3 font-medium">Due Date</th>
                    <th className="text-center px-3 py-3 font-medium">Days Overdue</th>
                    <th className="text-center px-3 py-3 font-medium w-20">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueRechecks.slice(0, 10).map((item) => (
                    <tr
                      key={`${item.dealerName}-${item.recheckMonth}`}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-medium text-foreground">{item.dealerName}</td>
                      <td className="px-3 py-3.5 text-muted-foreground">{item.recheckMonth}-month</td>
                      <td className="px-3 py-3.5 text-muted-foreground">
                        {item.recheckDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <Badge variant="destructive" className="text-xs">{item.daysOverdue}d</Badge>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/dealer/${encodeURIComponent(item.dealerName)}`)}
                            className="h-8 px-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markComplete(item.dealerName, item.recheckMonth)}
                            className="h-8 px-2 text-xs"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" /> Complete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by dealer, control area, or issue..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 h-9 bg-background"
                />
              </div>
              <Select value={severityFilter} onValueChange={handleFilterChange(setSeverityFilter)}>
                <SelectTrigger className="w-full sm:w-40 h-9 bg-background">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="red">Critical (Red)</SelectItem>
                  <SelectItem value="amber">Warning (Amber)</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sectionFilter} onValueChange={handleFilterChange(setSectionFilter)}>
                <SelectTrigger className="w-full sm:w-52 h-9 bg-background">
                  <SelectValue placeholder="Audit Section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {AUDIT_SECTIONS.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Alerts Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left px-5 py-3 font-medium">Dealer</th>
                  <th className="text-left px-3 py-3 font-medium">Section</th>
                  <th className="text-left px-3 py-3 font-medium">Control Area</th>
                  <th className="text-left px-3 py-3 font-medium hidden lg:table-cell">Issue</th>
                  <th className="text-center px-3 py-3 font-medium">Severity</th>
                  <th className="text-center px-3 py-3 font-medium w-20">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAlerts.length > 0 ? (
                  paginatedAlerts.map((alert) => (
                    <tr
                      key={alert.id}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{alert.dealerName}</span>
                          {alert.automated && (
                            <span title="Automated check">
                              <Zap className="w-3.5 h-3.5 text-rag-amber" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-muted-foreground">{alert.sectionName}</td>
                      <td className="px-3 py-3.5 text-foreground">{alert.controlArea}</td>
                      <td className="px-3 py-3.5 text-muted-foreground hidden lg:table-cell max-w-xs truncate">
                        {alert.comments}
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <RagBadge status={alert.riskRating} size="sm" />
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/dealer/${encodeURIComponent(alert.dealerName)}`)}
                          className="h-8 px-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                      No alerts found matching your criteria.
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
                Showing {((validCurrentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(validCurrentPage * ITEMS_PER_PAGE, filteredAlerts.length)} of {filteredAlerts.length} alerts
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={validCurrentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Alerts;
