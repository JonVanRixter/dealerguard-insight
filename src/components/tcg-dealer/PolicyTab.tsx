import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, ChevronRight, Paperclip, Pencil, Check, X, AlertTriangle } from "lucide-react";
import type { DealerPolicyRecord, DealerPolicy } from "@/data/tcg/dealerPolicies";

interface PolicyTabProps {
  policyRecord: DealerPolicyRecord;
}

function ExistsPill({ exists }: { exists: boolean | null }) {
  if (exists === true) return <Badge className="bg-[hsl(var(--rag-green-bg))] text-[hsl(var(--rag-green-text))]">✅ Yes</Badge>;
  if (exists === false) return <Badge className="bg-[hsl(var(--rag-red-bg))] text-[hsl(var(--rag-red-text))]">❌ No</Badge>;
  return <Badge variant="secondary">— N/A</Badge>;
}

function PolicyRow({ policy }: { policy: DealerPolicy }) {
  const { toast } = useToast();

  return (
    <div className="grid grid-cols-12 gap-3 items-center px-4 py-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors text-sm">
      <div className="col-span-4 font-medium text-foreground">{policy.name}</div>
      <div className="col-span-1 text-center">
        <ExistsPill exists={policy.exists} />
      </div>
      <div className="col-span-3">
        {policy.documentUploaded && policy.fileName ? (
          <button
            onClick={() => toast({ title: "Document Preview", description: `POC: Would open ${policy.fileName} for viewing.` })}
            className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm"
          >
            <Paperclip className="w-3.5 h-3.5" />
            {policy.fileName}
          </button>
        ) : (
          <span className="text-muted-foreground">Not uploaded</span>
        )}
      </div>
      <div className="col-span-2 text-muted-foreground">
        {policy.lastUpdated
          ? new Date(policy.lastUpdated).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
          : "Unknown"}
      </div>
      <div className="col-span-2 text-muted-foreground text-xs truncate" title={policy.notes}>
        {policy.notes || "—"}
      </div>
    </div>
  );
}

function CategoryGroup({
  category,
  policies,
}: {
  category: string;
  policies: DealerPolicy[];
}) {
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="bg-card rounded-lg border border-border">
      <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          <span className="font-semibold text-sm text-foreground">{category}</span>
          <Badge variant="secondary" className="text-xs">
            {policies.length} {policies.length === 1 ? "policy" : "policies"}
          </Badge>
        </div>
        {!editing ? (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs"
            onClick={(e) => { e.stopPropagation(); setEditing(true); setOpen(true); }}
          >
            <Pencil className="w-3 h-3" /> Edit
          </Button>
        ) : (
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setEditing(false)}>
              <Check className="w-3 h-3" /> Done
            </Button>
          </div>
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        {/* Column headers */}
        <div className="grid grid-cols-12 gap-3 px-4 py-2 border-t border-b border-border bg-muted/40 text-xs text-muted-foreground font-medium">
          <div className="col-span-4">Policy</div>
          <div className="col-span-1 text-center">Exists</div>
          <div className="col-span-3">Document</div>
          <div className="col-span-2">Last Updated</div>
          <div className="col-span-2">Notes</div>
        </div>
        {editing ? (
          <EditablePolicyList policies={policies} onDone={() => setEditing(false)} />
        ) : (
          policies.map((p) => <PolicyRow key={p.id} policy={p} />)
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

function EditablePolicyList({ policies, onDone }: { policies: DealerPolicy[]; onDone: () => void }) {
  const { toast } = useToast();

  return (
    <div>
      {policies.map((policy) => (
        <div key={policy.id} className="grid grid-cols-12 gap-3 items-center px-4 py-3 border-b border-border last:border-0 text-sm">
          <div className="col-span-4 font-medium text-foreground">{policy.name}</div>
          <div className="col-span-1 text-center">
            <ExistsPill exists={policy.exists} />
          </div>
          <div className="col-span-3">
            {policy.documentUploaded ? (
              <span className="text-xs text-muted-foreground">{policy.fileName}</span>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => toast({ title: "Upload", description: "POC: File upload dialog would open here." })}
              >
                Upload document
              </Button>
            )}
          </div>
          <div className="col-span-2">
            <Input
              type="date"
              defaultValue={policy.lastUpdated ?? ""}
              className="h-7 text-xs"
            />
          </div>
          <div className="col-span-2">
            <Textarea
              defaultValue={policy.notes}
              className="text-xs min-h-[28px] h-7 resize-none"
              rows={1}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PolicyTab({ policyRecord }: PolicyTabProps) {
  const { policies, lastReviewed, reviewedBy, distributeInsurance } = policyRecord;

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, DealerPolicy[]>();
    policies.forEach((p) => {
      const arr = map.get(p.category) || [];
      arr.push(p);
      map.set(p.category, arr);
    });
    return Array.from(map.entries());
  }, [policies]);

  // Summary stats
  const stats = useMemo(() => {
    const confirmed = policies.filter((p) => p.exists).length;
    const notHeld = policies.filter((p) => !p.exists).length;
    const na = 0; // N/A isn't modeled as separate state in current data
    const docsUploaded = policies.filter((p) => p.documentUploaded).length;
    const docsOutstanding = confirmed - docsUploaded;
    return { confirmed, notHeld, na, docsUploaded, docsOutstanding, total: policies.length };
  }, [policies]);

  const insuranceCategory = "Insurance (if applicable)";
  const hasInsurancePolicies = policies.some((p) => p.category === insuranceCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-base font-semibold text-foreground">Policy Framework</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Last reviewed: {new Date(lastReviewed).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} by {reviewedBy}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Policy records are shared with all lenders using this dealer. Documents marked as uploaded can be shared with individual lenders on request.
        </p>
      </div>

      {/* Insurance question banner */}
      <div className="flex items-center gap-4 bg-muted/50 border border-border rounded-lg px-4 py-3">
        <span className="text-sm text-foreground">
          Distributes insurance products (GAP/Warranties):
        </span>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${distributeInsurance ? "text-[hsl(var(--rag-green-text))]" : "text-muted-foreground"}`}>
            {distributeInsurance ? "Yes ●" : "No ○"}
          </span>
          <Button variant="ghost" size="sm" className="text-xs h-7">Edit</Button>
        </div>
      </div>

      {/* If no insurance */}
      {!distributeInsurance && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-sm text-muted-foreground">
          <AlertTriangle className="w-4 h-4" />
          Insurance policies not applicable for this dealer.
        </div>
      )}

      {/* Completeness summary strip */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-card border border-border rounded-lg px-4 py-3 text-sm">
        <span><strong>{stats.confirmed}</strong> policies confirmed</span>
        <span className="text-border">|</span>
        <span className="text-rag-amber"><strong>{stats.notHeld}</strong> not held</span>
        <span className="text-border">|</span>
        <span className="text-muted-foreground"><strong>{stats.na}</strong> N/A</span>
        <span className="text-border">|</span>
        <span className="text-[hsl(var(--rag-green-text))]"><strong>{stats.docsUploaded}</strong> documents uploaded</span>
        <span className="text-border">|</span>
        <span className="text-rag-amber"><strong>{stats.docsOutstanding}</strong> documents outstanding</span>
      </div>

      {/* Policy categories */}
      <div className="space-y-4">
        {grouped
          .filter(([cat]) => distributeInsurance || cat !== insuranceCategory)
          .map(([category, catPolicies]) => (
            <CategoryGroup key={category} category={category} policies={catPolicies} />
          ))}
      </div>
    </div>
  );
}
