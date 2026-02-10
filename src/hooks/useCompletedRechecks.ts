import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CompletedRecheck {
  id: string;
  dealer_name: string;
  recheck_month: number;
  completed_at: string;
  notes: string | null;
}

export function useCompletedRechecks() {
  const [completedRechecks, setCompletedRechecks] = useState<CompletedRecheck[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCompleted = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("completed_rechecks")
      .select("*");

    if (!error && data) {
      setCompletedRechecks(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCompleted();
  }, [fetchCompleted]);

  const isCompleted = useCallback(
    (dealerName: string, recheckMonth: number) =>
      completedRechecks.some(
        (r) => r.dealer_name === dealerName && r.recheck_month === recheckMonth
      ),
    [completedRechecks]
  );

  const markComplete = useCallback(
    async (dealerName: string, recheckMonth: number) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Not authenticated", description: "Please sign in to mark re-checks.", variant: "destructive" });
        return false;
      }

      const { error } = await supabase.from("completed_rechecks").insert({
        user_id: user.id,
        dealer_name: dealerName,
        recheck_month: recheckMonth,
      });

      if (error) {
        toast({ title: "Error", description: "Failed to mark re-check as complete.", variant: "destructive" });
        return false;
      }

      toast({ title: "Re-Check Completed", description: `${recheckMonth}-month re-check for ${dealerName} marked as complete.` });
      await fetchCompleted();
      return true;
    },
    [fetchCompleted, toast]
  );

  const undoComplete = useCallback(
    async (dealerName: string, recheckMonth: number) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const record = completedRechecks.find(
        (r) => r.dealer_name === dealerName && r.recheck_month === recheckMonth
      );
      if (!record) return false;

      const { error } = await supabase.from("completed_rechecks").delete().eq("id", record.id);

      if (error) {
        toast({ title: "Error", description: "Failed to undo completion.", variant: "destructive" });
        return false;
      }

      toast({ title: "Re-Check Reopened", description: `${recheckMonth}-month re-check for ${dealerName} marked as pending.` });
      await fetchCompleted();
      return true;
    },
    [completedRechecks, fetchCompleted, toast]
  );

  return { completedRechecks, loading, isCompleted, markComplete, undoComplete };
}
