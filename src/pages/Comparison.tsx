import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { dealers, portfolioStats } from "@/data/dealers";
import { generateDealerAudit } from "@/data/auditFramework";
import { ComparisonHeader } from "@/components/comparison/ComparisonHeader";
import { ComparisonKPIs } from "@/components/comparison/ComparisonKPIs";
import { ComparisonRadar } from "@/components/comparison/ComparisonRadar";
import { ComparisonBarChart } from "@/components/comparison/ComparisonBarChart";
import { ComparisonTable } from "@/components/comparison/ComparisonTable";

export type ComparisonMode = "portfolio" | "dealer";

export interface SectionBenchmark {
  id: string;
  name: string;
  shortName: string;
  dealerPassRate: number;
  comparisonPassRate: number;
  difference: number;
}

export interface DealerBenchmarkData {
  dealerName: string;
  dealerScore: number;
  comparisonName: string;
  comparisonScore: number;
  scoreDifference: number;
  dealerRag: "green" | "amber" | "red";
  comparisonRag?: "green" | "amber" | "red";
  sectionBenchmarks: SectionBenchmark[];
  mode: ComparisonMode;
}

function getDealerSectionPassRates(dealerName: string) {
  const dealerIndex = dealers.findIndex((d) => d.name === dealerName);
  if (dealerIndex < 0) return {};
  const audit = generateDealerAudit(dealerName, dealerIndex);
  const rates: Record<string, number> = {};
  audit.sections.forEach((section) => {
    const total = section.summary.green + section.summary.amber + section.summary.red;
    rates[section.id] = total > 0 ? Math.round((section.summary.green / total) * 100) : 0;
  });
  return rates;
}

const Comparison = () => {
  const [mode, setMode] = useState<ComparisonMode>("portfolio");
  const [selectedDealer, setSelectedDealer] = useState<string>(dealers[0]?.name || "");
  const [selectedDealer2, setSelectedDealer2] = useState<string>(dealers[1]?.name || "");

  // Calculate portfolio section averages
  const portfolioSectionAverages = useMemo(() => {
    const sectionData: Record<string, { green: number; total: number }> = {};
    dealers.forEach((dealer, index) => {
      const audit = generateDealerAudit(dealer.name, index);
      audit.sections.forEach((section) => {
        if (!sectionData[section.id]) {
          sectionData[section.id] = { green: 0, total: 0 };
        }
        sectionData[section.id].green += section.summary.green;
        sectionData[section.id].total +=
          section.summary.green + section.summary.amber + section.summary.red;
      });
    });
    return Object.entries(sectionData).reduce((acc, [id, data]) => {
      acc[id] = Math.round((data.green / data.total) * 100);
      return acc;
    }, {} as Record<string, number>);
  }, []);

  const benchmarkData = useMemo((): DealerBenchmarkData | null => {
    const dealer = dealers.find((d) => d.name === selectedDealer);
    if (!dealer) return null;

    const dealerIndex = dealers.findIndex((d) => d.name === selectedDealer);
    const audit = generateDealerAudit(dealer.name, dealerIndex);

    if (mode === "dealer") {
      const dealer2 = dealers.find((d) => d.name === selectedDealer2);
      if (!dealer2 || dealer2.name === dealer.name) return null;

      const dealer2Rates = getDealerSectionPassRates(dealer2.name);

      const sectionBenchmarks: SectionBenchmark[] = audit.sections.map((section) => {
        const total = section.summary.green + section.summary.amber + section.summary.red;
        const dealerPassRate = total > 0 ? Math.round((section.summary.green / total) * 100) : 0;
        const comparisonPassRate = dealer2Rates[section.id] || 0;
        return {
          id: section.id,
          name: section.name,
          shortName: section.name.split(" ")[0],
          dealerPassRate,
          comparisonPassRate,
          difference: dealerPassRate - comparisonPassRate,
        };
      });

      return {
        dealerName: dealer.name,
        dealerScore: dealer.score,
        comparisonName: dealer2.name,
        comparisonScore: dealer2.score,
        scoreDifference: dealer.score - dealer2.score,
        dealerRag: dealer.rag,
        comparisonRag: dealer2.rag,
        sectionBenchmarks,
        mode: "dealer",
      };
    }

    // Portfolio mode
    const sectionBenchmarks: SectionBenchmark[] = audit.sections.map((section) => {
      const total = section.summary.green + section.summary.amber + section.summary.red;
      const dealerPassRate = total > 0 ? Math.round((section.summary.green / total) * 100) : 0;
      const comparisonPassRate = portfolioSectionAverages[section.id] || 0;
      return {
        id: section.id,
        name: section.name,
        shortName: section.name.split(" ")[0],
        dealerPassRate,
        comparisonPassRate,
        difference: dealerPassRate - comparisonPassRate,
      };
    });

    return {
      dealerName: dealer.name,
      dealerScore: dealer.score,
      comparisonName: "Portfolio Avg",
      comparisonScore: portfolioStats.avgScore,
      scoreDifference: dealer.score - portfolioStats.avgScore,
      dealerRag: dealer.rag,
      sectionBenchmarks,
      mode: "portfolio",
    };
  }, [selectedDealer, selectedDealer2, mode, portfolioSectionAverages]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ComparisonHeader
          mode={mode}
          onModeChange={setMode}
          selectedDealer={selectedDealer}
          onDealerChange={setSelectedDealer}
          selectedDealer2={selectedDealer2}
          onDealer2Change={setSelectedDealer2}
          dealers={dealers}
        />

        {benchmarkData && (
          <>
            <ComparisonKPIs data={benchmarkData} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ComparisonRadar data={benchmarkData} />
              <ComparisonBarChart data={benchmarkData} />
            </div>
            <ComparisonTable data={benchmarkData} />
          </>
        )}

        {mode === "dealer" && selectedDealer === selectedDealer2 && (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <p className="text-muted-foreground">Please select two different dealers to compare.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Comparison;
