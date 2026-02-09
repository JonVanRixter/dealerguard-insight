import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save, Bell, Mail, MessageSquare, AlertTriangle } from "lucide-react";

interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  email: boolean;
  inApp: boolean;
  icon: React.ReactNode;
}

export function NotificationSettings() {
  const { toast } = useToast();
  const [digestFrequency, setDigestFrequency] = useState("daily");
  const [notifications, setNotifications] = useState<NotificationPreference[]>([
    {
      id: "critical-alerts",
      label: "Critical Alerts (Red RAG)",
      description: "Immediate notification when a dealer moves to critical status",
      email: true,
      inApp: true,
      icon: <AlertTriangle className="w-4 h-4 text-rag-red" />,
    },
    {
      id: "warning-alerts",
      label: "Warning Alerts (Amber RAG)",
      description: "Notification when a dealer drops to warning status",
      email: true,
      inApp: true,
      icon: <AlertTriangle className="w-4 h-4 text-rag-amber" />,
    },
    {
      id: "audit-reminders",
      label: "Audit Due Reminders",
      description: "Reminder before dealer audits are due",
      email: true,
      inApp: true,
      icon: <Bell className="w-4 h-4 text-muted-foreground" />,
    },
    {
      id: "action-updates",
      label: "Action Item Updates",
      description: "Updates when remediation actions are completed or overdue",
      email: false,
      inApp: true,
      icon: <MessageSquare className="w-4 h-4 text-muted-foreground" />,
    },
    {
      id: "weekly-summary",
      label: "Weekly Portfolio Summary",
      description: "Weekly digest of portfolio compliance status",
      email: true,
      inApp: false,
      icon: <Mail className="w-4 h-4 text-muted-foreground" />,
    },
    {
      id: "score-changes",
      label: "Significant Score Changes",
      description: "Alert when dealer scores change by more than 10 points",
      email: false,
      inApp: true,
      icon: <Bell className="w-4 h-4 text-muted-foreground" />,
    },
  ]);

  const toggleNotification = (id: string, type: "email" | "inApp") => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, [type]: !n[type] } : n))
    );
  };

  const handleSave = () => {
    toast({
      title: "Notifications Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Digest Settings */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Digest Settings</h3>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="digest">Email Digest Frequency</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              How often to receive a summary of all alerts
            </p>
          </div>
          <Select value={digestFrequency} onValueChange={setDigestFrequency}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
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

      {/* Notification Preferences */}
      <div className="bg-card rounded-xl border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Notification Preferences</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Choose how you want to be notified for each event type
          </p>
        </div>
        
        <div className="divide-y divide-border">
          {/* Header */}
          <div className="px-6 py-3 bg-muted/30 flex items-center text-xs font-medium text-muted-foreground">
            <div className="flex-1">Event Type</div>
            <div className="w-20 text-center">Email</div>
            <div className="w-20 text-center">In-App</div>
          </div>
          
          {/* Notification rows */}
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="px-6 py-4 flex items-center hover:bg-muted/20 transition-colors"
            >
              <div className="flex-1 flex items-start gap-3">
                <div className="mt-0.5">{notification.icon}</div>
                <div>
                  <p className="text-sm font-medium text-foreground">{notification.label}</p>
                  <p className="text-xs text-muted-foreground">{notification.description}</p>
                </div>
              </div>
              <div className="w-20 flex justify-center">
                <Switch
                  checked={notification.email}
                  onCheckedChange={() => toggleNotification(notification.id, "email")}
                />
              </div>
              <div className="w-20 flex justify-center">
                <Switch
                  checked={notification.inApp}
                  onCheckedChange={() => toggleNotification(notification.id, "inApp")}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
