import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Paperclip, FileX, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DealerPolicyRecord, DealerPolicy } from "@/data/tcg/dealerPolicies";

interface DealerDocumentsTabProps {
  policyRecord: DealerPolicyRecord;
}

function ExistsPill({ exists }: { exists: boolean }) {
  return exists
    ? <Badge className="bg-outcome-pass-bg text-outcome-pass-text text-xs">Yes</Badge>
    : <Badge className="bg-outcome-fail-bg text-outcome-fail-text text-xs">No</Badge>;
}

function DocRow({ policy }: { policy: DealerPolicy }) {
  const { toast } = useToast();
  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="grid grid-cols-12 gap-3 items-center px-4 py-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors text-sm">
      <div className="col-span-4 font-medium text-foreground">{policy.name}</div>
      <div className="col-span-1 text-center">
        <ExistsPill exists={policy.exists} />
      </div>
      <div className="col-span-4">
        {policy.documentUploaded && policy.fileName ? (
          <button
            onClick={() => toast({ title: "Document Preview", description: `Would open ${policy.fileName} for viewing.` })}
            className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm"
          >
            <Paperclip className="w-3.5 h-3.5" />
            <span className="truncate max-w-[200px]">{policy.fileName}</span>
            <Eye className="w-3.5 h-3.5 ml-1 text-muted-foreground" />
          </button>
        ) : policy.exists ? (
          <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs">
            <FileX className="w-3.5 h-3.5" /> Not uploaded
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </div>
      <div className="col-span-3 text-muted-foreground text-xs">{fmtDate(policy.lastUpdated)}</div>
    </div>
  );
}

function DocCategoryGroup({ category, policies }: { category: string; policies: DealerPolicy[] }) {
  const [open, setOpen] = useState(true);
  const uploaded = policies.filter((p) => p.documentUploaded).length;
  const total = policies.length;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="bg-card rounded-lg border border-border">
      <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          <span className="font-semibold text-sm text-foreground">{category}</span>
          <Badge variant="secondary" className="text-xs">{uploaded}/{total} uploaded</Badge>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid grid-cols-12 gap-3 px-4 py-2 border-t border-b border-border bg-muted/40 text-xs text-muted-foreground font-medium">
          <div className="col-span-4">Policy</div>
          <div className="col-span-1 text-center">Exists</div>
          <div className="col-span-4">Document</div>
          <div className="col-span-3">Last Updated</div>
        </div>
        {policies.map((p) => <DocRow key={p.id} policy={p} />)}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function DealerDocumentsTab({ policyRecord }: DealerDocumentsTabProps) {
  const { policies, distributeInsurance } = policyRecord;
  const insuranceCategory = "Insurance (if applicable)";

  const grouped = useMemo(() => {
    const map = new Map<string, DealerPolicy[]>();
    policies.forEach((p) => {
      const arr = map.get(p.category) || [];
      arr.push(p);
      map.set(p.category, arr);
    });
    return Array.from(map.entries());
  }, [policies]);

  const stats = useMemo(() => {
    const total = policies.length;
    const existing = policies.filter((p) => p.exists).length;
    const uploaded = policies.filter((p) => p.documentUploaded).length;
    const missing = existing - uploaded;
    const notInPlace = total - existing;
    return { total, uploaded, missing, notInPlace };
  }, [policies]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-foreground">Onboarding Documents</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Documents collected during the dealer onboarding audit. These records determine what can be shared with lenders on request.
        </p>
      </div>

      {/* Summary strip */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-card border border-border rounded-lg px-4 py-3 text-sm">
        <span className="text-outcome-pass-text"><strong>{stats.uploaded}</strong> documents uploaded</span>
        <span className="text-border">|</span>
        <span className="text-amber-600 dark:text-amber-400"><strong>{stats.missing}</strong> documents missing</span>
        <span className="text-border">|</span>
        <span className="text-outcome-fail-text"><strong>{stats.notInPlace}</strong> policies not in place</span>
        <span className="text-border">|</span>
        <span className="text-muted-foreground"><strong>{stats.total}</strong> total policies</span>
      </div>

      {/* Category groups */}
      <div className="space-y-4">
        {grouped
          .filter(([cat]) => distributeInsurance || cat !== insuranceCategory)
          .map(([category, catPolicies]) => (
            <DocCategoryGroup key={category} category={category} policies={catPolicies} />
          ))}
      </div>
    </div>
  );
}
