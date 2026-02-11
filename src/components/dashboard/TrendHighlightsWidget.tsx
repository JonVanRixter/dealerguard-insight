import { TrendingUp, TrendingDown, AlertTriangle, Sparkles } from "lucide-react";
import { topImprovers, topDecliners, portfolioTrend } from "@/data/trendData";
import { RagBadge } from "@/components/RagBadge";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

const navigateToDealer = (navigate: ReturnType<typeof useNavigate>, name: string) =>
  navigate(`/dealer/${encodeURIComponent(name)}`);

export function TrendHighlightsWidget() {
  const navigate = useNavigate();
  const latest = portfolioTrend[portfolioTrend.length - 1];
  const previous = portfolioTrend[portfolioTrend.length - 2];
  const scoreDelta = latest.avgScore - previous.avgScore;

  const topGainer = topImprovers[0];
  const topDecliner = topDecliners[0];

  // Alerts: dealers that recently moved to red
  const redAlerts = topDecliners.filter((d) => d.currentRag === "red").slice(0, 3);

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Trend Highlights
        </h3>
        <button
          onClick={() => navigate("/trends")}
          className="text-xs text-primary hover:underline"
        >
          View all →
        </button>
      </div>

      <div className="divide-y divide-border">
        {/* Sparkline + Portfolio momentum */}
        <div className="px-5 py-3.5">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-1.5 rounded-md ${scoreDelta >= 0 ? "bg-rag-green-bg" : "bg-rag-red-bg"}`}>
              {scoreDelta >= 0 ? (
                <TrendingUp className="w-4 h-4 text-rag-green" />
              ) : (
                <TrendingDown className="w-4 h-4 text-rag-red" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-foreground leading-snug">
                Portfolio avg {scoreDelta >= 0 ? "up" : "down"}{" "}
                <span className="font-semibold">{Math.abs(scoreDelta)}pts</span> this month
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {latest.avgScore}% avg score · {latest.greenCount} green, {latest.redCount} red
              </p>
            </div>
          </div>
          <div className="h-16 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portfolioTrend}>
                <defs>
                  <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="avgScore"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#sparklineGradient)"
                  dot={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
                          <p className="font-medium text-foreground">{d.month}</p>
                          <p className="text-muted-foreground">Avg: {d.avgScore}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top improver */}
        <div onClick={() => navigateToDealer(navigate, topGainer.dealerName)} className="px-5 py-3.5 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="p-1.5 rounded-md bg-rag-green-bg">
            <TrendingUp className="w-4 h-4 text-rag-green" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-foreground leading-snug">
              <span className="font-semibold">{topGainer.dealerName}</span> — compliance leader
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              +{topGainer.changeFromStart}pts over 12 months
            </p>
          </div>
          <RagBadge status={topGainer.currentRag} size="sm" />
        </div>

        {/* Top decliner */}
        <div onClick={() => navigateToDealer(navigate, topDecliner.dealerName)} className="px-5 py-3.5 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="p-1.5 rounded-md bg-rag-red-bg">
            <TrendingDown className="w-4 h-4 text-rag-red" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-foreground leading-snug">
              <span className="font-semibold">{topDecliner.dealerName}</span> — requires attention
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {topDecliner.changeFromStart}pts over 12 months
            </p>
          </div>
          <RagBadge status={topDecliner.currentRag} size="sm" />
        </div>

        {/* Red alerts */}
        {redAlerts.map((dealer, i) => (
          <div key={i} onClick={() => navigateToDealer(navigate, dealer.dealerName)} className="px-5 py-3.5 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="p-1.5 rounded-md bg-rag-red-bg">
              <AlertTriangle className="w-4 h-4 text-rag-red" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground leading-snug">
                <span className="font-semibold">{dealer.dealerName}</span> now critical
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Score: {dealer.currentScore} · {dealer.changeFromStart}pts change
              </p>
            </div>
            <RagBadge status="red" size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}
