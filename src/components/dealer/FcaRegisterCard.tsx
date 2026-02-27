import { useState, useEffect, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Building2,
  Users,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface FirmData {
  "Organisation Name"?: string;
  "Current Status"?: string;
  "Status Effective Date"?: string;
  "Firm Reference Number"?: string;
  "Companies House Number"?: string;
  "Firm Type"?: string;
  "Address"?: Record<string, string>;
}

interface IndividualData {
  "Name"?: string;
  "IRN"?: string;
  "Status"?: string;
}

interface Props {
  dealerName: string;
  fcaRef?: string;
  onDataLoaded?: (data: {
    firmName: string;
    frn: string;
    status: string;
    statusDate?: string;
    firmType?: string;
    companiesHouseNumber?: string;
    address?: string;
    individuals: { name: string; irn?: string; status?: string }[];
    permissions: string[];
  }) => void;
}

// Generate deterministic mock FCA data based on dealer name
function generateMockFcaData(dealerName: string, fcaRef?: string) {
  const hash = dealerName.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const frn = fcaRef || String(600000 + (hash % 99999));

  const firm: FirmData = {
    "Organisation Name": dealerName,
    "Current Status": "Authorised",
    "Status Effective Date": "2019-03-15",
    "Firm Reference Number": frn,
    "Companies House Number": String(8000000 + (hash % 999999)),
    "Firm Type": "Appointed Representative",
  };

  const firstNames = ["James", "Sarah", "Michael", "Emma", "David", "Claire"];
  const lastNames = ["Thompson", "Walker", "Harrison", "Mitchell", "Cooper", "Bennett"];
  const numIndividuals = 2 + (hash % 3);
  const individuals: IndividualData[] = [];
  for (let i = 0; i < numIndividuals; i++) {
    individuals.push({
      Name: `${firstNames[(hash + i) % firstNames.length]} ${lastNames[(hash + i * 3) % lastNames.length]}`,
      IRN: String(100000 + ((hash * (i + 1)) % 899999)),
      Status: "Approved",
    });
  }

  const permissions = [
    "Agreeing to carry on a regulated activity",
    "Arranging (bringing about) deals in investments",
    "Making arrangements with a view to transactions in investments",
    "Advising on investments (except on Peer to Peer agreements)",
  ];

  return { firm, individuals, permissions };
}

export function FcaRegisterCard({ dealerName, fcaRef, onDataLoaded }: Props) {
  const [showIndividuals, setShowIndividuals] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const notified = useRef(false);
  const { toast } = useToast();
  const [rechecking, setRechecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const handleRecheck = useCallback(() => {
    setRechecking(true);
    setTimeout(() => {
      setRechecking(false);
      setLastChecked(new Date().toISOString());
      toast({
        title: "✅ FCA Register check refreshed",
        description: `Simulated re-check completed — ${format(new Date(), "dd MMM yyyy HH:mm")}`,
      });
    }, 1500);
  }, [toast]);

  const { firm, individuals, permissions } = generateMockFcaData(dealerName, fcaRef);

  useEffect(() => {
    if (!notified.current && onDataLoaded) {
      notified.current = true;
      onDataLoaded({
        firmName: firm["Organisation Name"] || dealerName,
        frn: firm["Firm Reference Number"] || "",
        status: firm["Current Status"] || "Unknown",
        statusDate: firm["Status Effective Date"],
        firmType: firm["Firm Type"],
        companiesHouseNumber: firm["Companies House Number"],
        individuals: individuals.map((ind) => ({
          name: ind["Name"] || "Unknown",
          irn: ind["IRN"],
          status: ind["Status"],
        })),
        permissions,
      });
    }
  }, []);

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return null;
    const lower = status.toLowerCase();
    if (lower.includes("authorised") || lower.includes("registered") || lower.includes("approved")) {
      return (
        <Badge variant="outline" className="gap-1 text-outcome-pass border-outcome-pass/30">
          <CheckCircle2 className="w-3 h-3" />
          {status}
        </Badge>
      );
    }
    if (lower.includes("no longer") || lower.includes("cancelled") || lower.includes("revoked")) {
      return (
        <Badge variant="outline" className="gap-1 text-outcome-fail border-outcome-fail/30">
          <XCircle className="w-3 h-3" />
          {status}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1 text-outcome-pending border-outcome-pending/30">
        <AlertTriangle className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">FCA Register Check</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Financial Services Register lookup
            </p>
          </div>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 text-muted-foreground">SIMULATED DATA</Badge>
          {lastChecked && (
            <span className="text-[10px] text-muted-foreground ml-1">
              Last checked: {format(new Date(lastChecked), "dd MMM yyyy HH:mm")}
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={handleRecheck} disabled={rechecking} className="gap-1.5 text-xs h-7">
          {rechecking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Re-check
        </Button>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Firm header */}
        <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                {firm["Organisation Name"]}
              </h4>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                <span>FRN: <span className="font-medium text-foreground">{firm["Firm Reference Number"]}</span></span>
                <span>CH: <span className="font-medium text-foreground">{firm["Companies House Number"]}</span></span>
                <span>Type: <span className="font-medium text-foreground">{firm["Firm Type"]}</span></span>
              </div>
            </div>
            <div className="shrink-0">
              {getStatusBadge(firm["Current Status"])}
            </div>
          </div>

          {firm["Status Effective Date"] && (
            <p className="text-xs text-muted-foreground">
              Status effective: {firm["Status Effective Date"]}
            </p>
          )}

          <a
            href={`https://register.fca.org.uk/s/firm?id=${firm["Firm Reference Number"]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            View on FCA Register <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Individuals */}
        <Collapsible open={showIndividuals} onOpenChange={setShowIndividuals}>
          <CollapsibleTrigger asChild>
            <button className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Users className="w-4 h-4 text-primary" />
                Approved Individuals ({individuals.length})
              </div>
              {showIndividuals ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
              {individuals.map((ind, i) => (
                <div key={i} className="px-4 py-2.5 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-foreground">{ind["Name"]}</p>
                    <p className="text-xs text-muted-foreground">IRN: {ind["IRN"]}</p>
                  </div>
                  {getStatusBadge(ind["Status"])}
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Permissions */}
        <Collapsible open={showPermissions} onOpenChange={setShowPermissions}>
          <CollapsibleTrigger asChild>
            <button className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Permissions ({permissions.length})
              </div>
              {showPermissions ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border border-border">
              {permissions.map((p, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {p}
                </Badge>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
