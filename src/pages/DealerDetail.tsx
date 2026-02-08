import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { RagBadge } from "@/components/RagBadge";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Play,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuditCategory {
  name: string;
  score: number;
  rag: "green" | "amber" | "red";
}

const auditCategories: AuditCategory[] = [
  { name: "Legal Status", score: 100, rag: "green" },
  { name: "FCA Auth", score: 100, rag: "green" },
  { name: "Financial", score: 85, rag: "green" },
  { name: "DBS Compliance", score: 40, rag: "red" },
  { name: "Training", score: 55, rag: "amber" },
  { name: "Complaints", score: 70, rag: "amber" },
  { name: "Marketing", score: 80, rag: "green" },
  { name: "KYC & AML", score: 90, rag: "green" },
];

const priorityFixes = [
  { text: "DBS Compliance: 2 staff missing checks", rag: "red" as const },
  { text: "Training: Refresher overdue for 3 employees", rag: "amber" as const },
  { text: "Complaints: Response SLA breached (2 cases)", rag: "amber" as const },
];

const RagIcon = ({ rag }: { rag: string }) => {
  if (rag === "green") return <CheckCircle2 className="w-5 h-5 text-rag-green" />;
  if (rag === "amber") return <AlertTriangle className="w-5 h-5 text-rag-amber" />;
  return <XCircle className="w-5 h-5 text-rag-red" />;
};

const DealerDetail = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const dealerName = name ? decodeURIComponent(name) : "Unknown Dealer";

  const handleRunAudit = () => {
    toast({
      title: "Audit Started",
      description: `A new compliance audit has been initiated for ${dealerName}. You'll be notified when it's complete.`,
    });
  };

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
            <h2 className="text-xl font-semibold text-foreground">{dealerName}</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
              <span>Trading as <span className="font-medium text-foreground">Redline</span></span>
              <span>FCA Ref: <span className="font-medium text-foreground">678901</span></span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRunAudit} className="gap-2">
              <Play className="w-4 h-4" /> Run New Audit
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" /> Download Report
            </Button>
          </div>
        </div>

        {/* Alert Banner */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-rag-amber-bg border border-rag-amber/20">
          <ShieldAlert className="w-5 h-5 text-rag-amber shrink-0" />
          <p className="text-sm font-medium text-rag-amber-text">
            Overall Risk Score: 68 (Amber). Attention Required.
          </p>
        </div>

        {/* Priority Fixes */}
        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Priority Fixes</h3>
          </div>
          <div className="divide-y divide-border">
            {priorityFixes.map((fix, i) => (
              <div key={i} className="px-5 py-3.5 flex items-center justify-between gap-3">
                <span className="text-sm text-foreground">{fix.text}</span>
                <RagBadge status={fix.rag} />
              </div>
            ))}
          </div>
        </div>

        {/* Audit Grid */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Audit Categories</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {auditCategories.map((cat) => (
              <div
                key={cat.name}
                className="bg-card rounded-xl border border-border p-4 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{cat.name}</span>
                  <RagIcon rag={cat.rag} />
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-bold text-foreground">{cat.score}</span>
                  <span className="text-sm text-muted-foreground mb-0.5">/100</span>
                </div>
                {/* Score bar */}
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      cat.rag === "green"
                        ? "bg-rag-green"
                        : cat.rag === "amber"
                        ? "bg-rag-amber"
                        : "bg-rag-red"
                    }`}
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DealerDetail;
