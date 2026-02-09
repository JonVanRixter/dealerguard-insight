import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save, AlertTriangle, TrendingDown, Clock } from "lucide-react";

export function AlertThresholds() {
  const { toast } = useToast();
  const [thresholds, setThresholds] = useState({
    redThreshold: 55,
    amberThreshold: 80,
    scoreDropAlert: 10,
    auditDueDays: 30,
    actionOverdueDays: 7,
  });

  const handleSave = () => {
    toast({
      title: "Thresholds Updated",
      description: "Alert thresholds have been saved.",
    });
  };

  return (
    <div className="space-y-6">
      {/* RAG Thresholds */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-foreground mb-1">RAG Status Thresholds</h3>
        <p className="text-xs text-muted-foreground mb-6">
          Define the score boundaries for Red, Amber, and Green status classifications
        </p>

        <div className="space-y-8">
          {/* Red Threshold */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rag-red" />
                <Label>Red (Critical) Threshold</Label>
              </div>
              <span className="text-sm font-semibold text-foreground">
                Below {thresholds.redThreshold}%
              </span>
            </div>
            <Slider
              value={[thresholds.redThreshold]}
              onValueChange={([v]) => setThresholds({ ...thresholds, redThreshold: v })}
              min={30}
              max={70}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Dealers scoring below this threshold will be flagged as Critical
            </p>
          </div>

          {/* Amber Threshold */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rag-amber" />
                <Label>Amber (Warning) Threshold</Label>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {thresholds.redThreshold}% - {thresholds.amberThreshold}%
              </span>
            </div>
            <Slider
              value={[thresholds.amberThreshold]}
              onValueChange={([v]) => setThresholds({ ...thresholds, amberThreshold: v })}
              min={60}
              max={95}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Dealers scoring between Red and this threshold will be flagged as Warning
            </p>
          </div>

          {/* Visual representation */}
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Preview</p>
            <div className="flex h-6 rounded-lg overflow-hidden">
              <div
                className="bg-rag-red flex items-center justify-center text-[10px] font-medium text-white"
                style={{ width: `${thresholds.redThreshold}%` }}
              >
                Red: 0-{thresholds.redThreshold - 1}
              </div>
              <div
                className="bg-rag-amber flex items-center justify-center text-[10px] font-medium text-white"
                style={{ width: `${thresholds.amberThreshold - thresholds.redThreshold}%` }}
              >
                Amber: {thresholds.redThreshold}-{thresholds.amberThreshold - 1}
              </div>
              <div
                className="bg-rag-green flex items-center justify-center text-[10px] font-medium text-white"
                style={{ width: `${100 - thresholds.amberThreshold}%` }}
              >
                Green: {thresholds.amberThreshold}-100
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Triggers */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-foreground mb-1">Alert Triggers</h3>
        <p className="text-xs text-muted-foreground mb-6">
          Configure when alerts should be triggered
        </p>

        <div className="space-y-6">
          {/* Score Drop Alert */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-4 h-4 text-rag-red" />
                <Label>Score Drop Alert</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Alert when a dealer's score drops by this many points
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Slider
                value={[thresholds.scoreDropAlert]}
                onValueChange={([v]) => setThresholds({ ...thresholds, scoreDropAlert: v })}
                min={5}
                max={25}
                step={5}
                className="w-32"
              />
              <span className="text-sm font-semibold text-foreground w-16 text-right">
                {thresholds.scoreDropAlert} pts
              </span>
            </div>
          </div>

          {/* Audit Due Reminder */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <Label>Audit Due Reminder</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Days before audit due date to send reminder
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Slider
                value={[thresholds.auditDueDays]}
                onValueChange={([v]) => setThresholds({ ...thresholds, auditDueDays: v })}
                min={7}
                max={60}
                step={7}
                className="w-32"
              />
              <span className="text-sm font-semibold text-foreground w-16 text-right">
                {thresholds.auditDueDays} days
              </span>
            </div>
          </div>

          {/* Action Overdue */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-rag-amber" />
                <Label>Action Overdue Alert</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Days after action due date to escalate
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Slider
                value={[thresholds.actionOverdueDays]}
                onValueChange={([v]) => setThresholds({ ...thresholds, actionOverdueDays: v })}
                min={1}
                max={14}
                step={1}
                className="w-32"
              />
              <span className="text-sm font-semibold text-foreground w-16 text-right">
                {thresholds.actionOverdueDays} days
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Save Thresholds
        </Button>
      </div>
    </div>
  );
}
