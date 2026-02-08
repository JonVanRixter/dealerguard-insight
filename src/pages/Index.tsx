import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { RagBadge } from "@/components/RagBadge";
import {
  TrendingDown,
  TrendingUp,
  Minus,
  AlertTriangle,
  Activity,
  ShieldCheck,
  Clock,
} from "lucide-react";

const dealers = [
  { name: "Redline Specialist Cars", score: 68, rag: "amber" as const, lastAudit: "12 Jan 2026", trend: "down" },
  { name: "Stratstone BMW", score: 92, rag: "green" as const, lastAudit: "28 Jan 2026", trend: "stable" },
  { name: "Apex Motors", score: 45, rag: "red" as const, lastAudit: "05 Dec 2025", trend: "down" },
  { name: "Arnold Clark", score: 88, rag: "green" as const, lastAudit: "20 Jan 2026", trend: "up" },
  { name: "Sytner Group", score: 91, rag: "green" as const, lastAudit: "18 Jan 2026", trend: "stable" },
  { name: "Lookers Mercedes", score: 76, rag: "amber" as const, lastAudit: "10 Jan 2026", trend: "up" },
];

const activities = [
  { text: "Redline Specialist Cars dropped to Amber", time: "2 hours ago", type: "amber" as const },
  { text: "Apex Motors flagged as Critical", time: "5 hours ago", type: "red" as const },
  { text: "Arnold Clark completed annual audit", time: "1 day ago", type: "green" as const },
  { text: "Stratstone BMW renewed FCA authorisation", time: "2 days ago", type: "green" as const },
  { text: "New DBS check alert for Lookers Mercedes", time: "3 days ago", type: "amber" as const },
];

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === "up") return <TrendingUp className="w-4 h-4 text-rag-green" />;
  if (trend === "down") return <TrendingDown className="w-4 h-4 text-rag-red" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
};

const Index = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page title */}
        <div>
          <h2 className="text-xl font-semibold text-foreground">Portfolio Overview</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Monitor compliance risk across your dealer network.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Portfolio Health */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
              <ShieldCheck className="w-4 h-4" />
              Portfolio Health
            </div>
            <div className="flex items-end gap-3 mb-3">
              <span className="text-2xl font-bold text-foreground">142</span>
              <span className="text-sm text-muted-foreground mb-0.5">dealers</span>
            </div>
            {/* Distribution bar */}
            <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">
              <div className="bg-rag-green rounded-l-full" style={{ width: `${(98 / 142) * 100}%` }} />
              <div className="bg-rag-amber" style={{ width: `${(35 / 142) * 100}%` }} />
              <div className="bg-rag-red rounded-r-full" style={{ width: `${(9 / 142) * 100}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rag-green inline-block" /> 98 Safe</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rag-amber inline-block" /> 35 Warning</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rag-red inline-block" /> 9 Critical</span>
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
              <AlertTriangle className="w-4 h-4" />
              Critical Alerts
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-rag-red">9</span>
              <span className="text-sm text-muted-foreground mb-1">dealers require attention</span>
            </div>
          </div>

          {/* Avg Risk Score */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
              <Activity className="w-4 h-4" />
              Avg Risk Score
            </div>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-bold text-foreground">78</span>
              <span className="text-lg text-muted-foreground mb-0.5">/100</span>
            </div>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dealer Watchlist */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-border">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Dealer Watchlist</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left px-5 py-3 font-medium">Dealer Name</th>
                    <th className="text-left px-3 py-3 font-medium">Score</th>
                    <th className="text-left px-3 py-3 font-medium">Status</th>
                    <th className="text-left px-3 py-3 font-medium hidden sm:table-cell">Last Audit</th>
                    <th className="text-center px-3 py-3 font-medium">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {dealers.map((dealer) => (
                    <tr
                      key={dealer.name}
                      onClick={() => navigate(`/dealer/${encodeURIComponent(dealer.name)}`)}
                      className="border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5 font-medium text-foreground">{dealer.name}</td>
                      <td className="px-3 py-3.5 text-foreground font-semibold">{dealer.score}</td>
                      <td className="px-3 py-3.5"><RagBadge status={dealer.rag} /></td>
                      <td className="px-3 py-3.5 text-muted-foreground hidden sm:table-cell">{dealer.lastAudit}</td>
                      <td className="px-3 py-3.5 text-center"><TrendIcon trend={dealer.trend} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card rounded-xl border border-border">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
            </div>
            <div className="divide-y divide-border">
              {activities.map((activity, i) => (
                <div key={i} className="px-5 py-3.5 flex gap-3">
                  <div className="mt-0.5">
                    <span
                      className={`block w-2 h-2 rounded-full ${
                        activity.type === "green"
                          ? "bg-rag-green"
                          : activity.type === "amber"
                          ? "bg-rag-amber"
                          : "bg-rag-red"
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-foreground leading-snug">{activity.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
