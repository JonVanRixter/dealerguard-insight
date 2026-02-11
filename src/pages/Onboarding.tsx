import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { OnboardingDocUpload } from "@/components/onboarding/OnboardingDocUpload";
import { CreditSafeSearch } from "@/components/onboarding/CreditSafeSearch";
import { useOnboardingPersistence } from "@/hooks/useOnboardingPersistence";
import { useToast } from "@/hooks/use-toast";
import {
  Building2, PoundSterling, Users, FileText,
  CheckCircle2, FileUp, ArrowLeft, ArrowRight, Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Shared checklist item                                              */
/* ------------------------------------------------------------------ */
interface CheckItem {
  label: string;
  description?: string;
  docCategory?: string;
}

function ChecklistSection({
  title,
  sectionKey,
  description,
  icon: Icon,
  items,
  dealerName,
  savedChecks,
  onChecksChange,
}: {
  title: string;
  sectionKey: string;
  description: string;
  icon: React.ElementType;
  items: CheckItem[];
  dealerName: string;
  savedChecks: boolean[];
  onChecksChange: (checks: boolean[]) => void;
}) {
  const checks = savedChecks.length === items.length ? savedChecks : new Array(items.length).fill(false);
  const toggle = (i: number) => {
    const next = checks.map((v: boolean, j: number) => (j === i ? !v : v));
    onChecksChange(next);
  };
  const done = checks.filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{done} / {items.length} completed</span>
          <span>{Math.round((done / items.length) * 100)}%</span>
        </div>
        <Progress value={(done / items.length) * 100} className="h-2" />

        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i}>
              <label
                className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                  checks[i] ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/20"
                }`}
              >
                <Checkbox checked={checks[i]} onCheckedChange={() => toggle(i)} className="mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  )}
                </div>
              </label>
              {item.docCategory && dealerName && (
                <div className="ml-9 mt-2 mb-1">
                  <OnboardingDocUpload dealerName={dealerName} category={item.docCategory} compact />
                </div>
              )}
            </div>
          ))}
        </div>

        {dealerName && (
          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-sm font-medium flex items-center gap-2">
              <FileUp className="w-4 h-4" /> Upload Documents for {title}
            </p>
            <OnboardingDocUpload dealerName={dealerName} category={title} compact />
          </div>
        )}

        {done === items.length && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm font-medium">All items in this section are complete.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Section data                                                       */
/* ------------------------------------------------------------------ */
const businessItems: CheckItem[] = [
  { label: "Company registration number", description: "Verified against Companies House" },
  { label: "Registered address", description: "Official registered office address" },
  { label: "Trading address(es)", description: "All physical trading locations" },
  { label: "VAT registration", description: "VAT number and registration certificate", docCategory: "Financial" },
  { label: "FCA permissions", description: "If offering retail finance — FCA registration details", docCategory: "Compliance" },
  { label: "Organisational chart", description: "Company structure showing key personnel and reporting lines", docCategory: "Compliance" },
];

const financialItems: CheckItem[] = [
  { label: "Last 3 years audited accounts", description: "Filed accounts for the most recent 3 financial years", docCategory: "Financial" },
  { label: "Latest management accounts", description: "Most recent month-end or quarter-end management accounts", docCategory: "Financial" },
  { label: "Stock audit statements", description: "Required if changing funder — current stock position and valuations", docCategory: "Financial" },
  { label: "Bank statements (3–12 months)", description: "Duration depends on policy — primary business account(s)", docCategory: "Financial" },
];

const directorsItems: CheckItem[] = [
  { label: "Director details for KYC / AML", description: "Full name, DOB, residential address, nationality for each director", docCategory: "Compliance" },
  { label: "Directorship history", description: "Previous and concurrent directorships for all directors" },
  { label: "Personal guarantees", description: "If required — signed PG documentation from guarantors", docCategory: "Legal" },
];

const supportingItems: CheckItem[] = [
  { label: "Insurance details", description: "Motor trade insurance, public liability, employers' liability", docCategory: "Compliance" },
  { label: "Dealer website & digital footprint", description: "Website URL, social media presence, online reviews" },
];

const SECTIONS = [
  { key: "business", label: "Business Info", icon: Building2, title: "A. Business Information", desc: "Core company registration and structure details.", items: businessItems },
  { key: "financial", label: "Financial Info", icon: PoundSterling, title: "B. Financial Information", desc: "Financial statements and banking evidence.", items: financialItems },
  { key: "directors", label: "Directors & Shareholders", icon: Users, title: "C. Directors & Shareholders", desc: "Identity verification and personal guarantee requirements.", items: directorsItems },
  { key: "supporting", label: "Supporting Docs", icon: FileText, title: "D. Supporting Documents", desc: "Insurance, web presence, and additional evidence.", items: supportingItems },
];

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const locState = location.state as { dealerName?: string; companyNumber?: string } | null;
  const { toast } = useToast();

  const { state, update, saving, save } = useOnboardingPersistence();
  const [activeTab, setActiveTab] = useState("business");

  const dealerName = state.dealerName || locState?.dealerName || "";
  const companyNumber = state.companyNumber || locState?.companyNumber || "";

  // If navigated from pre-onboarding with state, seed it
  const [seeded, setSeeded] = useState(false);
  if (!seeded && locState?.dealerName && !state.dealerName) {
    setSeeded(true);
    update({ dealerName: locState.dealerName, companyNumber: locState.companyNumber || "", stage: "application" });
  }

  const tabOrder = SECTIONS.map((s) => s.key);
  const currentIdx = tabOrder.indexOf(activeTab);

  const checklistProgress = (state.checklistProgress || {}) as Record<string, boolean[]>;

  const updateChecks = (sectionKey: string, checks: boolean[]) => {
    const next = { ...checklistProgress, [sectionKey]: checks };
    update({ checklistProgress: next });
  };

  const handleComplete = () => {
    update({ stage: "completed", status: "passed" });
    save();
    toast({ title: "Application Complete", description: `${dealerName} application marked as complete.` });
  };

  // Calculate overall progress
  const totalItems = SECTIONS.reduce((sum, s) => sum + s.items.length, 0);
  const completedItems = SECTIONS.reduce((sum, s) => {
    const checks = checklistProgress[s.key] || [];
    return sum + checks.filter(Boolean).length;
  }, 0);
  const overallPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Application &amp; Due Diligence</h1>
            <p className="text-muted-foreground mt-1">
              Structured dealer application pack — collect and verify all required information.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {saving && <span className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />Saving…</span>}
            <Button variant="outline" className="gap-2" onClick={() => navigate("/pre-onboarding")}>
              <ArrowLeft className="w-4 h-4" /> Back to Pre‑Onboarding
            </Button>
          </div>
        </div>

        {/* Context from pre-onboarding */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                {dealerName && (
                  <Badge variant="secondary" className="gap-1">
                    <Building2 className="w-3 h-3" /> {dealerName}
                  </Badge>
                )}
                {companyNumber && (
                  <span className="text-muted-foreground">Co. #{companyNumber}</span>
                )}
                <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400">
                  Pre-Screening Passed
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">{overallPct}% complete</span>
                <Progress value={overallPct} className="h-2 w-32" />
              </div>
            </div>
            {/* CreditSafe */}
            <div className="pt-2 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">CreditSafe Report</p>
              <CreditSafeSearch defaultSearch={dealerName} companyNumber={companyNumber} />
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex-wrap">
            {SECTIONS.map((s) => (
              <TabsTrigger key={s.key} value={s.key} className="gap-2">
                <s.icon className="w-4 h-4" />{s.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {SECTIONS.map((s) => (
            <TabsContent key={s.key} value={s.key}>
              <ChecklistSection
                title={s.title}
                sectionKey={s.key}
                description={s.desc}
                icon={s.icon}
                items={s.items}
                dealerName={dealerName}
                savedChecks={checklistProgress[s.key] || []}
                onChecksChange={(checks) => updateChecks(s.key, checks)}
              />
            </TabsContent>
          ))}
        </Tabs>

        {/* Stage navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            disabled={currentIdx === 0}
            onClick={() => setActiveTab(tabOrder[currentIdx - 1])}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Previous Section
          </Button>
          {currentIdx < tabOrder.length - 1 ? (
            <Button onClick={() => setActiveTab(tabOrder[currentIdx + 1])} className="gap-2">
              Next Section <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button className="gap-2" onClick={handleComplete} disabled={overallPct < 100}>
              <CheckCircle2 className="w-4 h-4" /> Mark Application Complete
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
