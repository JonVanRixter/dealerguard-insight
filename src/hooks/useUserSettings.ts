import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface UserSettings {
  region: string;
  date_format: string;
  email_critical: boolean;
  email_warning: boolean;
  email_audit_reminders: boolean;
  email_weekly_summary: boolean;
  inapp_critical: boolean;
  inapp_warning: boolean;
  inapp_audit_reminders: boolean;
  inapp_weekly_summary: boolean;
  digest_frequency: string;
  green_threshold: number;
  amber_threshold: number;
  score_drop_trigger: number;
  overdue_actions_trigger: number;
  theme: string;
  compact_mode: boolean;
  animations: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  region: "uk",
  date_format: "DD/MM/YYYY",
  email_critical: true,
  email_warning: false,
  email_audit_reminders: true,
  email_weekly_summary: true,
  inapp_critical: true,
  inapp_warning: true,
  inapp_audit_reminders: true,
  inapp_weekly_summary: false,
  digest_frequency: "daily",
  green_threshold: 80,
  amber_threshold: 55,
  score_drop_trigger: 10,
  overdue_actions_trigger: 3,
  theme: "system",
  compact_mode: false,
  animations: true,
};

export function useUserSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      setSettings(DEFAULT_SETTINGS);
      setLoading(false);
      return;
    }

    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setSettings({
          region: data.region,
          date_format: data.date_format,
          email_critical: data.email_critical,
          email_warning: data.email_warning,
          email_audit_reminders: data.email_audit_reminders,
          email_weekly_summary: data.email_weekly_summary,
          inapp_critical: data.inapp_critical,
          inapp_warning: data.inapp_warning,
          inapp_audit_reminders: data.inapp_audit_reminders,
          inapp_weekly_summary: data.inapp_weekly_summary,
          digest_frequency: data.digest_frequency,
          green_threshold: data.green_threshold,
          amber_threshold: data.amber_threshold,
          score_drop_trigger: data.score_drop_trigger,
          overdue_actions_trigger: data.overdue_actions_trigger,
          theme: data.theme,
          compact_mode: data.compact_mode,
          animations: data.animations,
        });
      }
      setLoading(false);
    };

    fetchSettings();
  }, [user]);

  const saveSettings = useCallback(async (updates: Partial<UserSettings>) => {
    if (!user) return;
    setSaving(true);
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);

    const { error } = await supabase
      .from("user_settings")
      .update(newSettings)
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    } else {
      toast({ title: "Settings Saved", description: "Your preferences have been updated." });
    }
    setSaving(false);
  }, [user, settings, toast]);

  return { settings, setSettings, saveSettings, loading, saving };
}
