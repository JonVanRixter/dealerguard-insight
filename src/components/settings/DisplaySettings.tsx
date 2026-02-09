import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save, Sun, Moon, Monitor } from "lucide-react";

export function DisplaySettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    theme: "system",
    compactMode: false,
    showScoreLabels: true,
    defaultDealerView: "grid",
    itemsPerPage: "25",
    animationsEnabled: true,
  });

  const handleSave = () => {
    toast({
      title: "Display Settings Saved",
      description: "Your display preferences have been updated.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Theme</h3>
        <RadioGroup
          value={settings.theme}
          onValueChange={(v) => setSettings({ ...settings, theme: v })}
          className="grid grid-cols-3 gap-4"
        >
          <Label
            htmlFor="theme-light"
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              settings.theme === "light"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground"
            }`}
          >
            <RadioGroupItem value="light" id="theme-light" className="sr-only" />
            <Sun className="w-6 h-6 text-rag-amber" />
            <span className="text-sm font-medium">Light</span>
          </Label>
          <Label
            htmlFor="theme-dark"
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              settings.theme === "dark"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground"
            }`}
          >
            <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
            <Moon className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium">Dark</span>
          </Label>
          <Label
            htmlFor="theme-system"
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              settings.theme === "system"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground"
            }`}
          >
            <RadioGroupItem value="system" id="theme-system" className="sr-only" />
            <Monitor className="w-6 h-6 text-muted-foreground" />
            <span className="text-sm font-medium">System</span>
          </Label>
        </RadioGroup>
      </div>

      {/* Layout Settings */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Layout Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="compact">Compact Mode</Label>
              <p className="text-xs text-muted-foreground">
                Reduce spacing for a more dense layout
              </p>
            </div>
            <Switch
              id="compact"
              checked={settings.compactMode}
              onCheckedChange={(v) => setSettings({ ...settings, compactMode: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="labels">Show Score Labels</Label>
              <p className="text-xs text-muted-foreground">
                Display percentage labels on charts
              </p>
            </div>
            <Switch
              id="labels"
              checked={settings.showScoreLabels}
              onCheckedChange={(v) => setSettings({ ...settings, showScoreLabels: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="animations">Enable Animations</Label>
              <p className="text-xs text-muted-foreground">
                Animate charts and transitions
              </p>
            </div>
            <Switch
              id="animations"
              checked={settings.animationsEnabled}
              onCheckedChange={(v) => setSettings({ ...settings, animationsEnabled: v })}
            />
          </div>
        </div>
      </div>

      {/* Default Views */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Default Views</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Default Dealer View</Label>
            <Select
              value={settings.defaultDealerView}
              onValueChange={(v) => setSettings({ ...settings, defaultDealerView: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid View</SelectItem>
                <SelectItem value="table">Table View</SelectItem>
                <SelectItem value="compact">Compact List</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Items Per Page</Label>
            <Select
              value={settings.itemsPerPage}
              onValueChange={(v) => setSettings({ ...settings, itemsPerPage: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 items</SelectItem>
                <SelectItem value="25">25 items</SelectItem>
                <SelectItem value="50">50 items</SelectItem>
                <SelectItem value="100">100 items</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Save Display Settings
        </Button>
      </div>
    </div>
  );
}
