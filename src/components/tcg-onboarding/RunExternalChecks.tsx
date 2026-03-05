import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { CompaniesHousePanel } from "./CompaniesHousePanel";
import { FcaRegisterPanel } from "./FcaRegisterPanel";
import { CreditSafePanel } from "./CreditSafePanel";
import externalChecksData from "@/data/tcg/externalChecks.json";
import type { OnboardingApplication } from "@/hooks/useTcgOnboarding";

type CheckStep = "idle" | "ch" | "fca" | "cs" | "done";

interface Props {
  companiesHouseNumber: string;
  app: OnboardingApplication;
  onUpdate: (partial: Partial<OnboardingApplication>) => void;
}

function findCheckData(chNumber: string) {
  return (externalChecksData as any[]).find(
    (d) => d.companiesHouse?.simulatedData?.companyNumber === chNumber
  );
}

export function RunExternalChecks({ companiesHouseNumber, app, onUpdate }: Props) {
  const [step, setStep] = useState<CheckStep>("idle");
  const [chDone, setChDone] = useState(false);
  const [fcaDone, setFcaDone] = useState(false);
  const [csDone, setCsDone] = useState(false);
  const [checkData, setCheckData] = useState<any>(null);

  const canRun = companiesHouseNumber.length >= 4;

  const runChecks = useCallback(async () => {
    const data = findCheckData(companiesHouseNumber);
    if (!data) {
      toast({ title: "No simulated data found", description: `No match for CH number ${companiesHouseNumber}`, variant: "destructive" });
      return;
    }
    setCheckData(data);

    setStep("ch");
    await new Promise((r) => setTimeout(r, 800));
    setChDone(true);

    setStep("fca");
    await new Promise((r) => setTimeout(r, 1200));
    setFcaDone(true);

    setStep("cs");
    await new Promise((r) => setTimeout(r, 1500));
    setCsDone(true);

    setStep("done");

    // Auto-populate pre-screen checks with findings
    const ch = data.companiesHouse.simulatedData;
    const fca = data.fcaRegister.simulatedData;
    const cs = data.creditSafe.simulatedData;
    const now = new Date().toISOString();

    const updatedChecks = { ...app.preScreenChecks };
    
    if (updatedChecks.legalEntityStatus) {
      updatedChecks.legalEntityStatus = {
        ...updatedChecks.legalEntityStatus,
        answered: true,
        finding: `Company ${ch.companyStatus}. Incorporated ${ch.incorporationDate}. ${ch.directors?.length || 0} directors on record.`,
        answeredBy: "System (API)",
        answeredAt: now,
      };
    }
    if (updatedChecks.fcaAuthorisation) {
      updatedChecks.fcaAuthorisation = {
        ...updatedChecks.fcaAuthorisation,
        answered: true,
        finding: `FCA status: ${fca.overallResult}. ${fca.permissions?.join(", ") || "Permissions checked."}`,
        answeredBy: "System (API)",
        answeredAt: now,
      };
    }
    if (updatedChecks.creditAndFinancialStanding) {
      updatedChecks.creditAndFinancialStanding = {
        ...updatedChecks.creditAndFinancialStanding,
        answered: true,
        finding: `CreditSafe score: ${cs.creditScore || "N/A"}. ${cs.ccjCount || 0} CCJs. Overall: ${cs.overallResult}.`,
        answeredBy: "System (API)",
        answeredAt: now,
      };
    }

    onUpdate({ preScreenChecks: updatedChecks });
  }, [companiesHouseNumber, app.preScreenChecks, onUpdate]);

  const handlePrefill = useCallback(() => {
    if (!checkData) return;
    const ch = checkData.companiesHouse.simulatedData;
    const addressParts = ch.registeredAddress.split(",").map((s: string) => s.trim());

    onUpdate({
      dealerName: ch.companyName,
      registeredAddress: {
        street: addressParts[0] || "",
        town: addressParts[1] || "",
        county: "",
        postcode: addressParts[addressParts.length - 1] || "",
      },
    });

    toast({ title: "Form pre-filled", description: "Company details populated from Companies House data." });
  }, [checkData, onUpdate]);

  const handleAddToReviewQueue = useCallback(() => {
    toast({ title: "Added to Manual Review Queue", description: `${checkData?.dealerName || "Dealer"} has been added with flag details.` });
  }, [checkData]);

  const stepLabel = (label: string, running: boolean, done: boolean) => (
    <div className="flex items-center gap-2 text-sm h-7">
      {done ? <CheckCircle2 className="w-4 h-4 text-outcome-pass-text" /> : running ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <span className="w-4 h-4" />}
      <span className={done ? "text-outcome-pass-text" : running ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button onClick={runChecks} disabled={!canRun || (step !== "idle" && step !== "done")} variant="outline" className="gap-2">
          <Search className="w-4 h-4" /> 🔍 Run External Checks (Simulated)
        </Button>
        {!canRun && <span className="text-xs text-muted-foreground">Enter a CH number above to activate</span>}
      </div>

      {step !== "idle" && (
        <div className="bg-muted/40 rounded-lg p-4 space-y-1 border">
          {stepLabel("Checking Companies House...", step === "ch", chDone)}
          {stepLabel("Checking FCA Register...", step === "fca" || (step !== "ch" && fcaDone), fcaDone)}
          {stepLabel("Checking CreditSafe...", step === "cs" || (step !== "ch" && step !== "fca" && csDone), csDone)}
        </div>
      )}

      {step === "done" && checkData && (
        <div className="space-y-4">
          <CompaniesHousePanel data={checkData.companiesHouse.simulatedData} onPrefill={handlePrefill} />
          <FcaRegisterPanel data={checkData.fcaRegister.simulatedData} />
          <CreditSafePanel
            data={checkData.creditSafe.simulatedData}
            onAddToReviewQueue={
              checkData.creditSafe.simulatedData.flags.length > 0 || checkData.fcaRegister.simulatedData.flags.length > 0
                ? handleAddToReviewQueue : undefined
            }
          />
        </div>
      )}
    </div>
  );
}
