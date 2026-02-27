import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Save, TrendingDown, AlertTriangle, Scale } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserSettings } from "@/hooks/useUserSettings";

const defaultWeights = [
  { section: "Governance & Oversight", weight: 15 },
  { section: "Consumer Duty", weight: 15 },
  { section: "Financial Promotions", weight: 12.5 },
  { section: "Data Protection & Privacy", weight: 12.5 },
  { section: "Anti-Money Laundering", weight: 12.5 },
  { section: "Complaints Handling", weight: 10 },
  { section: "Insurance Distribution", weight: 10 },
  { section: "Staff Training & Competence", weight: 12.5 },
];

interface AlertThresholdsProps {
  settings: UserSettings;
  onSave: (updates: Partial<UserSettings>) => Promise<void>;
  saving: boolean;
}

export function AlertThresholds({ settings, onSave, saving }: AlertThresholdsProps) {
  const { toast } = useToast();
  const [local, setLocal] = useState({
    score_drop_trigger: settings.score_drop_trigger,
    overdue_actions_trigger: settings.overdue_actions_trigger,
  });
  const [weights, setWeights] = useState(defaultWeights);

  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  const isWeightValid = Math.abs(totalWeight - 100) < 0.01;

  const updateWeight = (index: number, value: string) => {
    const num = parseFloat(value) || 0;
    setWeights((prev) => prev.map((w, i) => (i === index ? { ...w, weight: num } : w)));
  };

  const handleSave = async () => {
    if (!isWeightValid) {
      toast({ title: "Weights must sum to 100%", variant: "destructive" });
      return;
    }
    await onSave(local);
    toast({ title: "Settings Saved", description: "Alert triggers and score weightings updated." });
  };

  return (
    <div className="space-y-6">
      {/* Audit Score Weighting */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-1">
          <Scale className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Audit Score Weighting</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-6">
          These weightings determine how each compliance section contributes to the overall audit score (0–100). Lenders apply their own thresholds to this score independently.
        </p>

        <div className="space-y-3">
          {weights.map((w, i) => (
            <div key={w.section} className="flex items-center gap-3">
              <span className="flex-1 text-sm text-foreground">{w.section}</span>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={w.weight}
                  onChange={(e) => updateWeight(i, e.target.value)}
                  className="w-20 h-8 text-sm text-right"
                />
                <span className="text-xs text-muted-foreground w-4">%</span>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <span className="text-sm font-medium text-muted-foreground">Total:</span>
            <span className={`text-sm font-bold ${isWeightValid ? "text-foreground" : "text-destructive"}`}>
              {totalWeight.toFixed(1)}%
            </span>
            {!isWeightValid && (
              <span className="text-xs text-destructive ml-1">Must equal 100%</span>
            )}
          </div>
        </div>
      </div>

      {/* Alert Triggers */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-foreground mb-1">Alert Triggers</h3>
        <p className="text-xs text-muted-foreground mb-6">Configure when alerts should be triggered</p>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-4 h-4 text-destructive" />
                <Label>Score Drop Alert</Label>
              </div>
              <p className="text-xs text-muted-foreground">Alert when score drops by this many points</p>
            </div>
            <div className="flex items-center gap-3">
              <Slider value={[local.score_drop_trigger]} onValueChange={([v]) => setLocal({ ...local, score_drop_trigger: v })} min={5} max={25} step={5} className="w-32" />
              <span className="text-sm font-semibold text-foreground w-16 text-right">{local.score_drop_trigger} pts</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                <Label>Overdue Actions Trigger</Label>
              </div>
              <p className="text-xs text-muted-foreground">Number of overdue actions before escalation</p>
            </div>
            <div className="flex items-center gap-3">
              <Slider value={[local.overdue_actions_trigger]} onValueChange={([v]) => setLocal({ ...local, overdue_actions_trigger: v })} min={1} max={10} step={1} className="w-32" />
              <span className="text-sm font-semibold text-foreground w-16 text-right">{local.overdue_actions_trigger}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="w-4 h-4" />
          {saving ? "Saving…" : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
