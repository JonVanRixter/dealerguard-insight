import { useState, useCallback, useRef } from "react";
import { Sparkles, Loader2, Check, X, Download, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScoreBadge } from "@/components/ScoreBadge";
import { generateDealerAudit, DealerAudit } from "@/data/auditFramework";
import { dealers, Dealer, getScoreBand } from "@/data/dealers";
import ReactMarkdown from "react-markdown";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-audit-summary`;

interface DealerSummaryResult {
  dealerName: string;
  score: number;
  summary: string;
  status: "pending" | "generating" | "done" | "error";
  error?: string;
}

async function fetchSummaryForDealer(audit: DealerAudit, abortSignal?: AbortSignal): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Not authenticated. Please sign in.");
  }

  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ auditData: audit }),
    signal: abortSignal,
  });

  if (!resp.ok) {
    const errorData = await resp.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed (${resp.status})`);
  }
  if (!resp.body) throw new Error("No response stream");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "" || !line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") return fullText;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) fullText += content;
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }
  return fullText;
}

export function BatchAiSummary() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDealers, setSelectedDealers] = useState<Set<number>>(new Set());
  const [results, setResults] = useState<DealerSummaryResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  // Show top 20 dealers by default (sorted by score ascending = worst first)
  const candidateDealers = [...dealers]
    .sort((a, b) => a.score - b.score)
    .slice(0, 50);

  const toggleDealer = (idx: number) => {
    setSelectedDealers(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const selectPreset = (preset: "low" | "mid" | "all-risk") => {
    const indices = new Set<number>();
    candidateDealers.forEach((d, i) => {
      if (preset === "low" && d.score < 55) indices.add(i);
      if (preset === "mid" && d.score < 80) indices.add(i);
      if (preset === "all-risk" && d.score < 80) indices.add(i);
    });
    setSelectedDealers(indices);
  };

  const completedCount = results.filter(r => r.status === "done").length;
  const errorCount = results.filter(r => r.status === "error").length;
  const totalCount = results.length;
  const progress = totalCount > 0 ? ((completedCount + errorCount) / totalCount) * 100 : 0;

  const runBatch = useCallback(async () => {
    if (selectedDealers.size === 0) {
      toast({ title: "No dealers selected", description: "Select at least one dealer to generate summaries.", variant: "destructive" });
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setIsRunning(true);

    const dealerList = Array.from(selectedDealers).map(i => candidateDealers[i]);
    const initialResults: DealerSummaryResult[] = dealerList.map(d => ({
      dealerName: d.name,
      score: d.score,
      summary: "",
      status: "pending",
    }));
    setResults(initialResults);

    for (let i = 0; i < dealerList.length; i++) {
      if (controller.signal.aborted) break;

      setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: "generating" } : r));

      try {
        const dealerIdx = dealers.findIndex(d => d.name === dealerList[i].name);
        const audit = generateDealerAudit(dealerList[i].name, dealerIdx >= 0 ? dealerIdx : 0);
        const summary = await fetchSummaryForDealer(audit, controller.signal);
        setResults(prev => prev.map((r, idx) => idx === i ? { ...r, summary, status: "done" } : r));
      } catch (error) {
        if (controller.signal.aborted) break;
        const message = error instanceof Error ? error.message : "Unknown error";
        setResults(prev => prev.map((r, idx) => idx === i ? { ...r, error: message, status: "error" } : r));
      }

      // Small delay between requests to avoid rate limiting
      if (i < dealerList.length - 1 && !controller.signal.aborted) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setIsRunning(false);
    abortRef.current = null;
  }, [selectedDealers, candidateDealers, toast]);

  const cancelBatch = () => {
    abortRef.current?.abort();
    setIsRunning(false);
  };

  const exportAllSummaries = () => {
    const completed = results.filter(r => r.status === "done");
    if (completed.length === 0) return;

    const content = completed.map(r =>
      `${"=".repeat(60)}\n${r.dealerName} (Score: ${r.score})\n${"=".repeat(60)}\n\n${r.summary}\n\n`
    ).join("");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `batch-audit-summaries-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Batch AI Summary Generator</h3>
          {results.length > 0 && completedCount > 0 && (
            <span className="text-xs text-muted-foreground">
              ({completedCount} completed)
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {isOpen && (
        <div className="border-t border-border">
          {/* Selection area */}
          {!isRunning && results.filter(r => r.status === "done").length === 0 && (
            <div className="px-5 py-4 space-y-4">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-muted-foreground">Quick select:</span>
                <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => selectPreset("low")}>
                  Score &lt; 55
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => selectPreset("mid")}>
                  Score &lt; 80
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => selectPreset("all-risk")}>
                  All At-Risk
                </Button>
                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setSelectedDealers(new Set())}>
                  Clear
                </Button>
                <span className="text-xs text-muted-foreground ml-auto">
                  {selectedDealers.size} selected
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto border border-border rounded-lg divide-y divide-border">
                {candidateDealers.map((dealer, i) => (
                  <label
                    key={dealer.name}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={selectedDealers.has(i)}
                      onCheckedChange={() => toggleDealer(i)}
                    />
                    <span className="flex-1 text-sm font-medium text-foreground truncate">{dealer.name}</span>
                    <ScoreBadge score={dealer.score} size="sm" />
                    <span className="text-xs text-muted-foreground w-10 text-right">{dealer.score}%</span>
                  </label>
                ))}
              </div>

              <Button onClick={runBatch} disabled={selectedDealers.size === 0} className="gap-2">
                <Sparkles className="w-4 h-4" />
                Generate {selectedDealers.size} {selectedDealers.size === 1 ? "Summary" : "Summaries"}
              </Button>
            </div>
          )}

          {/* Progress & Results */}
          {(isRunning || results.length > 0) && (
            <div className="px-5 py-4 space-y-4">
              {/* Progress bar */}
              {isRunning && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Generating summaries… {completedCount + errorCount} / {totalCount}
                    </span>
                    <Button variant="ghost" size="sm" className="text-xs h-7 text-destructive" onClick={cancelBatch}>
                      Cancel
                    </Button>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Export button */}
              {!isRunning && completedCount > 0 && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={exportAllSummaries} className="gap-1.5 text-xs">
                    <Download className="w-3.5 h-3.5" />
                    Export All Summaries
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setResults([]); setSelectedDealers(new Set()); }} className="text-xs">
                    Start New Batch
                  </Button>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {completedCount} completed{errorCount > 0 ? `, ${errorCount} failed` : ""}
                  </span>
                </div>
              )}

              {/* Results list */}
              <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                {results.map((result) => (
                  <div key={result.dealerName}>
                    <button
                      onClick={() => result.status === "done" && setExpandedResult(expandedResult === result.dealerName ? null : result.dealerName)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${result.status === "done" ? "hover:bg-muted/50 cursor-pointer" : ""}`}
                      disabled={result.status !== "done"}
                    >
                      {result.status === "pending" && <div className="w-4 h-4 rounded-full border-2 border-border" />}
                      {result.status === "generating" && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                      {result.status === "done" && <Check className="w-4 h-4 text-outcome-pass" />}
                      {result.status === "error" && <X className="w-4 h-4 text-outcome-fail" />}
                      <span className="flex-1 text-sm font-medium text-foreground truncate">{result.dealerName}</span>
                      <span className="text-sm font-bold text-score-badge-foreground bg-score-badge px-2 py-0.5 rounded-full">{dealers.find(d => d.name === result.dealerName)?.score ?? "—"}</span>
                      {result.status === "done" && (
                        expandedResult === result.dealerName
                          ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                          : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                      {result.status === "error" && (
                        <span className="text-xs text-destructive truncate max-w-32">{result.error}</span>
                      )}
                    </button>
                    {expandedResult === result.dealerName && result.status === "done" && (
                      <div className="px-4 py-3 bg-muted/30 border-t border-border">
                        <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
                          <ReactMarkdown>{result.summary}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
