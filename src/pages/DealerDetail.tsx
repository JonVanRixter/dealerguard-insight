import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { RagBadge } from "@/components/RagBadge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Play, Download, ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dealers } from "@/data/dealers";
import { generateDealerAudit } from "@/data/auditFramework";
import { AuditSectionCard } from "@/components/dealer/AuditSectionCard";
import { KeyActionsTable } from "@/components/dealer/KeyActionsTable";
import { CustomerSentimentCard } from "@/components/dealer/CustomerSentimentCard";
import { ReportSummaryCard } from "@/components/dealer/ReportSummaryCard";
import { generateComplianceReportPDF } from "@/utils/pdfExport";

const DealerDetail = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const dealerName = name ? decodeURIComponent(name) : "Unknown Dealer";

  // Find the dealer in our data to get the index for consistent audit generation
  const dealerIndex = useMemo(() => {
    const index = dealers.findIndex(d => d.name === dealerName);
    return index >= 0 ? index : 0;
  }, [dealerName]);

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
      generateComplianceReportPDF(audit, fcaRef);
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
              <span>Last Audit: <span className="font-medium text-foreground">{audit.lastAuditDate}</span></span>
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
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${alertConfig.bg}`}>
          <AlertIcon className={`w-5 h-5 shrink-0 ${alertConfig.iconColor}`} />
          <p className={`text-sm font-medium ${alertConfig.text}`}>
            {alertConfig.message}
          </p>
        </div>

        {/* Top Cards: Customer Sentiment + Report Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CustomerSentimentCard
            score={audit.customerSentimentScore}
            trend={audit.customerSentimentTrend}
            categories={audit.sentimentCategories}
          />
          <div className="lg:col-span-2">
            <ReportSummaryCard
              sections={audit.sections}
              overallRag={audit.overallRag}
              overallScore={audit.overallScore}
            />
          </div>
        </div>

        {/* Key Actions */}
        <KeyActionsTable actions={audit.keyActions} />

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
