import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Users, Building2, AlertTriangle, ChevronRight } from "lucide-react";
import { tcgLenders } from "@/data/tcg/lenders";

const LenderDirectory = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      tcgLenders.filter(
        (l) =>
          l.name.toLowerCase().includes(search.toLowerCase()) ||
          l.tradingName.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const statusVariant = (s: string) => {
    if (s === "Active") return "default";
    if (s === "Pending Activation") return "outline";
    return "secondary";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Lender Directory</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            All registered lenders on the platform. Click a lender to view their profile.
          </p>
        </div>

        {/* KPI summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <Users className="w-4 h-4" /> Total Lenders
            </div>
            <span className="text-3xl font-bold text-foreground">{tcgLenders.length}</span>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <Building2 className="w-4 h-4" /> Active Lenders
            </div>
            <span className="text-3xl font-bold text-foreground">
              {tcgLenders.filter((l) => l.status === "Active").length}
            </span>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <AlertTriangle className="w-4 h-4" /> Total Open Actions
            </div>
            <span className="text-3xl font-bold text-foreground">
              {tcgLenders.reduce((s, l) => s + l.openActions, 0)}
            </span>
          </div>
        </div>

        {/* Search + Table */}
        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search lenders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 bg-background"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lender Name</TableHead>
                  <TableHead>Primary Contact</TableHead>
                  <TableHead className="text-center">Dealers</TableHead>
                  <TableHead className="text-center">Avg Score</TableHead>
                  <TableHead className="text-center">Open Actions</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((lender) => {
                  const lastLogin = lender.lastLogin ? new Date(lender.lastLogin) : null;
                  return (
                    <TableRow
                      key={lender.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/tcg/lenders/${lender.id}`)}
                    >
                      <TableCell>
                        <div>
                          <span className="font-medium text-foreground">{lender.tradingName}</span>
                          <p className="text-xs text-muted-foreground">{lender.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="text-sm text-foreground">{lender.contactName}</span>
                          <p className="text-xs text-muted-foreground">{lender.contactEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-semibold">{lender.dealerCount}</TableCell>
                      <TableCell className="text-center font-semibold">
                        {lender.avgPortfolioScore !== null ? lender.avgPortfolioScore : "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        {lender.openActions > 0 ? (
                          <span className="font-semibold">{lender.openActions}</span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {lastLogin
                          ? `${lastLogin.toLocaleDateString("en-GB")} ${lastLogin.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
                          : "Never"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={statusVariant(lender.status)}>{lender.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No lenders found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LenderDirectory;
