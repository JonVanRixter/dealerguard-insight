import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Users, Phone, ShieldCheck, Building2, Car, PoundSterling,
  CheckCircle2, AlertTriangle, XCircle, ArrowRight, Search,
  ClipboardList, FileSearch, Landmark,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  1.1  Dealer Segmentation                                          */
/* ------------------------------------------------------------------ */
function DealerSegmentation() {
  const [seg, setSeg] = useState({
    franchise: "",
    size: "",
    stockType: [] as string[],
    existingFinance: "",
  });

  const toggleStock = (val: string) =>
    setSeg((s) => ({
      ...s,
      stockType: s.stockType.includes(val)
        ? s.stockType.filter((v) => v !== val)
        : [...s.stockType, val],
    }));

  const filled = [seg.franchise, seg.size, seg.stockType.length > 0, seg.existingFinance].filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">1.1 &nbsp;Dealer Segmentation</CardTitle>
        </div>
        <CardDescription>Classify potential dealers to determine the right onboarding path.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Progress value={(filled / 4) * 100} className="h-2" />

        {/* Franchise status */}
        <div className="space-y-2">
          <Label>Franchise Status</Label>
          <Select value={seg.franchise} onValueChange={(v) => setSeg({ ...seg, franchise: v })}>
            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="franchised">Franchised</SelectItem>
              <SelectItem value="independent">Independent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Size */}
        <div className="space-y-2">
          <Label>Size (units sold annually)</Label>
          <Select value={seg.size} onValueChange={(v) => setSeg({ ...seg, size: v })}>
            <SelectTrigger><SelectValue placeholder="Select size band" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small (&lt; 250 units)</SelectItem>
              <SelectItem value="medium">Medium (250 – 1 000 units)</SelectItem>
              <SelectItem value="large">Large (1 000 – 5 000 units)</SelectItem>
              <SelectItem value="enterprise">Enterprise (5 000+ units)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stock type */}
        <div className="space-y-2">
          <Label>Stock Type</Label>
          <div className="flex flex-wrap gap-3">
            {["New", "Used", "Prestige", "Commercial"].map((t) => (
              <label key={t} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={seg.stockType.includes(t)}
                  onCheckedChange={() => toggleStock(t)}
                />
                {t}
              </label>
            ))}
          </div>
        </div>

        {/* Existing finance */}
        <div className="space-y-2">
          <Label>Existing Finance Relationships</Label>
          <Select value={seg.existingFinance} onValueChange={(v) => setSeg({ ...seg, existingFinance: v })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="single">Single lender</SelectItem>
              <SelectItem value="multi">Multiple lenders</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filled === 4 && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Segmentation Complete</p>
              <p className="text-muted-foreground mt-1">
                {seg.franchise === "franchised" ? "Franchised" : "Independent"} dealer,{" "}
                {seg.size} volume, stocking {seg.stockType.join(", ").toLowerCase()},{" "}
                {seg.existingFinance === "none" ? "no existing finance" : seg.existingFinance + " lender(s)"}.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  1.2  Initial Qualification Call                                    */
/* ------------------------------------------------------------------ */
function QualificationCall() {
  const objectives = [
    { label: "Understand dealer profile & stocking needs", icon: Building2 },
    { label: "Confirm minimum criteria met", icon: CheckCircle2 },
    { label: "Explain product suite (stocking loans, working capital, consumer finance)", icon: PoundSterling },
    { label: "Gather early risk indicators (past failures, CCJs, trading history)", icon: AlertTriangle },
  ];

  const [checks, setChecks] = useState<boolean[]>(new Array(objectives.length).fill(false));
  const [notes, setNotes] = useState("");

  const toggle = (i: number) => setChecks((c) => c.map((v, j) => (j === i ? !v : v)));
  const done = checks.filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">1.2 &nbsp;Initial Qualification Call</CardTitle>
        </div>
        <CardDescription>Structured call checklist to qualify a potential dealer.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Progress value={(done / objectives.length) * 100} className="h-2" />

        <div className="space-y-3">
          {objectives.map((obj, i) => (
            <label
              key={i}
              className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                checks[i] ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/20"
              }`}
            >
              <Checkbox checked={checks[i]} onCheckedChange={() => toggle(i)} className="mt-0.5" />
              <div className="flex items-center gap-2 text-sm">
                <obj.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>{obj.label}</span>
              </div>
            </label>
          ))}
        </div>

        <div className="space-y-2">
          <Label>Call Notes</Label>
          <Textarea
            placeholder="Record key findings, concerns, and next steps…"
            className="min-h-[100px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {done === objectives.length && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm font-medium">All qualification objectives covered — ready for pre-screening.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  1.3  Pre‑Screening Checks                                         */
/* ------------------------------------------------------------------ */
type CheckStatus = "pending" | "pass" | "fail" | "running";

function PreScreeningChecks() {
  const navigate = useNavigate();
  const [companyNumber, setCompanyNumber] = useState("");
  const [statuses, setStatuses] = useState<Record<string, CheckStatus>>({
    companiesHouse: "pending",
    openBanking: "pending",
    aml: "pending",
  });

  const runCheck = (key: string) => {
    setStatuses((s) => ({ ...s, [key]: "running" }));
    // Simulate check
    setTimeout(() => {
      setStatuses((s) => ({ ...s, [key]: Math.random() > 0.15 ? "pass" : "fail" }));
    }, 1500 + Math.random() * 1000);
  };

  const runAll = () => {
    Object.keys(statuses).forEach((k, i) =>
      setTimeout(() => runCheck(k), i * 600)
    );
  };

  const statusBadge = (s: CheckStatus) => {
    switch (s) {
      case "pass":
        return <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400"><CheckCircle2 className="w-3 h-3 mr-1" />Pass</Badge>;
      case "fail":
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Fail</Badge>;
      case "running":
        return <Badge variant="secondary" className="gap-1 animate-pulse">Running…</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const allDone = Object.values(statuses).every((s) => s === "pass" || s === "fail");
  const allPass = Object.values(statuses).every((s) => s === "pass");

  const checks = [
    { key: "companiesHouse", label: "Companies House Quick Lookup", icon: Landmark, description: "Verify incorporation status, directors, and filing history" },
    { key: "openBanking", label: "Open Banking (Directors)", icon: PoundSterling, description: "Income validation & affordability assessment for directors" },
    { key: "aml", label: "Basic AML Flags", icon: ShieldCheck, description: "Anti-money laundering screening and sanctions check" },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">1.3 &nbsp;Pre‑Screening Checks</CardTitle>
        </div>
        <CardDescription>Run automated checks before proceeding to full onboarding.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-3">
          <div className="flex-1 space-y-2">
            <Label>Companies House Number</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. 12345678"
                value={companyNumber}
                onChange={(e) => setCompanyNumber(e.target.value)}
              />
              <Button onClick={runAll} disabled={!companyNumber} className="shrink-0 gap-2">
                <Search className="w-4 h-4" /> Run All Checks
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {checks.map((c) => (
            <div
              key={c.key}
              className="flex items-center justify-between rounded-lg border border-border p-4"
            >
              <div className="flex items-center gap-3">
                <c.icon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{c.label}</p>
                  <p className="text-xs text-muted-foreground">{c.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {statusBadge(statuses[c.key])}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => runCheck(c.key)}
                  disabled={statuses[c.key] === "running" || !companyNumber}
                >
                  Run
                </Button>
              </div>
            </div>
          ))}
        </div>

        {allDone && (
          <div
            className={`rounded-lg border p-4 flex items-start gap-3 ${
              allPass
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-destructive/30 bg-destructive/5"
            }`}
          >
            {allPass ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-emerald-700 dark:text-emerald-400">All checks passed</p>
                  <p className="text-muted-foreground mt-1">This dealer is cleared to proceed to full onboarding.</p>
                  <Button onClick={() => navigate("/onboarding")} className="mt-3 gap-2">
                    <ArrowRight className="w-4 h-4" /> Proceed to Application &amp; Due Diligence
                  </Button>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-destructive">One or more checks failed</p>
                  <p className="text-muted-foreground mt-1">Review failed items before proceeding. Manual override may be required.</p>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function PreOnboarding() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pre‑Onboarding</h1>
          <p className="text-muted-foreground mt-1">Attraction &amp; Qualification — assess new dealer prospects before full onboarding.</p>
        </div>

        <Tabs defaultValue="segmentation" className="space-y-6">
          <TabsList>
            <TabsTrigger value="segmentation" className="gap-2"><Users className="w-4 h-4" />Segmentation</TabsTrigger>
            <TabsTrigger value="qualification" className="gap-2"><ClipboardList className="w-4 h-4" />Qualification Call</TabsTrigger>
            <TabsTrigger value="screening" className="gap-2"><FileSearch className="w-4 h-4" />Pre‑Screening</TabsTrigger>
          </TabsList>

          <TabsContent value="segmentation"><DealerSegmentation /></TabsContent>
          <TabsContent value="qualification"><QualificationCall /></TabsContent>
          <TabsContent value="screening"><PreScreeningChecks /></TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
