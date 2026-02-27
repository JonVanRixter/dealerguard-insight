import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Save, Sun, Moon, Monitor } from "lucide-react";
import type { UserSettings } from "@/hooks/useUserSettings";

interface DisplaySettingsProps {
  settings: UserSettings;
  onSave: (updates: Partial<UserSettings>) => Promise<void>;
  saving: boolean;
}

export function DisplaySettings({ settings, onSave, saving }: DisplaySettingsProps) {
  const [local, setLocal] = useState({
    theme: settings.theme,
    compact_mode: settings.compact_mode,
    animations: settings.animations,
  });

  const handleSave = () => {
    onSave(local);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Theme</h3>
        <RadioGroup
          value={local.theme}
          onValueChange={(v) => setLocal({ ...local, theme: v })}
          className="grid grid-cols-3 gap-4"
        >
          {[
            { value: "light", label: "Light", icon: <Sun className="w-6 h-6 text-outcome-pending" /> },
            { value: "dark", label: "Dark", icon: <Moon className="w-6 h-6 text-primary" /> },
            { value: "system", label: "System", icon: <Monitor className="w-6 h-6 text-muted-foreground" /> },
          ].map((opt) => (
            <Label
              key={opt.value}
              htmlFor={`theme-${opt.value}`}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                local.theme === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
              }`}
            >
              <RadioGroupItem value={opt.value} id={`theme-${opt.value}`} className="sr-only" />
              {opt.icon}
              <span className="text-sm font-medium">{opt.label}</span>
            </Label>
          ))}
        </RadioGroup>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Layout Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Compact Mode</Label>
              <p className="text-xs text-muted-foreground">Reduce spacing for a more dense layout</p>
            </div>
            <Switch checked={local.compact_mode} onCheckedChange={(v) => setLocal({ ...local, compact_mode: v })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Animations</Label>
              <p className="text-xs text-muted-foreground">Animate charts and transitions</p>
            </div>
            <Switch checked={local.animations} onCheckedChange={(v) => setLocal({ ...local, animations: v })} />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="w-4 h-4" />
          {saving ? "Saving…" : "Save Display Settings"}
        </Button>
      </div>
    </div>
  );
}
