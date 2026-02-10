import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Search,
  Loader2,
  Building2,
  Users,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";

interface FirmData {
  "Organisation Name"?: string;
  "Current Status"?: string;
  "Status Effective Date"?: string;
  "Firm Reference Number"?: string;
  "Companies House Number"?: string;
  "Firm Type"?: string;
  "Address"?: Record<string, string>;
  [key: string]: unknown;
}

interface IndividualData {
  "Name"?: string;
  "IRN"?: string;
  "Status"?: string;
  "Effective Date"?: string;
  [key: string]: unknown;
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
    individuals: { name: string; irn?: string; status?: string }[];
    permissions: string[];
  }) => void;
}

export function FcaRegisterCard({ dealerName, fcaRef, onDataLoaded }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [firmData, setFirmData] = useState<FirmData | null>(null);
  const [individuals, setIndividuals] = useState<IndividualData[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(fcaRef || "");
  const [searched, setSearched] = useState(false);
  const [showIndividuals, setShowIndividuals] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoSearched = useRef(false);

  // Auto-search on mount if fcaRef is provided
  useEffect(() => {
    if (fcaRef && !autoSearched.current) {
      autoSearched.current = true;
      lookupFirm(fcaRef);
    }
  }, [fcaRef]);

  const lookupFirm = async (frn: string) => {
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      // Fetch firm details
      const { data: firmResult, error: firmError } = await supabase.functions.invoke(
        "fca-register",
        {
          body: { action: "firm", frn },
        }
      );

      if (firmError) throw new Error(firmError.message);
      if (firmResult?.error) throw new Error(firmResult.error);

      const firm = firmResult?.Data?.[0] || firmResult;
      setFirmData(firm);

      // Fetch individuals in parallel
      const { data: indResult } = await supabase.functions.invoke("fca-register", {
        body: { action: "firm-individuals", frn },
      });
      if (indResult?.Data) {
        setIndividuals(indResult.Data);
      }

      // Fetch permissions
      const { data: permResult } = await supabase.functions.invoke("fca-register", {
        body: { action: "firm-permissions", frn },
      });
      if (permResult?.Data) {
        setPermissions(
          permResult.Data.map(
            (p: Record<string, string>) =>
              p["Permission"] || p["Regulated Activity"] || JSON.stringify(p)
          )
        );
      }

      // Notify parent with loaded data for PDF export
      const loadedIndividuals = indResult?.Data || [];
      const loadedPermissions = permResult?.Data?.map(
        (p: Record<string, string>) =>
          p["Permission"] || p["Regulated Activity"] || JSON.stringify(p)
      ) || [];
      
      onDataLoaded?.({
        firmName: firm["Organisation Name"] || "Unknown",
        frn: firm["Firm Reference Number"] || frn,
        status: firm["Current Status"] || "Unknown",
        statusDate: firm["Status Effective Date"],
        firmType: firm["Firm Type"],
        companiesHouseNumber: firm["Companies House Number"],
        individuals: loadedIndividuals.map((ind: IndividualData) => ({
          name: ind["Name"] || "Unknown",
          irn: ind["IRN"],
          status: ind["Status"],
        })),
        permissions: loadedPermissions,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Lookup failed";
      setError(msg);
      toast({
        title: "FCA Lookup Failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) return;

    // If it looks like an FRN (all digits), do a direct lookup
    if (/^\d+$/.test(query)) {
      return lookupFirm(query);
    }

    // Otherwise search by name
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const { data, error: searchError } = await supabase.functions.invoke("fca-register", {
        body: { action: "search", query, type: "firm" },
      });

      if (searchError) throw new Error(searchError.message);
      if (data?.error) throw new Error(data.error);

      const results = data?.Data || [];
      if (results.length === 0) {
        setError("No firms found matching your search.");
        setFirmData(null);
        setLoading(false);
        return;
      }

      // Take first result and look up details
      const frn = results[0]["FRN"] || results[0]["Firm Reference Number"];
      if (frn) {
        await lookupFirm(frn);
      } else {
        setFirmData(results[0]);
        setLoading(false);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Search failed";
      setError(msg);
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return null;
    const lower = status.toLowerCase();
    if (lower.includes("authorised") || lower.includes("registered")) {
      return (
        <Badge variant="outline" className="gap-1 text-rag-green border-rag-green/30">
          <CheckCircle2 className="w-3 h-3" />
          {status}
        </Badge>
      );
    }
    if (lower.includes("no longer") || lower.includes("cancelled") || lower.includes("revoked")) {
      return (
        <Badge variant="outline" className="gap-1 text-rag-red border-rag-red/30">
          <XCircle className="w-3 h-3" />
          {status}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1 text-rag-amber border-rag-amber/30">
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
          <div>
            <h3 className="text-sm font-semibold text-foreground">FCA Register Check</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Search the Financial Services Register by name or FRN
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Search */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter firm name or FRN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="bg-background"
          />
          <Button onClick={handleSearch} disabled={loading || !searchQuery.trim()} className="gap-1.5 shrink-0">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </Button>
        </div>

        {/* Error state */}
        {error && searched && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rag-red-bg border border-rag-red/20">
            <AlertTriangle className="w-4 h-4 text-rag-red shrink-0" />
            <p className="text-sm text-rag-red-text">{error}</p>
          </div>
        )}

        {/* Firm details */}
        {firmData && (
          <div className="space-y-4">
            {/* Firm header */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {firmData["Organisation Name"] || "Unknown Firm"}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                    {firmData["Firm Reference Number"] && (
                      <span>FRN: <span className="font-medium text-foreground">{firmData["Firm Reference Number"]}</span></span>
                    )}
                    {firmData["Companies House Number"] && (
                      <span>CH: <span className="font-medium text-foreground">{firmData["Companies House Number"]}</span></span>
                    )}
                    {firmData["Firm Type"] && (
                      <span>Type: <span className="font-medium text-foreground">{firmData["Firm Type"]}</span></span>
                    )}
                  </div>
                </div>
                <div className="shrink-0">
                  {getStatusBadge(firmData["Current Status"] as string)}
                </div>
              </div>

              {firmData["Status Effective Date"] && (
                <p className="text-xs text-muted-foreground">
                  Status effective: {firmData["Status Effective Date"]}
                </p>
              )}

              {firmData["Firm Reference Number"] && (
                <a
                  href={`https://register.fca.org.uk/s/firm?id=${firmData["Firm Reference Number"]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  View on FCA Register <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Individuals */}
            {individuals.length > 0 && (
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
                    {individuals.slice(0, 20).map((ind, i) => (
                      <div key={i} className="px-4 py-2.5 flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium text-foreground">{ind["Name"] || "Unknown"}</p>
                          {ind["IRN"] && (
                            <p className="text-xs text-muted-foreground">IRN: {ind["IRN"]}</p>
                          )}
                        </div>
                        {ind["Status"] && getStatusBadge(ind["Status"])}
                      </div>
                    ))}
                    {individuals.length > 20 && (
                      <div className="px-4 py-2 text-xs text-muted-foreground text-center">
                        + {individuals.length - 20} more individuals
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Permissions */}
            {permissions.length > 0 && (
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
            )}
          </div>
        )}

        {/* Empty state */}
        {!searched && !firmData && (
          <div className="text-center py-4">
            <Building2 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Search the FCA Financial Services Register to check firm authorisation status, approved individuals, and permissions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
