import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Save, TrendingDown, AlertTriangle, ShieldAlert, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { dealers } from "@/data/dealers";
import type { UserSettings } from "@/hooks/useUserSettings";

interface AlertThresholdsProps {
  settings: UserSettings;
  onSave: (updates: Partial<UserSettings>) => Promise<void>;
  saving: boolean;
}

export function AlertThresholds({ settings, onSave, saving }: AlertThresholdsProps) {
  const { toast } = useToast();
  const [local, setLocal] = useState({
    amber_threshold: settings.amber_threshold,
    green_threshold: settings.green_threshold,
    score_drop_trigger: settings.score_drop_trigger,
    overdue_actions_trigger: settings.overdue_actions_trigger,
    css_oversight_threshold: settings.css_oversight_threshold,
    css_reward_threshold: settings.css_reward_threshold,
  });

  const handleSave = async () => {
    // Check which dealers change RAG status with new thresholds
    const getRag = (score: number, amber: number, green: number) => {
      if (score < amber) return "red";
      if (score < green) return "amber";
      return "green";
    };

    const affectedDealers = dealers.filter((d) => {
      const oldRag = getRag(d.score, settings.amber_threshold, settings.green_threshold);
      const newRag = getRag(d.score, local.amber_threshold, local.green_threshold);
      return newRag !== oldRag && (newRag === "red" || newRag === "amber");
    });

    await onSave(local);

    if (affectedDealers.length > 0) {
      toast({
        title: "Thresholds Updated",
        description: `${affectedDealers.length} dealer${affectedDealers.length > 1 ? "s" : ""} now require${affectedDealers.length === 1 ? "s" : ""} attention based on updated risk appetite.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Thresholds Saved",
        description: "No dealers affected by this change.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* RAG Status Thresholds */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-foreground mb-1">RAG Status Thresholds</h3>
        <p className="text-xs text-muted-foreground mb-6">Define the score boundaries for Red, Amber, and Green</p>

        <div className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rag-red" />
                <Label>Red (Critical) Threshold</Label>
              </div>
              <span className="text-sm font-semibold text-foreground">Below {local.amber_threshold}%</span>
            </div>
            <Slider value={[local.amber_threshold]} onValueChange={([v]) => setLocal({ ...local, amber_threshold: v })} min={30} max={70} step={5} />
            <p className="text-xs text-muted-foreground">Dealers scoring below this will be flagged Critical</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rag-amber" />
                <Label>Amber (Warning) Threshold</Label>
              </div>
              <span className="text-sm font-semibold text-foreground">{local.amber_threshold}% - {local.green_threshold}%</span>
            </div>
            <Slider value={[local.green_threshold]} onValueChange={([v]) => setLocal({ ...local, green_threshold: v })} min={60} max={95} step={5} />
            <p className="text-xs text-muted-foreground">Dealers between Red and this threshold flagged as Warning</p>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Preview</p>
            <div className="flex h-6 rounded-lg overflow-hidden">
              <div className="bg-rag-red flex items-center justify-center text-[10px] font-medium text-white" style={{ width: `${local.amber_threshold}%` }}>
                Red: 0-{local.amber_threshold - 1}
              </div>
              <div className="bg-rag-amber flex items-center justify-center text-[10px] font-medium text-white" style={{ width: `${local.green_threshold - local.amber_threshold}%` }}>
                Amber: {local.amber_threshold}-{local.green_threshold - 1}
              </div>
              <div className="bg-rag-green flex items-center justify-center text-[10px] font-medium text-white" style={{ width: `${100 - local.green_threshold}%` }}>
                Green: {local.green_threshold}-100
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Trigger Thresholds */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-foreground mb-1">Customer Sentiment Score (CSS) Triggers</h3>
        <p className="text-xs text-muted-foreground mb-6">Set thresholds to flag dealers for enhanced oversight or positive rewards based on their CSS score (0–10)</p>
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rag-red" />
                <Label>Enhanced Oversight Trigger</Label>
              </div>
              <span className="text-sm font-semibold text-foreground">Below {local.css_oversight_threshold.toFixed(1)}</span>
            </div>
            <Slider
              value={[local.css_oversight_threshold * 10]}
              onValueChange={([v]) => setLocal({ ...local, css_oversight_threshold: Math.min(v / 10, local.css_reward_threshold - 0.1) })}
              min={10}
              max={60}
              step={1}
            />
            <p className="text-xs text-muted-foreground">Dealers with a CSS below this will be flagged for enhanced oversight</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-accent" />
                <Label>Positive Reward Trigger</Label>
              </div>
              <span className="text-sm font-semibold text-foreground">Above {local.css_reward_threshold.toFixed(1)}</span>
            </div>
            <Slider
              value={[local.css_reward_threshold * 10]}
              onValueChange={([v]) => setLocal({ ...local, css_reward_threshold: Math.max(v / 10, local.css_oversight_threshold + 0.1) })}
              min={50}
              max={100}
              step={1}
            />
            <p className="text-xs text-muted-foreground">Dealers with a CSS above this qualify for positive rewards</p>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">CSS Scale Preview</p>
            <div className="flex h-6 rounded-lg overflow-hidden">
              <div
                className="bg-rag-red/80 flex items-center justify-center text-[10px] font-medium text-white"
                style={{ width: `${(local.css_oversight_threshold / 10) * 100}%` }}
              >
                Oversight
              </div>
              <div
                className="bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground"
                style={{ width: `${((local.css_reward_threshold - local.css_oversight_threshold) / 10) * 100}%` }}
              >
                Standard
              </div>
              <div
                className="bg-accent flex items-center justify-center text-[10px] font-medium text-accent-foreground"
                style={{ width: `${((10 - local.css_reward_threshold) / 10) * 100}%` }}
              >
                Reward
              </div>
            </div>
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
                <TrendingDown className="w-4 h-4 text-rag-red" />
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
                <AlertTriangle className="w-4 h-4 text-rag-amber" />
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
          {saving ? "Saving…" : "Save Thresholds"}
        </Button>
      </div>
    </div>
  );
}
