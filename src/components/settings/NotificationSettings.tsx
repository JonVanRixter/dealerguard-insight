import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Save, Bell, Mail, MessageSquare, AlertTriangle } from "lucide-react";
import type { UserSettings } from "@/hooks/useUserSettings";

interface NotificationSettingsProps {
  settings: UserSettings;
  onSave: (updates: Partial<UserSettings>) => Promise<void>;
  saving: boolean;
}

interface NotifRow {
  key: string;
  label: string;
  description: string;
  emailKey: keyof UserSettings;
  inappKey: keyof UserSettings;
  icon: React.ReactNode;
}

const ROWS: NotifRow[] = [
  { key: "critical", label: "Critical Alerts (Red RAG)", description: "Immediate notification when a dealer moves to critical status", emailKey: "email_critical", inappKey: "inapp_critical", icon: <AlertTriangle className="w-4 h-4 text-rag-red" /> },
  { key: "warning", label: "Warning Alerts (Amber RAG)", description: "Notification when a dealer drops to warning status", emailKey: "email_warning", inappKey: "inapp_warning", icon: <AlertTriangle className="w-4 h-4 text-rag-amber" /> },
  { key: "audit", label: "Audit Due Reminders", description: "Reminder before dealer audits are due", emailKey: "email_audit_reminders", inappKey: "inapp_audit_reminders", icon: <Bell className="w-4 h-4 text-muted-foreground" /> },
  { key: "summary", label: "Weekly Portfolio Summary", description: "Weekly digest of portfolio compliance status", emailKey: "email_weekly_summary", inappKey: "inapp_weekly_summary", icon: <Mail className="w-4 h-4 text-muted-foreground" /> },
];

export function NotificationSettings({ settings, onSave, saving }: NotificationSettingsProps) {
  const [local, setLocal] = useState({ ...settings });

  const toggle = (key: keyof UserSettings) => {
    setLocal((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    onSave({
      email_critical: local.email_critical,
      email_warning: local.email_warning,
      email_audit_reminders: local.email_audit_reminders,
      email_weekly_summary: local.email_weekly_summary,
      inapp_critical: local.inapp_critical,
      inapp_warning: local.inapp_warning,
      inapp_audit_reminders: local.inapp_audit_reminders,
      inapp_weekly_summary: local.inapp_weekly_summary,
      digest_frequency: local.digest_frequency,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Digest Settings</h3>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <Label>Email Digest Frequency</Label>
            <p className="text-xs text-muted-foreground mt-0.5">How often to receive a summary of all alerts</p>
          </div>
          <Select value={local.digest_frequency} onValueChange={(v) => setLocal({ ...local, digest_frequency: v })}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="realtime">Real-time</SelectItem>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="never">Never</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Notification Preferences</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Choose how you want to be notified</p>
        </div>
        <div className="divide-y divide-border">
          <div className="px-6 py-3 bg-muted/30 flex items-center text-xs font-medium text-muted-foreground">
            <div className="flex-1">Event Type</div>
            <div className="w-20 text-center">Email</div>
            <div className="w-20 text-center">In-App</div>
          </div>
          {ROWS.map((row) => (
            <div key={row.key} className="px-6 py-4 flex items-center hover:bg-muted/20 transition-colors">
              <div className="flex-1 flex items-start gap-3">
                <div className="mt-0.5">{row.icon}</div>
                <div>
                  <p className="text-sm font-medium text-foreground">{row.label}</p>
                  <p className="text-xs text-muted-foreground">{row.description}</p>
                </div>
              </div>
              <div className="w-20 flex justify-center">
                <Switch checked={local[row.emailKey] as boolean} onCheckedChange={() => toggle(row.emailKey)} />
              </div>
              <div className="w-20 flex justify-center">
                <Switch checked={local[row.inappKey] as boolean} onCheckedChange={() => toggle(row.inappKey)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="w-4 h-4" />
          {saving ? "Saving…" : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}
