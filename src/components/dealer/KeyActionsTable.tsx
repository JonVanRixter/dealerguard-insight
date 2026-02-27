import { KeyAction } from "@/data/auditFramework";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface KeyActionsTableProps {
  actions: KeyAction[];
}

const priorityColors = {
  High: "bg-outcome-fail/10 text-outcome-fail border-outcome-fail/20",
  Medium: "bg-outcome-pending/10 text-outcome-pending border-outcome-pending/20",
  Low: "bg-muted text-muted-foreground border-border",
};

const statusColors: Record<string, string> = {
  Pending: "bg-outcome-fail/10 text-outcome-fail",
  "In Progress": "bg-outcome-pending/10 text-outcome-pending",
  Planned: "bg-muted text-muted-foreground",
  Complete: "bg-outcome-pass/10 text-outcome-pass",
  BAU: "bg-primary/10 text-primary",
  Optional: "bg-muted text-muted-foreground/70",
};

export function KeyActionsTable({ actions }: KeyActionsTableProps) {
  if (actions.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">No remediation actions required.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Key Actions</h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Section</TableHead>
              <TableHead className="min-w-[200px]">Action</TableHead>
              <TableHead className="text-center">Priority</TableHead>
              <TableHead className="hidden md:table-cell">Owner</TableHead>
              <TableHead className="hidden lg:table-cell">Due Date</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actions.map((action) => (
              <TableRow key={action.id}>
                <TableCell>
                  <Badge variant="outline" className="text-xs font-normal">
                    {action.section}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-sm">{action.action}</TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={`text-xs ${priorityColors[action.priority]}`}
                  >
                    {action.priority}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  {action.owner}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  {action.dueDate}
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={`text-xs ${statusColors[action.status]}`}>
                    {action.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
