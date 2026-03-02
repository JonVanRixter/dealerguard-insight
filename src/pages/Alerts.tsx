import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
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
  CalendarDays,
  Check,
  Copy,
  UserX,
} from "lucide-react";
import { dealers } from "@/data/dealers";
import { generateDealerAudit, AUDIT_SECTIONS, ControlCheck, AuditSection } from "@/data/auditFramework";
import { getOverdueRechecks } from "@/utils/recheckSchedule";
import { useCompletedRechecks } from "@/hooks/useCompletedRechecks";
import { DuplicateFlagsBanner } from "@/components/dealer/DuplicateFlagsBanner";
import { useDismissedDuplicates } from "@/hooks/useDismissedDuplicates";
import cadenceAlertsData from "@/data/tcg/cadenceAlerts.json";

interface Alert {
  id: string;
  dealerName: string;
  dealerIndex: number;
  sectionId: string;
  sectionName: string;
  controlArea: string;
  objective: string;
  result: "pass" | "fail" | "partial";
  riskRating: string;
  comments: string;
  automated: boolean;
  frequency: string;
}

interface CadenceAlert {
  id: string;
  type: string;
  dealerId: string;
  dealerName: string;
  controlId: string;
  controlName: string;
  sectionName: string;
  severity: string;
  message: string;
  daysOverdue?: number;
  daysRemaining?: number;
  status: string;
  createdDate: string;
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
          if (control.riskRating === "attention" || control.riskRating === "fail") {
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
      if (a.riskRating === "fail" && b.riskRating !== "fail") return -1;
      if (a.riskRating !== "fail" && b.riskRating === "fail") return 1;
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
  const criticalCount = allAlerts.filter((a) => a.riskRating === "fail").length;
  const warningCount = allAlerts.filter((a) => a.riskRating === "attention").length;
  const cadenceAlerts: CadenceAlert[] = cadenceAlertsData as CadenceAlert[];
  const cadenceOverdueCount = cadenceAlerts.filter((a) => a.type === "Check Overdue").length;
  const cadenceUrgentCount = cadenceAlerts.filter((a) => a.type === "Check Due Urgently" || a.type === "Check Due Soon").length;

  // Overdue re-checks
  const { isCompleted, markComplete } = useCompletedRechecks();
  const allOverdueRechecks = useMemo(() => getOverdueRechecks(), []);
  const overdueRechecks = useMemo(
    () => allOverdueRechecks.filter((r) => !isCompleted(r.dealerName, r.recheckMonth)),
    [allOverdueRechecks, isCompleted]
  );

  // Duplicate detection
  const { activeDuplicates } = useDismissedDuplicates();

  // Failed onboarding applications
  const [failedApps, setFailedApps] = useState<{ id: string; dealer_name: string; failure_reason: string | null; updated_at: string }[]>([]);
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("onboarding_applications")
        .select("id, dealer_name, failure_reason, updated_at")
        .eq("user_id", user.id)
        .eq("status", "failed")
        .order("updated_at", { ascending: false });
      if (data) setFailedApps(data);
    })();
  }, []);

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
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <ShieldAlert className="w-4 h-4 text-destructive" />
              Critical Alerts
            </div>
            <span className="text-3xl font-bold text-destructive">{criticalCount}</span>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
              Warning Alerts
            </div>
            <span className="text-3xl font-bold text-foreground">{warningCount}</span>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <CalendarDays className="w-4 h-4 text-destructive" />
              Check Overdue
            </div>
            <span className={`text-3xl font-bold ${cadenceOverdueCount > 0 ? "text-destructive" : "text-foreground"}`}>
              {cadenceOverdueCount}
            </span>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <CalendarCheck className="w-4 h-4 text-destructive" />
              Overdue Re-Checks
            </div>
            <span className={`text-3xl font-bold ${overdueRechecks.length > 0 ? "text-destructive" : "text-foreground"}`}>
              {overdueRechecks.length}
            </span>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <UserX className="w-4 h-4 text-destructive" />
              Failed Onboarding
            </div>
            <span className={`text-3xl font-bold ${failedApps.length > 0 ? "text-destructive" : "text-foreground"}`}>
              {failedApps.length}
            </span>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <Copy className="w-4 h-4 text-muted-foreground" />
              Duplicate Flags
            </div>
            <span className={`text-3xl font-bold ${activeDuplicates.length > 0 ? "text-foreground" : "text-foreground"}`}>
              {activeDuplicates.length}
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
                <CalendarCheck className="w-4 h-4 text-destructive" />
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
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => navigate(`/dealer/${encodeURIComponent(item.dealerName)}`)}
                          className="font-medium text-foreground hover:text-primary hover:underline transition-colors text-left"
                        >
                          {item.dealerName}
                        </button>
                      </td>
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

        {/* Failed Onboarding */}
        {failedApps.length > 0 && (
          <div className="bg-card rounded-xl border border-border">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserX className="w-4 h-4 text-destructive" />
                <h3 className="text-sm font-semibold text-foreground">Failed Onboarding Applications</h3>
              </div>
              <Badge variant="destructive" className="text-xs">
                {failedApps.length} failed
              </Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left px-5 py-3 font-medium">Dealer</th>
                    <th className="text-left px-3 py-3 font-medium">Reason</th>
                    <th className="text-left px-3 py-3 font-medium">Date</th>
                    <th className="text-center px-3 py-3 font-medium w-20">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {failedApps.slice(0, 10).map((app) => (
                    <tr key={app.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-foreground">{app.dealer_name}</td>
                      <td className="px-3 py-3.5 text-muted-foreground">{app.failure_reason || "—"}</td>
                      <td className="px-3 py-3.5 text-muted-foreground">
                        {new Date(app.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <Button variant="ghost" size="sm" onClick={() => navigate("/pre-onboarding")} className="h-8 px-2">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Duplicate Flags */}
        <DuplicateFlagsBanner limit={5} compact />

        {/* Cadence-Based Schedule Alerts */}
        {cadenceAlerts.length > 0 && (
          <div className="bg-card rounded-xl border border-border">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-destructive" />
                <h3 className="text-sm font-semibold text-foreground">Check Schedule Alerts</h3>
              </div>
              <Badge variant="destructive" className="text-xs">
                {cadenceAlerts.length} alert{cadenceAlerts.length !== 1 ? "s" : ""}
              </Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left px-5 py-3 font-medium w-8"></th>
                    <th className="text-left px-3 py-3 font-medium">Type</th>
                    <th className="text-left px-3 py-3 font-medium">Dealer</th>
                    <th className="text-left px-3 py-3 font-medium">Section</th>
                    <th className="text-left px-3 py-3 font-medium">Control</th>
                    <th className="text-left px-3 py-3 font-medium hidden lg:table-cell">Message</th>
                    <th className="text-center px-3 py-3 font-medium">Severity</th>
                    <th className="text-center px-3 py-3 font-medium w-20">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cadenceAlerts.map((alert) => {
                    const isOverdue = alert.type === "Check Overdue";
                    const isUrgent = alert.type === "Check Due Urgently";
                    return (
                      <tr
                        key={alert.id}
                        className={`border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${
                          isOverdue ? "bg-[hsl(0,100%,97%)]" : isUrgent ? "bg-[hsl(48,100%,97%)]" : ""
                        }`}
                      >
                        <td className="pl-5 pr-1 py-3.5 text-base">📅</td>
                        <td className="px-3 py-3.5">
                          <Badge
                            variant={isOverdue ? "destructive" : "outline"}
                            className="text-[10px] px-1.5 py-0 whitespace-nowrap"
                          >
                            {alert.type}
                          </Badge>
                        </td>
                        <td className="px-3 py-3.5">
                          <button
                            onClick={() => navigate(`/tcg/dealers/${alert.dealerId}`)}
                            className="font-medium text-foreground hover:text-primary hover:underline transition-colors text-left"
                          >
                            {alert.dealerName}
                          </button>
                        </td>
                        <td className="px-3 py-3.5 text-muted-foreground">{alert.sectionName}</td>
                        <td className="px-3 py-3.5 text-foreground">{alert.controlName}</td>
                        <td className="px-3 py-3.5 text-muted-foreground hidden lg:table-cell max-w-xs truncate">
                          {alert.message}
                        </td>
                        <td className="px-3 py-3.5 text-center">
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                            {alert.severity}
                          </Badge>
                        </td>
                        <td className="px-3 py-3.5 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/tcg/dealers/${alert.dealerId}`)}
                            className="h-8 px-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
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
                  <SelectItem value="fail">Critical</SelectItem>
                  <SelectItem value="attention">Warning</SelectItem>
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
                          <button
                            onClick={() => navigate(`/dealer/${encodeURIComponent(alert.dealerName)}`)}
                            className="font-medium text-foreground hover:text-primary hover:underline transition-colors text-left"
                          >
                            {alert.dealerName}
                          </button>
                          {alert.automated && (
                            <span title="Automated check">
                              <Zap className="w-3.5 h-3.5 text-muted-foreground" />
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
                        <Badge variant={alert.riskRating === "red" ? "destructive" : "outline"} className="text-[10px] px-1.5 py-0">
                          {alert.riskRating === "red" ? "Critical" : "Warning"}
                        </Badge>
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
