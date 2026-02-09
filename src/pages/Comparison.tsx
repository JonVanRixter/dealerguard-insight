import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { dealers, portfolioStats } from "@/data/dealers";
import { generateDealerAudit, AUDIT_SECTIONS } from "@/data/auditFramework";
import { ComparisonHeader } from "@/components/comparison/ComparisonHeader";
import { ComparisonKPIs } from "@/components/comparison/ComparisonKPIs";
import { ComparisonRadar } from "@/components/comparison/ComparisonRadar";
import { ComparisonBarChart } from "@/components/comparison/ComparisonBarChart";
import { ComparisonTable } from "@/components/comparison/ComparisonTable";

export interface SectionBenchmark {
  id: string;
  name: string;
  shortName: string;
  dealerPassRate: number;
  portfolioPassRate: number;
  difference: number;
}

export interface DealerBenchmarkData {
  dealerName: string;
  dealerScore: number;
  portfolioAvgScore: number;
  scoreDifference: number;
  dealerRag: "green" | "amber" | "red";
  sectionBenchmarks: SectionBenchmark[];
}

const Comparison = () => {
  const [selectedDealer, setSelectedDealer] = useState<string>(dealers[0]?.name || "");

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

  // Calculate benchmark data for selected dealer
  const benchmarkData = useMemo((): DealerBenchmarkData | null => {
    const dealer = dealers.find((d) => d.name === selectedDealer);
    if (!dealer) return null;

    const dealerIndex = dealers.findIndex((d) => d.name === selectedDealer);
    const audit = generateDealerAudit(dealer.name, dealerIndex);

    const sectionBenchmarks: SectionBenchmark[] = audit.sections.map((section) => {
      const totalControls =
        section.summary.green + section.summary.amber + section.summary.red;
      const dealerPassRate =
        totalControls > 0 ? Math.round((section.summary.green / totalControls) * 100) : 0;
      const portfolioPassRate = portfolioSectionAverages[section.id] || 0;

      return {
        id: section.id,
        name: section.name,
        shortName: section.name.split(" ")[0],
        dealerPassRate,
        portfolioPassRate,
        difference: dealerPassRate - portfolioPassRate,
      };
    });

    return {
      dealerName: dealer.name,
      dealerScore: dealer.score,
      portfolioAvgScore: portfolioStats.avgScore,
      scoreDifference: dealer.score - portfolioStats.avgScore,
      dealerRag: dealer.rag,
      sectionBenchmarks,
    };
  }, [selectedDealer, portfolioSectionAverages]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ComparisonHeader
          selectedDealer={selectedDealer}
          onDealerChange={setSelectedDealer}
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
      </div>
    </DashboardLayout>
  );
};

export default Comparison;
