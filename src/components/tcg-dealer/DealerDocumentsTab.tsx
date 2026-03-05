import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Upload, Download, Trash2, FileText, CheckCircle2, Square, Ban, HelpCircle, Plus, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DealerPolicyRecord, DealerPolicy } from "@/data/tcg/dealerPolicies";
import { masterPolicyList } from "@/data/tcg/dealerPolicies";

interface DealerDocumentsTabProps {
  policyRecord: DealerPolicyRecord;
}

type DocStatus = "on-file" | "not-uploaded" | "not-held" | "not-recorded";

interface DocumentRow {
  id: string;
  name: string;
  category: string;
  policyId: string | null;
  status: DocStatus;
  fileName: string | null;
  uploadedDate: string | null;
  notes: string;
}

const DOC_CATEGORIES = [
  "All",
  "Policy Documents",
  "Compliance Evidence",
  "Permissions",
  "Financial Promotions",
  "Other",
];

function getDocStatus(policy: DealerPolicy): DocStatus {
  if (policy.documentUploaded && policy.fileName) return "on-file";
  if (policy.exists) return "not-uploaded";
  if (!policy.exists && policy.notes === "Policy not in place") return "not-held";
  return "not-recorded";
}

function statusIcon(status: DocStatus) {
  switch (status) {
    case "on-file": return <CheckCircle2 className="w-4 h-4 text-outcome-pass" />;
    case "not-uploaded": return <Square className="w-4 h-4 text-muted-foreground" />;
    case "not-held": return <Ban className="w-4 h-4 text-muted-foreground/50" />;
    case "not-recorded": return <HelpCircle className="w-4 h-4 text-muted-foreground/50" />;
  }
}

function statusLabel(status: DocStatus) {
  switch (status) {
    case "on-file": return <span className="text-outcome-pass-text font-medium">✅ On file</span>;
    case "not-uploaded": return <span className="text-muted-foreground">🔲 Not yet uploaded</span>;
    case "not-held": return <span className="text-muted-foreground/60">⛔ Not held</span>;
    case "not-recorded": return <span className="text-muted-foreground/50">❓ Not recorded</span>;
  }
}

function policyCategoryToDocCategory(policyCategory: string): string {
  if (policyCategory.includes("Insurance")) return "Policy Documents";
  if (policyCategory === "Financial Promotions") return "Financial Promotions";
  if (policyCategory === "Permissions & Conduct") return "Permissions";
  return "Policy Documents";
}

export function DealerDocumentsTab({ policyRecord }: DealerDocumentsTabProps) {
  const { toast } = useToast();
  const { policies, distributeInsurance, dealerName } = policyRecord;

  // Build document rows from policies
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { fileName: string; date: string }>>({});
  const [filter, setFilter] = useState("All");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Upload form state
  const [uploadDocName, setUploadDocName] = useState("");
  const [uploadCategory, setUploadCategory] = useState("Policy Documents");
  const [uploadPolicyId, setUploadPolicyId] = useState("none");
  const [uploadNotes, setUploadNotes] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadExpiry, setUploadExpiry] = useState("");

  const documentRows: DocumentRow[] = useMemo(() => {
    const visiblePolicies = distributeInsurance
      ? policies
      : policies.filter(p => p.category !== "Insurance (if applicable)");

    return visiblePolicies.map(p => {
      const override = uploadedDocs[p.id];
      const status: DocStatus = override ? "on-file" : getDocStatus(p);
      return {
        id: p.id,
        name: p.name,
        category: policyCategoryToDocCategory(p.category),
        policyId: p.id,
        status,
        fileName: override?.fileName || (p.documentUploaded ? p.fileName : null),
        uploadedDate: override?.date || (p.documentUploaded && p.lastUpdated ? p.lastUpdated : null),
        notes: p.notes,
      };
    });
  }, [policies, distributeInsurance, uploadedDocs]);

  const filteredRows = useMemo(() => {
    if (filter === "All") return documentRows;
    return documentRows.filter(r => r.category === filter);
  }, [documentRows, filter]);

  const stats = useMemo(() => ({
    onFile: documentRows.filter(r => r.status === "on-file").length,
    notUploaded: documentRows.filter(r => r.status === "not-uploaded").length,
    notHeld: documentRows.filter(r => r.status === "not-held").length,
    notRecorded: documentRows.filter(r => r.status === "not-recorded").length,
    total: documentRows.length,
  }), [documentRows]);

  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }) : "—";

  const handleRequestFromDealer = (docName: string) => {
    toast({
      title: "Request Logged",
      description: `Document request for "${docName}" has been added to the activity log.`,
    });
  };

  const handleUpload = () => {
    if (!uploadDocName.trim()) return;
    const targetPolicyId = uploadPolicyId !== "none" ? uploadPolicyId : null;
    const now = new Date().toISOString();

    if (targetPolicyId) {
      setUploadedDocs(prev => ({
        ...prev,
        [targetPolicyId]: { fileName: uploadFile?.name || uploadDocName, date: now },
      }));
    }

    toast({
      title: "Document Uploaded",
      description: `"${uploadDocName}" has been saved to ${dealerName}'s document store.`,
    });

    // Reset form
    setUploadDocName("");
    setUploadCategory("Policy Documents");
    setUploadPolicyId("none");
    setUploadNotes("");
    setUploadFile(null);
    setUploadExpiry("");
    setShowUploadModal(false);
  };

  const handleDelete = (docId: string) => {
    const row = documentRows.find(r => r.id === docId);
    setUploadedDocs(prev => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });
    toast({
      title: "Document Deleted",
      description: `Document for "${row?.name}" has been removed.`,
    });
    setDeleteTarget(null);
  };

  const handleDownload = (row: DocumentRow) => {
    toast({
      title: "Download Started",
      description: `Downloading ${row.fileName}...`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Dealer Documents</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Policy documents and compliance evidence for {dealerName}.
          </p>
        </div>
        <Button onClick={() => setShowUploadModal(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Upload Document
        </Button>
      </div>

      {/* Summary strip */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-card border border-border rounded-lg px-4 py-3 text-sm">
        <span className="text-outcome-pass-text"><strong>{stats.onFile}</strong> on file</span>
        <span className="text-border">|</span>
        <span className="text-muted-foreground"><strong>{stats.notUploaded}</strong> not yet uploaded</span>
        <span className="text-border">|</span>
        <span className="text-muted-foreground/60"><strong>{stats.notHeld}</strong> not held</span>
        <span className="text-border">|</span>
        <span className="text-muted-foreground/50"><strong>{stats.notRecorded}</strong> not recorded</span>
        <span className="text-border">|</span>
        <span className="font-medium"><strong>{stats.total}</strong> total</span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {DOC_CATEGORIES.map(cat => (
          <Button
            key={cat}
            variant={filter === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(cat)}
            className="text-xs"
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Document table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Document Name</TableHead>
              <TableHead className="w-[140px]">Category</TableHead>
              <TableHead className="w-[120px]">Uploaded</TableHead>
              <TableHead className="w-[160px]">Status</TableHead>
              <TableHead className="w-[140px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No documents match this filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map(row => (
                <TableRow
                  key={row.id}
                  className={row.status === "not-held" ? "opacity-60" : ""}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{row.name}</p>
                        {row.fileName && row.status === "on-file" && (
                          <p className="text-xs text-muted-foreground truncate">{row.fileName}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">{row.category}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {fmtDate(row.uploadedDate)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      {statusLabel(row.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {row.status === "on-file" && (
                        <>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleDownload(row)} title="Download">
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget(row.id)} title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                      {row.status === "not-uploaded" && (
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => handleRequestFromDealer(row.name)}>
                          <Send className="w-3 h-3" /> Request
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Upload Document Modal */}
      <Dialog open={showUploadModal} onOpenChange={open => { if (!open) setShowUploadModal(false); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a policy document or compliance evidence for {dealerName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Document name *</Label>
              <Input value={uploadDocName} onChange={e => setUploadDocName(e.target.value)} placeholder="e.g. Consumer Duty Policy v2" />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={uploadCategory} onValueChange={setUploadCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Policy Documents">Policy Document</SelectItem>
                  <SelectItem value="Compliance Evidence">Compliance Evidence</SelectItem>
                  <SelectItem value="Permissions">Permissions</SelectItem>
                  <SelectItem value="Financial Promotions">Financial Promotions</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Policy (if applicable)</Label>
              <Select value={uploadPolicyId} onValueChange={setUploadPolicyId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not policy-specific</SelectItem>
                  {masterPolicyList
                    .filter(p => distributeInsurance || p.category !== "Insurance (if applicable)")
                    .map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={uploadNotes}
                onChange={e => setUploadNotes(e.target.value)}
                placeholder="Any additional details..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Upload file</Label>
              <div
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => document.getElementById("doc-file-input")?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) setUploadFile(file);
                }}
              >
                <input
                  id="doc-file-input"
                  type="file"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) setUploadFile(file);
                  }}
                />
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                {uploadFile ? (
                  <p className="text-sm font-medium text-foreground">{uploadFile.name}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Drag and drop or click to browse</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Expiry date (optional)</Label>
              <Input type="date" value={uploadExpiry} onChange={e => setUploadExpiry(e.target.value)} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowUploadModal(false)}>Cancel</Button>
              <Button onClick={handleUpload} disabled={!uploadDocName.trim()} className="gap-2">
                <Upload className="w-4 h-4" /> Save Document
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && handleDelete(deleteTarget)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
