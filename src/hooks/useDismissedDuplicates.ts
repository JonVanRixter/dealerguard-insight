import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { detectDuplicates, DuplicateGroup } from "@/utils/duplicateDetection";

export function useDismissedDuplicates() {
  const [dismissedKeys, setDismissedKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDismissed = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from("dismissed_duplicates")
      .select("duplicate_key");

    if (!error && data) {
      setDismissedKeys(new Set(data.map((r: any) => r.duplicate_key)));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchDismissed(); }, [fetchDismissed]);

  const allDuplicates = useMemo(() => detectDuplicates(), []);

  const activeDuplicates = useMemo(
    () => allDuplicates.filter((g) => !dismissedKeys.has(g.key)),
    [allDuplicates, dismissedKeys]
  );

  const dismiss = useCallback(async (key: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Not authenticated", description: "Please sign in.", variant: "destructive" });
      return false;
    }

    const { error } = await supabase.from("dismissed_duplicates").insert({
      user_id: user.id,
      duplicate_key: key,
    });

    if (error) {
      toast({ title: "Error", description: "Failed to dismiss duplicate.", variant: "destructive" });
      return false;
    }

    setDismissedKeys((prev) => new Set([...prev, key]));
    toast({ title: "Dismissed", description: "This duplicate flag has been dismissed." });
    return true;
  }, [toast]);

  const undismiss = useCallback(async (key: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from("dismissed_duplicates")
      .delete()
      .eq("duplicate_key", key)
      .eq("user_id", user.id);

    if (error) return false;

    setDismissedKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    toast({ title: "Restored", description: "Duplicate flag restored for review." });
    return true;
  }, [toast]);

  return { allDuplicates, activeDuplicates, loading, dismiss, undismiss, isDismissed: (key: string) => dismissedKeys.has(key) };
}
