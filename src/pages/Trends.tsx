import { DashboardLayout } from "@/components/DashboardLayout";
import { portfolioTrend, dealerTrends, topImprovers, topDecliners } from "@/data/trendData";
import { TrendKPIs } from "@/components/trends/TrendKPIs";
import { PortfolioTrendChart } from "@/components/trends/PortfolioTrendChart";
import { RagDistributionChart } from "@/components/trends/RagDistributionChart";
import { DealerTrendChart } from "@/components/trends/DealerTrendChart";
import { MoversTable } from "@/components/trends/MoversTable";
import { TrendingUp } from "lucide-react";

const Trends = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Trend Analysis</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track dealer and portfolio performance changes over the past 12 months.
          </p>
        </div>

        {/* KPIs */}
        <TrendKPIs />

        {/* Portfolio charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PortfolioTrendChart data={portfolioTrend} />
          <RagDistributionChart data={portfolioTrend} />
        </div>

        {/* Individual dealer overlay */}
        <DealerTrendChart trends={dealerTrends} />

        {/* Movers */}
        <MoversTable improvers={topImprovers} decliners={topDecliners} />
      </div>
    </DashboardLayout>
  );
};

export default Trends;
