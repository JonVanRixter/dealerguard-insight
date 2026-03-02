import { useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { tcgLenders } from "@/data/tcg/lenders";
import { tcgDealers } from "@/data/tcg/dealers";
import {
  ArrowLeft,
  Building2,
  Users,
  Activity,
  AlertTriangle,
  Clock,
  Mail,
  Phone,
  MapPin,
  FileText,
  Shield,
  ChevronRight,
  Lock,
} from "lucide-react";

const LenderProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lender = tcgLenders.find((l) => l.id === id);

  const lenderDealers = useMemo(
    () => (lender ? tcgDealers.filter((d) => d.onboarding.lendersUsing.includes(lender.id)) : []),
    [lender]
  );

  if (!lender) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">Lender not found</p>
          <button onClick={() => navigate("/tcg/lenders")} className="text-primary underline mt-2 text-sm">
            Back to Lender Directory
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const statusVariant = (s: string) => {
    if (s === "Active") return "default" as const;
    if (s === "Pending Activation") return "outline" as const;
    return "secondary" as const;
  };

  const contractDate = new Date(lender.contractStart);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back link + header */}
        <div>
          <button
            onClick={() => navigate("/tcg/lenders")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Lender Directory
          </button>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">{lender.tradingName}</h2>
              <p className="text-sm text-muted-foreground">{lender.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant(lender.status)}>{lender.status}</Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
                <Lock className="w-3 h-3" /> Read-only view
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
              <Building2 className="w-3.5 h-3.5" /> Dealers
            </div>
            <span className="text-2xl font-bold text-foreground">{lender.dealerCount}</span>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
              <Activity className="w-3.5 h-3.5" /> Avg Score
            </div>
            <span className="text-2xl font-bold text-foreground">
              {lender.avgPortfolioScore !== null ? lender.avgPortfolioScore : "—"}
            </span>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
              <AlertTriangle className="w-3.5 h-3.5" /> Pending Alerts
            </div>
            <span className="text-2xl font-bold text-foreground">{lender.pendingAlerts}</span>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
              <FileText className="w-3.5 h-3.5" /> Open Actions
            </div>
            <span className="text-2xl font-bold text-foreground">{lender.openActions}</span>
          </div>
        </div>

        {/* Two-column: Company Info + Score Range */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Information */}
          <div className="bg-card rounded-xl border border-border">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Company Information</h3>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs">Primary Contact</p>
                  <p className="text-foreground">{lender.contactName}</p>
                  <p className="text-muted-foreground">{lender.contactEmail}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs">Phone</p>
                  <p className="text-foreground">{lender.contactPhone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs">Billing Address</p>
                  <p className="text-foreground">{lender.billingAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs">FCA Firm Ref / Companies House</p>
                  <p className="text-foreground font-mono text-xs">
                    {lender.fcaFirmRef} / {lender.companiesHouseNo}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs">Contract Start</p>
                  <p className="text-foreground">{contractDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Score Range + Last Login */}
          <div className="space-y-6">
            {lender.scoreRange && (
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">Portfolio Score Range</h3>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Min</p>
                    <span className="text-2xl font-bold text-foreground">{lender.scoreRange.min}</span>
                  </div>
                  <div className="flex-1 h-2 bg-muted rounded-full relative">
                    <div
                      className="absolute h-full bg-primary/30 rounded-full"
                      style={{
                        left: `${lender.scoreRange.min}%`,
                        right: `${100 - lender.scoreRange.max}%`,
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Max</p>
                    <span className="text-2xl font-bold text-foreground">{lender.scoreRange.max}</span>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Last Login</h3>
              {lender.lastLogin ? (
                <div>
                  <p className="text-foreground font-medium">{lender.lastLoginUser}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(lender.lastLogin).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}{" "}
                    at {new Date(lender.lastLogin).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No logins recorded</p>
              )}
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4" /> Team Members
            </h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" /> Managed by lender
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Role</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Last Login</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lender.teamMembers.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium text-foreground">
                      {m.name}
                      {m.isSuperAdmin && (
                        <Badge variant="outline" className="ml-2 text-[10px]">
                          Super Admin
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{m.email}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{m.role}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={m.status === "Active" ? "default" : "outline"}>{m.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {m.lastLogin
                        ? new Date(m.lastLogin).toLocaleDateString("en-GB")
                        : "Never"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Dealer Portfolio */}
        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Dealer Portfolio
            </h3>
          </div>
          {lenderDealers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dealer Name</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-center">Firm Type</TableHead>
                    <TableHead>Onboarding Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lenderDealers.map((d) => (
                    <TableRow
                      key={d.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/tcg/dealers/${d.id}`)}
                    >
                      <TableCell className="font-medium text-foreground">{d.name}</TableCell>
                      <TableCell className="text-muted-foreground">{d.region}</TableCell>
                      <TableCell className="text-center font-semibold">{d.score}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{d.firmType}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={d.onboarding.status === "Approved" ? "default" : "secondary"}>
                          {d.onboarding.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="px-5 py-8 text-center text-muted-foreground text-sm">
              No dealers onboarded yet.
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
          </div>
          <div className="divide-y divide-border">
            {lender.recentActivity.map((a, i) => {
              const d = new Date(a.date);
              return (
                <div key={i} className="px-5 py-3.5 flex gap-3">
                  <div className="mt-0.5">
                    <span className="block w-2 h-2 rounded-full bg-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-foreground leading-snug">{a.action}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {a.user} · {d.toLocaleDateString("en-GB")} {d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LenderProfile;
