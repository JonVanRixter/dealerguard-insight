import { useMemo, useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { RagBadge } from "@/components/RagBadge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Play, Download, ShieldAlert, ShieldCheck, AlertTriangle, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dealers } from "@/data/dealers";
import { generateDealerAudit } from "@/data/auditFramework";
import { AuditSectionCard } from "@/components/dealer/AuditSectionCard";
import { KeyActionsTable } from "@/components/dealer/KeyActionsTable";
import { CustomerSentimentCard } from "@/components/dealer/CustomerSentimentCard";
import { ReportSummaryCard } from "@/components/dealer/ReportSummaryCard";
import { generateComplianceReportPDF, type PassportCheckEntry, type FcaRegisterEntry, type CreditSafeEntry } from "@/utils/pdfExport";
import { supabase } from "@/integrations/supabase/client";
import { useUserSettings } from "@/hooks/useUserSettings";
import { AiAuditSummary } from "@/components/dealer/AiAuditSummary";
import { DealerDocuments } from "@/components/dealer/DealerDocuments";
import { DealerRecheckTimeline } from "@/components/dealer/DealerRecheckTimeline";
import { CreditSafeCard } from "@/components/dealer/CreditSafeCard";
import { SectionRadarChart } from "@/components/dealer/SectionRadarChart";
import { ControlsBreakdownChart } from "@/components/dealer/ControlsBreakdownChart";
import { ActionStatusChart } from "@/components/dealer/ActionStatusChart";
import { DealerScoreTrend } from "@/components/dealer/DealerScoreTrend";
import { DirectorPassportCheck } from "@/components/dealer/DirectorPassportCheck";
import { FcaRegisterCard } from "@/components/dealer/FcaRegisterCard";
import { DealerNotes } from "@/components/dealer/DealerNotes";
import { Badge } from "@/components/ui/badge";
import { dealers as dealersList } from "@/data/dealers";

const DealerDetail = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings } = useUserSettings();
  const dealerName = name ? decodeURIComponent(name) : "Unknown Dealer";
  const [aiSummary, setAiSummary] = useState("");
  const [docCount, setDocCount] = useState(0);

  const [passportChecks, setPassportChecks] = useState<PassportCheckEntry[]>([]);
  const [fcaRegisterData, setFcaRegisterData] = useState<FcaRegisterEntry | undefined>(undefined);
  const [creditSafeData, setCreditSafeData] = useState<CreditSafeEntry | undefined>(undefined);

  const handleSummaryChange = useCallback((summary: string) => {
    setAiSummary(summary);
  }, []);

  // Fetch document count + passport docs
  useEffect(() => {
    const fetchDocs = async () => {
      const { data } = await supabase
        .from("dealer_documents")
        .select("id, category, tags, file_name, created_at, expiry_date")
        .eq("dealer_name", dealerName);

      if (data) {
        setDocCount(data.length);
        setPassportChecks(
          data
            .filter((d: any) => d.category === "Passport / ID")
            .map((d: any) => {
              const statusTag = d.tags?.find((t: string) => t.startsWith("status:"));
              const reviewTag = d.tags?.find((t: string) => t.startsWith("review:"));
              const directorTag = d.tags?.find((t: string) => t.startsWith("director:"));
              return {
                directorName: directorTag?.slice(9) || "Unknown",
                fileName: d.file_name,
                status: (statusTag?.split(":")[1] as "pending" | "verified" | "rejected") || "pending",
                uploadDate: new Date(d.created_at).toLocaleDateString("en-GB"),
                expiryDate: d.expiry_date ? new Date(d.expiry_date).toLocaleDateString("en-GB") : undefined,
                reviewNote: reviewTag?.slice(7) || undefined,
              };
            })
        );
      }
    };
    fetchDocs();
  }, [dealerName]);

  // Find the dealer in our data to get the index for consistent audit generation
  const dealerData = useMemo(() => {
    const index = dealersList.findIndex(d => d.name === dealerName);
    return { index: index >= 0 ? index : 0, dealer: dealersList[index >= 0 ? index : 0] };
  }, [dealerName]);
  const dealerIndex = dealerData.index;

  // Generate the full audit for this dealer
  const audit = useMemo(() => generateDealerAudit(dealerName, dealerIndex), [dealerName, dealerIndex]);

  // Generate FCA ref from dealer index
  const fcaRef = useMemo(() => String(600000 + dealerIndex).slice(0, 6), [dealerIndex]);

  const handleRunAudit = () => {
    toast({
      title: "Audit Started",
      description: `A new compliance audit has been initiated for ${dealerName}. You'll be notified when it's complete.`,
    });
  };

  const handleDownloadReport = () => {
    try {
      generateComplianceReportPDF(audit, fcaRef, aiSummary || undefined, passportChecks.length > 0 ? passportChecks : undefined, fcaRegisterData, creditSafeData);
      toast({
        title: "Report Downloaded",
        description: `Compliance report for ${dealerName} has been generated and downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Alert banner config based on overall RAG
  const alertConfig = {
    green: {
      icon: ShieldCheck,
      bg: "bg-rag-green-bg border-rag-green/20",
      text: "text-rag-green-text",
      iconColor: "text-rag-green",
      message: `Overall Risk Score: ${audit.overallScore}% (Green). Compliant.`,
    },
    amber: {
      icon: AlertTriangle,
      bg: "bg-rag-amber-bg border-rag-amber/20",
      text: "text-rag-amber-text",
      iconColor: "text-rag-amber",
      message: `Overall Risk Score: ${audit.overallScore}% (Amber). Attention Required.`,
    },
    red: {
      icon: ShieldAlert,
      bg: "bg-rag-red-bg border-rag-red/20",
      text: "text-rag-red-text",
      iconColor: "text-rag-red",
      message: `Overall Risk Score: ${audit.overallScore}% (Red). Critical Issues Detected.`,
    },
  }[audit.overallRag];

  const AlertIcon = alertConfig.icon;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back nav */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-foreground">{dealerName}</h2>
              <RagBadge status={audit.overallRag} />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
              <span>FCA Ref: <span className="font-medium text-foreground">{fcaRef}</span></span>
              <span>Firm Type: <span className="font-medium text-foreground">{audit.firmType === "AR" ? "Appointed Representative" : "Directly Authorised"}</span></span>
              {audit.firmType === "AR" && dealerData.dealer?.principalFirm && (
                <span>Principal Firm: <span className="font-medium text-foreground">{dealerData.dealer.principalFirm}</span></span>
              )}
              <span>Last Audit: <span className="font-medium text-foreground">{audit.lastAuditDate}</span></span>
              <span className="inline-flex items-center gap-1">
                <FolderOpen className="w-3.5 h-3.5" />
                Documents:
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 min-w-5 h-5 justify-center">
                  {docCount}
                </Badge>
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRunAudit} className="gap-2">
              <Play className="w-4 h-4" /> Run New Audit
            </Button>
            <Button onClick={handleDownloadReport} variant="outline" className="gap-2">
              <Download className="w-4 h-4" /> Download Report
            </Button>
          </div>
        </div>

        {/* Alert Banner */}
        <div className={`flex flex-col gap-1.5 px-4 py-3 rounded-lg border ${alertConfig.bg}`}>
          <div className="flex items-center gap-3">
            <AlertIcon className={`w-5 h-5 shrink-0 ${alertConfig.iconColor}`} />
            <p className={`text-sm font-medium ${alertConfig.text}`}>
              {alertConfig.message}
            </p>
          </div>
          <p className="text-xs text-muted-foreground ml-8">{audit.assuranceStatement}</p>
        </div>

        {/* Top Cards: Customer Sentiment + Action Status | Report Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-stretch">
          <div className="flex flex-col gap-4 min-h-0 overflow-hidden">
            <CustomerSentimentCard
              score={audit.customerSentimentScore}
              trend={audit.customerSentimentTrend}
              categories={audit.sentimentCategories}
              oversightThreshold={settings.css_oversight_threshold}
              rewardThreshold={settings.css_reward_threshold}
            />
            <ActionStatusChart actions={audit.keyActions} />
          </div>
          <div className="lg:col-span-2">
            <ReportSummaryCard
              sections={audit.sections}
              overallRag={audit.overallRag}
              overallScore={audit.overallScore}
            />
          </div>
        </div>

        {/* 12-Month Score Trend */}
        <DealerScoreTrend dealerName={dealerName} />

        {/* Data Visualizations Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionRadarChart sections={audit.sections} />
          <ControlsBreakdownChart sections={audit.sections} />
        </div>

        {/* AI Executive Summary */}
        <AiAuditSummary audit={audit} onSummaryChange={handleSummaryChange} />

        {/* CreditSafe Report */}
        <CreditSafeCard dealerName={dealerName} companiesHouseNumber={dealerData.dealer?.companiesHouseNumber} onDataLoaded={setCreditSafeData} />

        {/* FCA Register Check */}
        <FcaRegisterCard dealerName={dealerName} fcaRef={fcaRef} onDataLoaded={setFcaRegisterData} />

        {/* Director Passport / ID Check */}
        <DirectorPassportCheck dealerName={dealerName} />

        {/* Key Actions */}
        <KeyActionsTable actions={audit.keyActions} />

        {/* Re-Check Schedule (Green dealers only) */}
        <DealerRecheckTimeline dealerName={dealerName} dealerRag={audit.overallRag} />

        {/* Notes */}
        <DealerNotes dealerName={dealerName} />

        {/* Documents */}
        <DealerDocuments dealerName={dealerName} />

        {/* Audit Sections */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Audit Sections</h3>
          {audit.sections.map((section, index) => (
            <AuditSectionCard
              key={section.id}
              section={section}
              defaultExpanded={index === 0}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DealerDetail;
