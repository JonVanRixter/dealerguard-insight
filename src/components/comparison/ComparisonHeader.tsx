import { Dealer } from "@/data/dealers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GitCompare } from "lucide-react";

interface ComparisonHeaderProps {
  selectedDealer: string;
  onDealerChange: (dealer: string) => void;
  dealers: Dealer[];
}

export function ComparisonHeader({
  selectedDealer,
  onDealerChange,
  dealers,
}: ComparisonHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Dealer Comparison</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Benchmark individual dealer performance against portfolio averages.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <GitCompare className="w-4 h-4 text-muted-foreground" />
        <Select value={selectedDealer} onValueChange={onDealerChange}>
          <SelectTrigger className="w-full sm:w-64 h-9 bg-background">
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
    </div>
  );
}
