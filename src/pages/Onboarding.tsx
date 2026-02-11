import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Building2, PoundSterling, Users, FileText,
  CheckCircle2, Upload, Calendar,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Shared checklist item                                              */
/* ------------------------------------------------------------------ */
interface CheckItem {
  label: string;
  description?: string;
}

function ChecklistSection({
  title,
  description,
  icon: Icon,
  items,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  items: CheckItem[];
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
            <label
              key={i}
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
          ))}
        </div>

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
  { label: "VAT registration", description: "VAT number and registration certificate" },
  { label: "FCA permissions", description: "If offering retail finance — FCA registration details" },
  { label: "Organisational chart", description: "Company structure showing key personnel and reporting lines" },
];

const financialItems: CheckItem[] = [
  { label: "Last 3 years audited accounts", description: "Filed accounts for the most recent 3 financial years" },
  { label: "Latest management accounts", description: "Most recent month-end or quarter-end management accounts" },
  { label: "Stock audit statements", description: "Required if changing funder — current stock position and valuations" },
  { label: "Bank statements (3–12 months)", description: "Duration depends on policy — primary business account(s)" },
];

const directorsItems: CheckItem[] = [
  { label: "Director details for KYC / AML", description: "Full name, DOB, residential address, nationality for each director" },
  { label: "Directorship history", description: "Previous and concurrent directorships for all directors" },
  { label: "Personal guarantees", description: "If required — signed PG documentation from guarantors" },
];

const supportingItems: CheckItem[] = [
  { label: "Insurance details", description: "Motor trade insurance, public liability, employers' liability" },
  { label: "Dealer website & digital footprint", description: "Website URL, social media presence, online reviews" },
];

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function Onboarding() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Application &amp; Due Diligence</h1>
          <p className="text-muted-foreground mt-1">
            Structured dealer application pack — collect and verify all required information.
          </p>
        </div>

        <Tabs defaultValue="business" className="space-y-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="business" className="gap-2"><Building2 className="w-4 h-4" />Business Info</TabsTrigger>
            <TabsTrigger value="financial" className="gap-2"><PoundSterling className="w-4 h-4" />Financial Info</TabsTrigger>
            <TabsTrigger value="directors" className="gap-2"><Users className="w-4 h-4" />Directors &amp; Shareholders</TabsTrigger>
            <TabsTrigger value="supporting" className="gap-2"><FileText className="w-4 h-4" />Supporting Docs</TabsTrigger>
          </TabsList>

          <TabsContent value="business">
            <ChecklistSection
              title="A. Business Information"
              description="Core company registration and structure details."
              icon={Building2}
              items={businessItems}
            />
          </TabsContent>

          <TabsContent value="financial">
            <ChecklistSection
              title="B. Financial Information"
              description="Financial statements and banking evidence."
              icon={PoundSterling}
              items={financialItems}
            />
          </TabsContent>

          <TabsContent value="directors">
            <ChecklistSection
              title="C. Directors & Shareholders"
              description="Identity verification and personal guarantee requirements."
              icon={Users}
              items={directorsItems}
            />
          </TabsContent>

          <TabsContent value="supporting">
            <ChecklistSection
              title="D. Supporting Documents"
              description="Insurance, web presence, and additional evidence."
              icon={FileText}
              items={supportingItems}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
