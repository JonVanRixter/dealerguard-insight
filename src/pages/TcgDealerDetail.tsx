import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { RagBadge } from "@/components/RagBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, MapPin, Phone, Building2, ShieldCheck } from "lucide-react";
import { tcgDealers, type TcgDealer } from "@/data/tcg/dealers";
import { getPolicyRecord } from "@/data/tcg/dealerPolicies";
import { getLenderName } from "@/data/tcg/lenders";
import { PolicyTab } from "@/components/tcg-dealer/PolicyTab";

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <TrendingUp className="w-4 h-4 text-rag-green" />;
  if (trend === "down") return <TrendingDown className="w-4 h-4 text-rag-red" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
}

function daysRemaining(validUntil: string | null) {
  if (!validUntil) return null;
  return Math.ceil((new Date(validUntil).getTime() - Date.now()) / 86400000);
}

function DealerOverview({ dealer }: { dealer: TcgDealer }) {
  const days = daysRemaining(dealer.onboarding.validUntil);

  return (
    <div className="space-y-6">
      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border border-border p-4 space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Company Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Trading Name</span><span className="font-medium text-foreground">{dealer.tradingName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">CH Number</span><span className="font-mono text-foreground">{dealer.companiesHouseNumber}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">FCA Ref</span><span className="font-mono text-foreground">{dealer.fcaRef}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Firm Type</span><span className="text-foreground">{dealer.firmType === "AR" ? "Appointed Representative" : "Directly Authorised"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Insurance</span><span className="text-foreground">{dealer.distributeInsurance ? "Yes" : "No"}</span></div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4 space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contact</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-foreground"><MapPin className="w-3.5 h-3.5 text-muted-foreground" />{dealer.address}, {dealer.postcode}</div>
            <div className="flex items-center gap-2 text-foreground"><Phone className="w-3.5 h-3.5 text-muted-foreground" />{dealer.phone}</div>
            <div className="flex items-center gap-2 text-foreground"><Building2 className="w-3.5 h-3.5 text-muted-foreground" />{dealer.region}</div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4 space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Onboarding Status</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge className="bg-[hsl(var(--rag-green-bg))] text-[hsl(var(--rag-green-text))]">{dealer.onboarding.status}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">App Ref</span><span className="font-mono text-foreground">{dealer.onboarding.applicationRef}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Valid Until</span><span className="text-foreground">{dealer.onboarding.validUntil || "—"}</span></div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Days Remaining</span>
              {days !== null && (
                days <= 0
                  ? <Badge className="bg-[hsl(var(--rag-red-bg))] text-[hsl(var(--rag-red-text))]">EXPIRED</Badge>
                  : days <= 30
                    ? <Badge className="bg-[hsl(var(--rag-amber-bg))] text-[hsl(var(--rag-amber-text))]">{days}d</Badge>
                    : <Badge className="bg-[hsl(var(--rag-green-bg))] text-[hsl(var(--rag-green-text))]">{days}d</Badge>
              )}
            </div>
            <div className="flex justify-between"><span className="text-muted-foreground">Approved By</span><span className="text-foreground">{dealer.onboarding.approvedBy || "—"}</span></div>
          </div>
        </div>
      </div>

      {/* Lenders using */}
      <div className="bg-card rounded-lg border border-border p-4">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Lenders Using This Dealer</h4>
        <div className="flex flex-wrap gap-2">
          {dealer.onboarding.lendersUsing.map((lid) => (
            <Badge key={lid} variant="secondary">{getLenderName(lid)}</Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TcgDealerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const dealer = useMemo(() => tcgDealers.find((d) => d.id === id), [id]);
  const policyRecord = useMemo(() => (id ? getPolicyRecord(id) : undefined), [id]);

  if (!dealer) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <h2 className="text-lg font-semibold text-foreground">Dealer not found</h2>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/pre-onboarding")}>
            Back to Onboarding Hub
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back nav */}
        <button
          onClick={() => navigate("/pre-onboarding")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Onboarding Hub
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-foreground">{dealer.name}</h2>
              <RagBadge status={dealer.rag} />
              <TrendIcon trend={dealer.trend} />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
              <span>Score: <span className="font-semibold text-foreground">{dealer.score}%</span></span>
              <span>Last Audit: <span className="font-medium text-foreground">{dealer.lastAudit}</span></span>
              {dealer.alertCount > 0 && (
                <Badge variant="destructive" className="text-xs">{dealer.alertCount} alerts</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="policies" className="gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Policies
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DealerOverview dealer={dealer} />
          </TabsContent>

          <TabsContent value="policies">
            {policyRecord ? (
              <PolicyTab policyRecord={policyRecord} />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No policy records found for this dealer.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
