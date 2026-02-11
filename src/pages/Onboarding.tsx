import { useState, useMemo, useEffect, useRef } from "react";
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
import { DealerEnrichment } from "@/components/onboarding/DealerEnrichment";
import { ScreeningDataBadge } from "@/components/onboarding/ScreeningDataBadge";
import { FcaRegisterCard } from "@/components/dealer/FcaRegisterCard";
import { useOnboardingPersistence } from "@/hooks/useOnboardingPersistence";
import { useToast } from "@/hooks/use-toast";
import { ScreeningDataEditor } from "@/components/onboarding/ScreeningDataEditor";
import { generateOnboardingPdf } from "@/utils/onboardingPdfExport";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2, PoundSterling, Users, FileText,
  CheckCircle2, FileUp, ArrowLeft, ArrowRight, Loader2, ShieldCheck, Download,
  XCircle, AlertTriangle, Mail, Send,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Shared checklist item                                              */
/* ------------------------------------------------------------------ */
interface CheckItem {
  label: string;
  description?: string;
  docCategory?: string;
  dataKey?: string;
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
  screeningDataMap,
}: {
  title: string;
  sectionKey: string;
  description: string;
  icon: React.ElementType;
  items: CheckItem[];
  dealerName: string;
  savedChecks: boolean[];
  onChecksChange: (checks: boolean[]) => void;
  screeningDataMap?: Record<string, string>;
}) {
  const checks = useMemo(() => {
    const base = savedChecks.length === items.length ? [...savedChecks] : new Array(items.length).fill(false);
    items.forEach((item, i) => {
      if (item.dataKey && screeningDataMap?.[item.dataKey] && !base[i]) {
        base[i] = true;
      }
    });
    return base;
  }, [savedChecks, items, screeningDataMap]);

  useEffect(() => {
    const orig = savedChecks.length === items.length ? savedChecks : new Array(items.length).fill(false);
    const hasChange = checks.some((v, i) => v !== orig[i]);
    if (hasChange) onChecksChange(checks);
  }, [checks]);

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
          {items.map((item, i) => {
            const hasScreeningData = !!(item.dataKey && screeningDataMap?.[item.dataKey]);
            const enrichmentRan = !!(screeningDataMap?.["_enrichment"]);
            const isMissing = !!(item.dataKey && enrichmentRan && !screeningDataMap?.[item.dataKey]);

            return (
              <div key={i}>
                <label
                  className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                    hasScreeningData
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : isMissing
                        ? "border-destructive/40 bg-destructive/5"
                        : checks[i]
                          ? "border-primary/40 bg-primary/5"
                          : "border-border hover:border-primary/20"
                  }`}
                >
                  {hasScreeningData ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  ) : isMissing ? (
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                  ) : (
                    <Checkbox checked={checks[i]} onCheckedChange={() => toggle(i)} className="mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${isMissing ? "text-destructive" : ""}`}>{item.label}</p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    )}
                    {hasScreeningData && (
                      <div className="mt-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">{screeningDataMap![item.dataKey!]}</p>
                        <p className="text-[10px] text-emerald-600/70 dark:text-emerald-500/70 mt-0.5">✓ Auto-populated from screening</p>
                      </div>
                    )}
                    {isMissing && (
                      <div className="mt-1.5 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2">
                        <p className="text-xs text-destructive font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> NOT FOUND — requires manual input
                        </p>
                      </div>
                    )}
                  </div>
                </label>
                {item.docCategory && dealerName && (
                  <div className="ml-9 mt-2 mb-1">
                    <OnboardingDocUpload dealerName={dealerName} category={item.docCategory} compact />
                  </div>
                )}
              </div>
            );
          })}
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
  { label: "Company registration number", description: "Verified against Companies House", dataKey: "companyRegNo" },
  { label: "Registered address", description: "Official registered office address", dataKey: "registeredAddress" },
  { label: "Trading address(es)", description: "All physical trading locations" },
  { label: "VAT registration", description: "VAT number and registration certificate", docCategory: "Financial", dataKey: "vatRegistration" },
  { label: "FCA permissions", description: "If offering retail finance — FCA registration details", docCategory: "Compliance", dataKey: "fcaPermissions" },
  { label: "FCA FRN & Status", description: "FCA Firm Reference Number and authorisation status", dataKey: "fcaFrn" },
  { label: "Company name & status", description: "Official registered name and current status", dataKey: "companyName" },
  { label: "Organisational chart", description: "Company structure showing key personnel and reporting lines", docCategory: "Compliance" },
];

const financialItems: CheckItem[] = [
  { label: "Credit score & risk band", description: "CreditSafe credit score and risk assessment", dataKey: "creditScore" },
  { label: "Last 3 years audited accounts", description: "Filed accounts for the most recent 3 financial years", docCategory: "Financial" },
  { label: "Latest management accounts", description: "Most recent month-end or quarter-end management accounts", docCategory: "Financial" },
  { label: "Stock audit statements", description: "Required if changing funder — current stock position and valuations", docCategory: "Financial" },
  { label: "Bank statements (3–12 months)", description: "Duration depends on policy — primary business account(s)", docCategory: "Financial" },
];

const directorsItems: CheckItem[] = [
  { label: "Director details for KYC / AML", description: "Full name, DOB, residential address, nationality for each director", docCategory: "Compliance", dataKey: "fcaIndividuals" },
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
/*  Detail modal data for demo mode                                    */
/* ------------------------------------------------------------------ */
function DbsDetailContent() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploaded, setUploaded] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-2">Staff Requiring Enhanced DBS Checks</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <div>
              <p className="text-sm font-medium text-foreground">Mark Roberts — Sales Manager</p>
              <p className="text-xs text-muted-foreground">Enhanced DBS required</p>
            </div>
            <Badge variant="destructive" className="text-xs">{uploaded ? "Pending Review" : "Missing"}</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <div>
              <p className="text-sm font-medium text-foreground">Lisa Evans — Sales Executive</p>
              <p className="text-xs text-muted-foreground">Enhanced DBS required</p>
            </div>
            <Badge variant="destructive" className="text-xs">Missing</Badge>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><p className="text-muted-foreground">Deadline</p><p className="font-medium text-destructive">14 days remaining</p></div>
        <div><p className="text-muted-foreground">Status</p><p className="font-medium text-destructive">{uploaded ? "Certificate received — Under TCG review" : "Action Required"}</p></div>
      </div>
      {uploaded && (
        <div className="flex items-center gap-2 text-sm text-rag-green">
          <CheckCircle2 className="w-4 h-4" /> {uploaded}
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setUploaded(file.name);
            toast({ title: "DBS certificate uploaded successfully", description: "Certificate received — Under TCG review" });
          }
          e.target.value = "";
        }}
      />
      <Button variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
        <FileUp className="w-4 h-4" /> Upload DBS Certificate
      </Button>
    </div>
  );
}

function TrainingDetailContent() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploaded, setUploaded] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><p className="text-muted-foreground">Certificates Uploaded</p><p className="font-medium text-foreground">{uploaded ? 2 : 1}</p></div>
        <div><p className="text-muted-foreground">Status</p><p className="font-medium text-rag-amber">Under Review</p></div>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">Staff Training Records</p>
        <div className="rounded-lg border border-border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">J. Smith (Director)</p>
              <p className="text-xs text-muted-foreground">TCF Annual Refresher 2025</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-rag-amber/15 text-rag-amber border-rag-amber/30 text-xs">Under Review</Badge>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"><Download className="w-3 h-3" /> View</Button>
            </div>
          </div>
        </div>
        {uploaded && (
          <div className="rounded-lg border border-border p-3 mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rag-green" />
                <div>
                  <p className="text-sm font-medium text-foreground">{uploaded}</p>
                  <p className="text-xs text-muted-foreground">Uploaded just now</p>
                </div>
              </div>
              <Badge className="bg-rag-amber/15 text-rag-amber border-rag-amber/30 text-xs">Under Review</Badge>
            </div>
          </div>
        )}
      </div>
      <div className="rounded-lg border border-rag-amber/30 bg-rag-amber-bg p-3">
        <p className="text-sm text-rag-amber-text">TCG Operations team is reviewing the uploaded certificate. Expected completion: 2 business days.</p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.png"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setUploaded(file.name);
            toast({ title: "Certificate uploaded for review", description: `${file.name} has been submitted for TCG Operations review.` });
          }
          e.target.value = "";
        }}
      />
      <Button variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
        <FileUp className="w-4 h-4" /> Upload Certificate
      </Button>
    </div>
  );
}

const STATIC_SECTION_DETAILS: Record<string, { title: string; content: React.ReactNode }> = {
  "Legal Status": {
    title: "Legal Status — Details",
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-muted-foreground">Company Status</p><p className="font-medium text-foreground">Active</p></div>
          <div><p className="text-muted-foreground">Incorporation Date</p><p className="font-medium text-foreground">12 Mar 2018</p></div>
          <div><p className="text-muted-foreground">Company Number</p><p className="font-medium text-foreground">11234567</p></div>
          <div><p className="text-muted-foreground">Last Verified</p><p className="font-medium text-foreground">10 Feb 2026</p></div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Directors</p>
          <ul className="text-sm space-y-1">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rag-green" /> James Thompson — Appointed 12 Mar 2018</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rag-green" /> Sarah Mitchell — Appointed 05 Jun 2020</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rag-green" /> David Chen — Appointed 14 Jan 2023</li>
          </ul>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Persons of Significant Control</p>
          <ul className="text-sm space-y-1">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rag-green" /> James Thompson — 75%+ shares</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rag-green" /> Sarah Mitchell — 25%+ shares</li>
          </ul>
        </div>
      </div>
    ),
  },
  "FCA Authorisation": {
    title: "FCA Authorisation — Details",
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-muted-foreground">FCA Reference</p><p className="font-medium text-foreground">FRN: 123456</p></div>
          <div><p className="text-muted-foreground">Status</p><p className="font-medium text-rag-green">Authorised</p></div>
          <div><p className="text-muted-foreground">Last Checked</p><p className="font-medium text-foreground">10 Feb 2026</p></div>
          <div><p className="text-muted-foreground">Warnings</p><p className="font-medium text-foreground">None</p></div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Permissions</p>
          <ul className="text-sm space-y-1">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rag-green" /> Consumer Credit</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rag-green" /> Credit Broking</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rag-green" /> Debt Administration</li>
          </ul>
        </div>
      </div>
    ),
  },
  "Financial Checks": {
    title: "Financial Checks — Details",
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-muted-foreground">Credit Score</p><p className="font-medium text-rag-amber">62 / 100</p></div>
          <div><p className="text-muted-foreground">Risk Band</p><p className="font-medium text-rag-amber">Medium</p></div>
          <div><p className="text-muted-foreground">Report Status</p><p className="font-medium text-rag-amber">Awaiting full report</p></div>
          <div><p className="text-muted-foreground">Last Updated</p><p className="font-medium text-foreground">08 Feb 2026</p></div>
        </div>
        <div className="rounded-lg border border-rag-amber/30 bg-rag-amber-bg p-3">
          <p className="text-sm text-rag-amber-text flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Full credit report is pending. Preliminary score retrieved.</p>
        </div>
      </div>
    ),
  },
  "Complaints Handling": {
    title: "Complaints Handling — Details",
    content: (
      <div className="space-y-4 text-sm">
        <p className="text-muted-foreground">This is a new dealer with no complaint history. Section marked as N/A.</p>
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
          <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> No action required at this stage.</p>
        </div>
      </div>
    ),
  },
  "Marketing & Promotions": {
    title: "Marketing & Promotions — Details",
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-muted-foreground">Website</p><p className="font-medium text-foreground">www.newstartmotors.co.uk</p></div>
          <div><p className="text-muted-foreground">Last Checked</p><p className="font-medium text-foreground">09 Feb 2026</p></div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Compliance Checklist</p>
          <ul className="text-sm space-y-1">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rag-green" /> Representative APR displayed</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rag-green" /> Commission disclosure visible</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rag-green" /> FCA registration number on site</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rag-green" /> Privacy policy compliant</li>
          </ul>
        </div>
      </div>
    ),
  },
  "KYC / AML": {
    title: "KYC / AML — Details",
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-muted-foreground">Sanctions Check</p><p className="font-medium text-rag-green">Clear</p></div>
          <div><p className="text-muted-foreground">PEP Check</p><p className="font-medium text-rag-green">Clear</p></div>
          <div><p className="text-muted-foreground">AML Risk Rating</p><p className="font-medium text-rag-green">Low</p></div>
          <div><p className="text-muted-foreground">Last Verified</p><p className="font-medium text-foreground">10 Feb 2026</p></div>
        </div>
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
          <p className="text-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> All KYC/AML checks passed. No adverse findings.</p>
        </div>
      </div>
    ),
  },
};

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const locState = location.state as { dealerName?: string; companyNumber?: string; screeningResults?: Record<string, string> } | null;
  const { toast } = useToast();
  const { demoMode } = useAuth();

  const { state, update, saving, save } = useOnboardingPersistence();
  const [activeTab, setActiveTab] = useState("business");
  const [detailModal, setDetailModal] = useState<string | null>(null);
  const [requestInfoOpen, setRequestInfoOpen] = useState(false);
  const [emailBody, setEmailBody] = useState(
    `Dear NewStart Motors Ltd,\n\nThank you for your application to join our dealer network.\n\nFollowing our review, we require the following additional information before we can proceed:\n\n• Enhanced DBS certificates for 2 staff members (Sales Manager, Sales Executive)\n• Latest management accounts (Q4 2025)\n\nPlease submit these documents within 14 business days.\n\nIf you have any questions, please don't hesitate to contact us.\n\nKind regards,\nJoel Knight\nThe Compliance Guys`
  );

  const dealerName = state.dealerName || locState?.dealerName || "";
  const companyNumber = state.companyNumber || locState?.companyNumber || "";

  const [seeded, setSeeded] = useState(false);
  if (!seeded && locState?.dealerName && !state.dealerName) {
    setSeeded(true);
    update({
      dealerName: locState.dealerName,
      companyNumber: locState.companyNumber || "",
      stage: "application",
      screeningResults: locState.screeningResults || {},
    });
  }

  const screeningDataMap = useMemo(() => {
    const results = state.screeningResults || locState?.screeningResults || {};
    const map: Record<string, string> = {};
    if (results.creditSafe) {
      try {
        const cs = JSON.parse(results.creditSafe);
        if (cs.regNo) map.companyRegNo = cs.regNo;
        if (cs.score) map.creditScore = `${cs.score}/${cs.maxScore || "100"} (${cs.riskLevel || "N/A"})`;
        if (cs.companyName) map.companyName = cs.companyName;
        if (cs.status) map.companyStatus = cs.status;
      } catch {}
    }
    if (results.fca) {
      try {
        const fca = JSON.parse(results.fca);
        if (fca.permissions?.length > 0) {
          map.fcaPermissions = fca.permissions.slice(0, 3).join(", ") + (fca.permissions.length > 3 ? ` (+${fca.permissions.length - 3} more)` : "");
        }
        if (fca.frn) map.fcaFrn = `FRN: ${fca.frn} — ${fca.status || "Unknown"}`;
        if (fca.individuals?.length > 0) {
          map.fcaIndividuals = fca.individuals.slice(0, 3).map((i: any) => i.name).join(", ") + (fca.individuals.length > 3 ? ` (+${fca.individuals.length - 3} more)` : "");
        }
        if (fca.companiesHouseNumber) map.companyRegNo = map.companyRegNo || fca.companiesHouseNumber;
        if (fca.address) {
          const addr = typeof fca.address === 'string' ? fca.address : Object.values(fca.address || {}).filter(Boolean).join(", ");
          if (addr) map.registeredAddress = addr;
        }
      } catch {}
    }
    if (results.companiesHouse) {
      try {
        const ch = JSON.parse(results.companiesHouse);
        if (ch.registeredAddress) map.registeredAddress = map.registeredAddress || ch.registeredAddress;
        if (ch.vatNumber) map.vatRegistration = ch.vatNumber;
        if (ch.companyNumber) map.companyRegNo = map.companyRegNo || ch.companyNumber;
      } catch {}
    }
    if (!map.companyRegNo && companyNumber) map.companyRegNo = companyNumber;
    if (results._overrides) {
      try { Object.assign(map, JSON.parse(results._overrides)); } catch {}
    }
    if (results._enrichment) map._enrichment = "true";
    for (const [k, v] of Object.entries(results)) {
      if (!k.startsWith("_") && k !== "creditSafe" && k !== "fca" && k !== "companiesHouse" && typeof v === "string" && v && !map[k]) {
        map[k] = v;
      }
    }
    return map;
  }, [state.screeningResults, locState?.screeningResults, companyNumber]);

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

  const totalItems = SECTIONS.reduce((sum, s) => sum + s.items.length, 0);
  const completedItems = SECTIONS.reduce((sum, s) => {
    const checks = checklistProgress[s.key] || [];
    return sum + checks.filter(Boolean).length;
  }, 0);
  const overallPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Render detail content — use component for interactive ones, static for others
  const renderDetailContent = () => {
    if (!detailModal) return null;
    if (detailModal === "DBS / Background") return <DbsDetailContent />;
    if (detailModal === "Training & Competency") return <TrainingDetailContent />;
    const staticDetail = STATIC_SECTION_DETAILS[detailModal];
    return staticDetail?.content || null;
  };

  const getDetailTitle = () => {
    if (!detailModal) return "";
    if (detailModal === "DBS / Background") return "DBS / Background Checks — Details";
    if (detailModal === "Training & Competency") return "Training & Competency — Details";
    return STATIC_SECTION_DETAILS[detailModal]?.title || detailModal;
  };

  if (demoMode) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Application &amp; Due Diligence</h1>
            <p className="text-muted-foreground mt-1">
              Structured dealer application pack — collect and verify all required information.
            </p>
          </div>

          {/* Onboarding Score Card */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">NewStart Motors Ltd — Onboarding Progress</h2>
                <p className="text-sm text-muted-foreground">6 of 8 sections complete</p>
              </div>
              <Badge className="bg-rag-amber/15 text-rag-amber border-rag-amber/30 text-sm px-3 py-1">Pending Documents</Badge>
            </div>
            <Progress value={75} className="h-3 mb-3" />
            <div className="flex gap-3">
              <Button className="gap-2" onClick={() => toast({ title: "Dealer Approved", description: "NewStart Motors Ltd has been approved and added to the active portfolio." })}>
                <CheckCircle2 className="w-4 h-4" /> Approve Dealer
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => setRequestInfoOpen(true)}>
                <Mail className="w-4 h-4" /> Request More Info
              </Button>
            </div>
          </div>

          {/* 8-Section Onboarding Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Legal Status", status: "complete" as const, score: "100%", detail: "Company House verified" },
              { name: "FCA Authorisation", status: "complete" as const, score: "100%", detail: "FRN: 123456" },
              { name: "Financial Checks", status: "pending" as const, score: "50%", detail: "Awaiting credit report" },
              { name: "DBS / Background", status: "failed" as const, score: "0%", detail: "2 staff need Enhanced DBS" },
              { name: "Training & Competency", status: "pending" as const, score: "60%", detail: "Certificates under review" },
              { name: "Complaints Handling", status: "complete" as const, score: "N/A", detail: "New dealer — not applicable" },
              { name: "Marketing & Promotions", status: "complete" as const, score: "100%", detail: "Website checked" },
              { name: "KYC / AML", status: "complete" as const, score: "100%", detail: "Sanctions clear" },
            ].map((section) => (
              <div key={section.name} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  {section.status === "complete" ? (
                    <CheckCircle2 className="w-5 h-5 text-rag-green" />
                  ) : section.status === "pending" ? (
                    <AlertTriangle className="w-5 h-5 text-rag-amber" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rag-red" />
                  )}
                  <h3 className="text-sm font-semibold text-foreground">{section.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{section.detail}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${
                    section.status === "complete" ? "text-rag-green" : section.status === "pending" ? "text-rag-amber" : "text-rag-red"
                  }`}>
                    {section.status === "complete" ? "✓ Complete" : section.status === "pending" ? "⚠ Pending" : "✗ Failed"}
                  </span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setDetailModal(section.name)}>View Details</Button>
                </div>
              </div>
            ))}
          </div>

          {/* Detail Modal */}
          <Dialog open={!!detailModal} onOpenChange={(open) => !open && setDetailModal(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{getDetailTitle()}</DialogTitle>
                <DialogDescription>Detailed compliance information for this section.</DialogDescription>
              </DialogHeader>
              {renderDetailContent()}
            </DialogContent>
          </Dialog>

          {/* Request More Info Modal */}
          <Dialog open={requestInfoOpen} onOpenChange={setRequestInfoOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Request Additional Information</DialogTitle>
                <DialogDescription>Send an email to the dealer requesting missing documents or information.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">To</p>
                    <p className="font-medium text-foreground">contact@newstartmotors.co.uk</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Subject</p>
                    <p className="font-medium text-foreground">Additional Information Required — Dealer Onboarding</p>
                  </div>
                </div>
                <Textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="min-h-[250px] text-sm"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setRequestInfoOpen(false)}>Cancel</Button>
                  <Button className="gap-2" onClick={() => {
                    setRequestInfoOpen(false);
                    toast({ title: "Request Sent", description: "Email sent to contact@newstartmotors.co.uk" });
                  }}>
                    <Send className="w-4 h-4" /> Send Request
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    );
  }

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
            <Button
              variant="outline"
              className="gap-2"
              onClick={() =>
                generateOnboardingPdf({
                  dealerName,
                  companyNumber,
                  screeningDataMap,
                  checklistProgress,
                  sections: SECTIONS.map((s) => ({ key: s.key, title: s.title, items: s.items })),
                })
              }
            >
              <Download className="w-4 h-4" /> Export PDF
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => navigate("/pre-onboarding")}>
              <ArrowLeft className="w-4 h-4" /> Back to Pre‑Onboarding
            </Button>
          </div>
        </div>

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
            <div className="pt-2 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">Automatic Dealer Enrichment</p>
              <DealerEnrichment
                dealerName={dealerName}
                companyNumber={companyNumber}
                autoTrigger
                onEnriched={(result, screeningMap) => {
                  const enrichmentData: Record<string, string> = {};
                  for (const [k, v] of Object.entries(screeningMap)) {
                    if (v) enrichmentData[k] = v;
                  }
                  enrichmentData._enrichment = JSON.stringify(result);
                  update({ screeningResults: { ...state.screeningResults, ...enrichmentData } });
                }}
              />
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">CreditSafe Report</p>
              <CreditSafeSearch
                defaultSearch={dealerName}
                companyNumber={companyNumber}
                onResult={(res) => {
                  update({ screeningResults: { ...state.screeningResults, creditSafe: JSON.stringify(res) } });
                }}
              />
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">FCA Register</p>
              <FcaRegisterCard
                dealerName={dealerName}
                onDataLoaded={(data) => {
                  const fcaData: any = { ...data };
                  update({ screeningResults: { ...state.screeningResults, fca: JSON.stringify(fcaData) } });
                }}
              />
            </div>
            {Object.keys(screeningDataMap).length > 0 && (
              <div className="pt-2 border-t border-border">
                <ScreeningDataEditor
                  screeningDataMap={screeningDataMap}
                  onUpdate={(updated) => {
                    update({ screeningResults: { ...state.screeningResults, _overrides: JSON.stringify(updated) } });
                  }}
                />
              </div>
            )}
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
                screeningDataMap={screeningDataMap}
              />
            </TabsContent>
          ))}
        </Tabs>

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
