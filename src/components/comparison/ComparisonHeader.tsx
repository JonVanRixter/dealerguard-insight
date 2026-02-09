import { Dealer } from "@/data/dealers";
import { ComparisonMode } from "@/pages/Comparison";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GitCompare, Users, BarChart3, Download } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

interface ComparisonHeaderProps {
  mode: ComparisonMode;
  onModeChange: (mode: ComparisonMode) => void;
  selectedDealer: string;
  onDealerChange: (dealer: string) => void;
  selectedDealer2: string;
  onDealer2Change: (dealer: string) => void;
  dealers: Dealer[];
  onExportPDF?: () => void;
  canExport?: boolean;
}

function DealerSelect({
  value,
  onChange,
  dealers,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  dealers: Dealer[];
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground whitespace-nowrap">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full sm:w-56 h-9 bg-background">
          <SelectValue placeholder="Select a dealer" />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          {dealers.map((dealer) => (
            <SelectItem key={dealer.name} value={dealer.name}>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    dealer.rag === "green"
                      ? "bg-rag-green"
                      : dealer.rag === "amber"
                      ? "bg-rag-amber"
                      : "bg-rag-red"
                  }`}
                />
                {dealer.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ComparisonHeader({
  mode,
  onModeChange,
  selectedDealer,
  onDealerChange,
  selectedDealer2,
  onDealer2Change,
  dealers,
  onExportPDF,
  canExport,
}: ComparisonHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Dealer Comparison</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {mode === "portfolio"
              ? "Benchmark dealer performance against portfolio averages."
              : "Compare two dealers side by side."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={mode} onValueChange={(v) => onModeChange(v as ComparisonMode)}>
            <TabsList>
              <TabsTrigger value="portfolio" className="gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                vs Portfolio
              </TabsTrigger>
              <TabsTrigger value="dealer" className="gap-1.5">
                <Users className="w-3.5 h-3.5" />
                vs Dealer
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {canExport && (
            <Button variant="outline" size="sm" onClick={onExportPDF} className="gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Export PDF
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <DealerSelect
          value={selectedDealer}
          onChange={onDealerChange}
          dealers={dealers}
          label={mode === "dealer" ? "Dealer A:" : "Dealer:"}
        />
        {mode === "dealer" && (
          <>
            <GitCompare className="w-4 h-4 text-muted-foreground hidden sm:block" />
            <DealerSelect
              value={selectedDealer2}
              onChange={onDealer2Change}
              dealers={dealers}
              label="Dealer B:"
            />
          </>
        )}
      </div>
    </div>
  );
}
