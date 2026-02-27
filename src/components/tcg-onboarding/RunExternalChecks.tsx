import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { CompaniesHousePanel } from "./CompaniesHousePanel";
import { FcaRegisterPanel } from "./FcaRegisterPanel";
import { CreditSafePanel } from "./CreditSafePanel";
import externalChecksData from "@/data/tcg/externalChecks.json";
import type { TcgOnboardingApp, PreScreenResult } from "@/hooks/useTcgOnboarding";

type CheckStep = "idle" | "ch" | "fca" | "cs" | "done";

interface Props {
  companiesHouseNumber: string;
  app: TcgOnboardingApp;
  onUpdate: (partial: Partial<TcgOnboardingApp>) => void;
}

function findCheckData(chNumber: string) {
  // Match by company number in the simulated data
  return (externalChecksData as any[]).find(
    (d) => d.companiesHouse?.simulatedData?.companyNumber === chNumber
  );
}

function mapResult(result: string): PreScreenResult {
  if (result === "Pass") return "pass";
  if (result === "Fail") return "fail";
  return "refer";
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

    // Step 1: Companies House
    setStep("ch");
    await new Promise((r) => setTimeout(r, 800));
    setChDone(true);

    // Step 2: FCA
    setStep("fca");
    await new Promise((r) => setTimeout(r, 1200));
    setFcaDone(true);

    // Step 3: CreditSafe
    setStep("cs");
    await new Promise((r) => setTimeout(r, 1500));
    setCsDone(true);

    setStep("done");

    // Auto-populate pre-screen checks
    const ch = data.companiesHouse.simulatedData;
    const fca = data.fcaRegister.simulatedData;
    const cs = data.creditSafe.simulatedData;

    // Derive AML result from sanctions screening
    const allSanctionsClear = cs.directorSanctionsScreening.every(
      (d: any) => d.sanctionsResult === "Clear" && d.pepResult === "No PEP" && (d.adverseMediaResult === "None found" || d.adverseMediaResult === "None")
    );

    const updatedChecks = app.preScreenChecks.map((check) => {
      switch (check.id) {
        case "ch":
          return { ...check, result: mapResult(ch.overallResult), notes: check.notes || "Auto-filled from simulated check" };
        case "fca":
          return { ...check, result: mapResult(fca.overallResult), notes: check.notes || "Auto-filled from simulated check" };
        case "fin":
          return { ...check, result: mapResult(cs.overallResult), notes: check.notes || "Auto-filled from simulated check" };
        case "aml":
          return { ...check, result: (allSanctionsClear ? "pass" : "refer") as PreScreenResult, notes: check.notes || "Auto-filled from simulated check" };
        default:
          return check;
      }
    });

    onUpdate({ preScreenChecks: updatedChecks });
  }, [companiesHouseNumber, app.preScreenChecks, onUpdate]);

  const handlePrefill = useCallback(() => {
    if (!checkData) return;
    const ch = checkData.companiesHouse.simulatedData;
    const addressParts = ch.registeredAddress.split(",").map((s: string) => s.trim());

    onUpdate({
      companyName: ch.companyName,
      addressStreet: addressParts[0] || "",
      addressTown: addressParts[1] || "",
      addressPostcode: addressParts[addressParts.length - 1] || "",
    });

    toast({ title: "Form pre-filled", description: "Company details populated from Companies House data." });
  }, [checkData, onUpdate]);

  const handleAddToReviewQueue = useCallback(() => {
    toast({ title: "Added to Manual Review Queue", description: `${checkData?.dealerName || "Dealer"} has been added with flag details.` });
  }, [checkData]);

  const stepLabel = (label: string, running: boolean, done: boolean) => (
    <div className="flex items-center gap-2 text-sm h-7">
      {done ? (
        <CheckCircle2 className="w-4 h-4 text-outcome-pass-text" />
      ) : running ? (
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
      ) : (
        <span className="w-4 h-4" />
      )}
      <span className={done ? "text-outcome-pass-text" : running ? "text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
      {done && <span className="text-xs text-outcome-pass-text">✅ Complete</span>}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          onClick={runChecks}
          disabled={!canRun || (step !== "idle" && step !== "done")}
          variant="outline"
          className="gap-2"
        >
          <Search className="w-4 h-4" />
          🔍 Run External Checks (Simulated)
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
          <CompaniesHousePanel
            data={checkData.companiesHouse.simulatedData}
            onPrefill={handlePrefill}
          />
          <FcaRegisterPanel data={checkData.fcaRegister.simulatedData} />
          <CreditSafePanel
            data={checkData.creditSafe.simulatedData}
            onAddToReviewQueue={
              checkData.creditSafe.simulatedData.flags.length > 0 ||
              checkData.fcaRegister.simulatedData.flags.length > 0
                ? handleAddToReviewQueue
                : undefined
            }
          />

          {/* Auto-fill label for pre-screen checks */}
          <div className="bg-muted/30 border rounded-lg p-3 text-xs text-muted-foreground">
            ℹ️ Pre-screen checks have been auto-populated from simulated data. Review and confirm each result below.
            The "Website & Initial Trading Check" remains manual.
          </div>
        </div>
      )}
    </div>
  );
}
