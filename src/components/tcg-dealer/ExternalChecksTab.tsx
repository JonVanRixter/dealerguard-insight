import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Building2, ClipboardList, CreditCard, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import externalChecks from "@/data/tcg/externalChecks.json";
import { CompaniesHousePanel } from "@/components/tcg-onboarding/CompaniesHousePanel";
import { FcaRegisterPanel } from "@/components/tcg-onboarding/FcaRegisterPanel";
import { CreditSafePanel } from "@/components/tcg-onboarding/CreditSafePanel";
import { DirectorIdChecksPanel } from "./DirectorIdChecksPanel";

interface Props {
  dealerId: string;
}

type CheckSource = "ch" | "fca" | "cs";

const SOURCE_LABELS: Record<CheckSource, string> = {
  ch: "Companies House",
  fca: "FCA Register",
  cs: "CreditSafe",
};
const SOURCE_ICONS: Record<CheckSource, typeof Building2> = {
  ch: Building2,
  fca: ClipboardList,
  cs: CreditCard,
};

export function ExternalChecksTab({ dealerId }: Props) {
  const { toast } = useToast();
  const { user } = useAuth();
  const currentUser = user?.email?.split("@")[0] || "TCG User";

  const record = externalChecks.find((r: any) => r.dealerId === dealerId);

  const [lastChecked, setLastChecked] = useState<Record<CheckSource, { date: string; by: string }>>({
    ch: { date: record?.companiesHouse?.lastChecked || "", by: record?.companiesHouse?.checkedBy || "" },
    fca: { date: record?.fcaRegister?.lastChecked || "", by: record?.fcaRegister?.checkedBy || "" },
    cs: { date: record?.creditSafe?.lastChecked || "", by: record?.creditSafe?.checkedBy || "" },
  });

  const [rechecking, setRechecking] = useState<CheckSource | null>(null);

  const handleRecheck = useCallback((source: CheckSource) => {
    setRechecking(source);
    setTimeout(() => {
      const now = new Date().toISOString();
      setLastChecked((prev) => ({
        ...prev,
        [source]: { date: now, by: currentUser },
      }));
      setRechecking(null);
      toast({
        title: `✅ ${SOURCE_LABELS[source]} check refreshed.`,
        description: `Audit trail: External check re-run: ${SOURCE_LABELS[source]} — ${currentUser} — ${format(new Date(), "dd MMM yyyy HH:mm")}`,
      });
    }, 1500);
  }, [currentUser, toast]);

  if (!record) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No external check data available for this dealer.
      </div>
    );
  }

  const chData = (record as any).companiesHouse?.simulatedData;
  const fcaData = (record as any).fcaRegister?.simulatedData;
  const csData = (record as any).creditSafe?.simulatedData;

  // Collect all directors from CH for the Director/ID panel
  const directors = chData?.directors || [];
  const sanctions = csData?.directorSanctionsScreening || [];

  return (
    <div className="space-y-6">
      {/* Three check panels */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Companies House */}
        <CheckPanelWrapper
          source="ch"
          lastChecked={lastChecked.ch}
          rechecking={rechecking === "ch"}
          onRecheck={() => handleRecheck("ch")}
        >
          {chData && <CompaniesHousePanel data={chData} onPrefill={() => {}} />}
        </CheckPanelWrapper>

        {/* FCA Register */}
        <CheckPanelWrapper
          source="fca"
          lastChecked={lastChecked.fca}
          rechecking={rechecking === "fca"}
          onRecheck={() => handleRecheck("fca")}
        >
          {fcaData && <FcaRegisterPanel data={fcaData} />}
        </CheckPanelWrapper>

        {/* CreditSafe */}
        <CheckPanelWrapper
          source="cs"
          lastChecked={lastChecked.cs}
          rechecking={rechecking === "cs"}
          onRecheck={() => handleRecheck("cs")}
        >
          {csData && <CreditSafePanel data={csData} />}
        </CheckPanelWrapper>
      </div>

      {/* Director & ID Checks */}
      <DirectorIdChecksPanel directors={directors} sanctions={sanctions} />
    </div>
  );
}

function CheckPanelWrapper({
  source,
  lastChecked,
  rechecking,
  onRecheck,
  children,
}: {
  source: CheckSource;
  lastChecked: { date: string; by: string };
  rechecking: boolean;
  onRecheck: () => void;
  children: React.ReactNode;
}) {
  const Icon = SOURCE_ICONS[source];
  const fmtDate = (d: string) => {
    try {
      return format(new Date(d), "dd MMM yyyy HH:mm");
    } catch {
      return d;
    }
  };

  return (
    <div className="space-y-2">
      {/* Header row above card */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Last checked: {lastChecked.date ? fmtDate(lastChecked.date) : "Never"} · by {lastChecked.by || "—"}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRecheck}
          disabled={rechecking}
          className="gap-1.5 text-xs h-7"
        >
          {rechecking ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          Re-check
        </Button>
      </div>

      {/* Panel with optional blur overlay */}
      <div className="relative">
        {rechecking && (
          <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking {SOURCE_LABELS[source]}...
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
