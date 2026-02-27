import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { reviewQueueItems, ReviewQueueItem, ReviewStatus, ReviewPriority } from "@/data/tcg/reviewQueue";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Eye, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";

const priorityOrder: Record<ReviewPriority, number> = { High: 0, Medium: 1, Low: 2 };

const statusIcon: Record<ReviewStatus, React.ReactNode> = {
  Open: <AlertTriangle className="w-3.5 h-3.5 text-destructive" />,
  "In Progress": <Clock className="w-3.5 h-3.5 text-muted-foreground" />,
  Resolved: <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />,
};

export default function ReviewQueue() {
  const [selected, setSelected] = useState<ReviewQueueItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return reviewQueueItems
      .filter((item) => statusFilter === "all" || item.status === statusFilter)
      .filter((item) => priorityFilter === "all" || item.priority === priorityFilter)
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [statusFilter, priorityFilter]);

  const openCount = reviewQueueItems.filter((i) => i.status === "Open").length;
  const inProgressCount = reviewQueueItems.filter((i) => i.status === "In Progress").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ClipboardList className="w-6 h-6" />
              Manual Review Queue
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Exceptions and escalations requiring manual review
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="px-2.5 py-1 rounded-md bg-destructive/10 text-destructive font-medium">
              {openCount} Open
            </span>
            <span className="px-2.5 py-1 rounded-md bg-muted text-muted-foreground font-medium">
              {inProgressCount} In Progress
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Queue Table */}
        <div className="bg-card rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dealer</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Lender</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Raised</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id} className="cursor-pointer" onClick={() => setSelected(item)}>
                  <TableCell className="font-medium text-foreground">{item.dealerName}</TableCell>
                  <TableCell>
                    <span className="font-semibold text-foreground">{item.dealerScore}</span>
                    <span className="text-muted-foreground"> / 100</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.lenderName}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{item.reason}</TableCell>
                  <TableCell>
                    <Badge
                      variant={item.priority === "High" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {item.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                      {statusIcon[item.status]}
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{item.raisedDate}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); setSelected(item); }}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No items match the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Exception Detail Modal */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Exception</DialogTitle>
            <DialogDescription>Exception detail for manual review</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              {/* Dealer Summary */}
              <div className="rounded-lg border border-border p-4 space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Dealer Summary</h4>
                <div className="space-y-1 text-sm">
                  <p>Dealer: <span className="font-semibold text-foreground">{selected.dealerName}</span></p>
                  <p>Lender: <span className="font-semibold text-foreground">{selected.lenderName}</span></p>
                  <p>Current Score: <span className="font-semibold text-foreground">{selected.dealerScore} / 100</span></p>
                </div>
              </div>

              {/* Exception Details */}
              <div className="rounded-lg border border-border p-4 space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Exception Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Reason</p>
                    <p className="font-medium text-foreground">{selected.reason}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Priority</p>
                    <Badge variant={selected.priority === "High" ? "destructive" : "secondary"} className="text-xs mt-0.5">
                      {selected.priority}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                      {statusIcon[selected.status]}
                      {selected.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Raised By</p>
                    <p className="font-medium text-foreground">{selected.raisedBy}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Date Raised</p>
                    <p className="font-medium text-foreground">{selected.raisedDate}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="rounded-lg border border-border p-4 space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes</h4>
                <p className="text-sm text-foreground">{selected.notes}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
