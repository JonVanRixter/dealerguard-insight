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
import {
  Building2, PoundSterling, Users, FileText,
  CheckCircle2, FileUp, ArrowLeft, ArrowRight,
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
  description,
  icon: Icon,
  items,
  dealerName,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  items: CheckItem[];
  dealerName: string;
}) {
  const [checks, setChecks] = useState<boolean[]>(new Array(items.length).fill(false));
  const toggle = (i: number) => setChecks((c) => c.map((v, j) => (j === i ? !v : v)));
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
              {/* Inline doc upload per item if it has a docCategory */}
              {item.docCategory && dealerName && (
                <div className="ml-9 mt-2 mb-1">
                  <OnboardingDocUpload dealerName={dealerName} category={item.docCategory} compact />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Section-level upload */}
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

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { dealerName?: string; companyNumber?: string } | null;
  const [activeTab, setActiveTab] = useState("business");

  const dealerName = state?.dealerName || "";
  const companyNumber = state?.companyNumber || "";

  const tabOrder = ["business", "financial", "directors", "supporting"];
  const currentIdx = tabOrder.indexOf(activeTab);

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
          <Button variant="outline" className="gap-2" onClick={() => navigate("/pre-onboarding")}>
            <ArrowLeft className="w-4 h-4" /> Back to Pre‑Onboarding
          </Button>
        </div>

        {/* Context from pre-onboarding */}
        {dealerName && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 text-sm">
                <Badge variant="secondary" className="gap-1">
                  <Building2 className="w-3 h-3" /> {dealerName}
                </Badge>
                {companyNumber && (
                  <span className="text-muted-foreground">Co. #{companyNumber}</span>
                )}
                <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400">
                  Pre-Screening Passed
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="business" className="gap-2"><Building2 className="w-4 h-4" />Business Info</TabsTrigger>
            <TabsTrigger value="financial" className="gap-2"><PoundSterling className="w-4 h-4" />Financial Info</TabsTrigger>
            <TabsTrigger value="directors" className="gap-2"><Users className="w-4 h-4" />Directors &amp; Shareholders</TabsTrigger>
            <TabsTrigger value="supporting" className="gap-2"><FileText className="w-4 h-4" />Supporting Docs</TabsTrigger>
          </TabsList>

          <TabsContent value="business">
            <ChecklistSection title="A. Business Information" description="Core company registration and structure details." icon={Building2} items={businessItems} dealerName={dealerName} />
          </TabsContent>
          <TabsContent value="financial">
            <ChecklistSection title="B. Financial Information" description="Financial statements and banking evidence." icon={PoundSterling} items={financialItems} dealerName={dealerName} />
          </TabsContent>
          <TabsContent value="directors">
            <ChecklistSection title="C. Directors & Shareholders" description="Identity verification and personal guarantee requirements." icon={Users} items={directorsItems} dealerName={dealerName} />
          </TabsContent>
          <TabsContent value="supporting">
            <ChecklistSection title="D. Supporting Documents" description="Insurance, web presence, and additional evidence." icon={FileText} items={supportingItems} dealerName={dealerName} />
          </TabsContent>
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
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle2 className="w-4 h-4" /> Mark Application Complete
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
