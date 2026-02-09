import { DashboardLayout } from "@/components/DashboardLayout";
import { portfolioTrend, dealerTrends, topImprovers, topDecliners } from "@/data/trendData";
import { TrendKPIs } from "@/components/trends/TrendKPIs";
import { PortfolioTrendChart } from "@/components/trends/PortfolioTrendChart";
import { RagDistributionChart } from "@/components/trends/RagDistributionChart";
import { DealerTrendChart } from "@/components/trends/DealerTrendChart";
import { MoversTable } from "@/components/trends/MoversTable";
import { TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateTrendPDF } from "@/utils/trendPdfExport";

const Trends = () => {
  const handleExport = () => {
    generateTrendPDF({ portfolioTrend, topImprovers, topDecliners });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Trend Analysis</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Track dealer and portfolio performance changes over the past 12 months.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Export PDF
          </Button>
        </div>

        <TrendKPIs />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PortfolioTrendChart data={portfolioTrend} />
          <RagDistributionChart data={portfolioTrend} />
        </div>

        <DealerTrendChart trends={dealerTrends} />

        <MoversTable improvers={topImprovers} decliners={topDecliners} />
      </div>
    </DashboardLayout>
  );
};

export default Trends;
