import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FileUp,
  FileText,
  Trash2,
  Download,
  Loader2,
  UserCheck,
  Clock,
  XCircle,
  CheckCircle2,
  ShieldCheck,
  Eye,
} from "lucide-react";

const VERIFICATION_STATUSES = [
  { value: "pending", label: "Pending Review", icon: Clock, color: "text-outcome-pending" },
  { value: "verified", label: "Verified", icon: CheckCircle2, color: "text-outcome-pass" },
  { value: "rejected", label: "Rejected", icon: XCircle, color: "text-outcome-fail" },
] as const;

type VerificationStatus = typeof VERIFICATION_STATUSES[number]["value"];

interface PassportDocument {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  category: string;
  description: string | null;
  tags: string[];
  expiry_date: string | null;
  created_at: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props {
  dealerName: string;
}

export function DirectorPassportCheck({ dealerName }: Props) {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<PassportDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [directorName, setDirectorName] = useState("");
  const [notes, setNotes] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  // Local status tracking (keyed by doc id)
  const [statuses, setStatuses] = useState<Record<string, VerificationStatus>>({});
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const fetchDocuments = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from("dealer_documents")
      .select("*")
      .eq("dealer_name", dealerName)
      .eq("category", "Passport / ID")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const docs = data as PassportDocument[];
      setDocuments(docs);
      // Initialize statuses from tags
      const s: Record<string, VerificationStatus> = {};
      const n: Record<string, string> = {};
      docs.forEach((d) => {
        const statusTag = d.tags?.find((t) => t.startsWith("status:"));
        s[d.id] = (statusTag?.split(":")[1] as VerificationStatus) || "pending";
        const noteTag = d.tags?.find((t) => t.startsWith("review:"));
        n[d.id] = noteTag?.slice(7) || "";
      });
      setStatuses(s);
      setReviewNotes(n);
    }
    setLoading(false);
  }, [dealerName]);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const resetForm = () => {
    setFile(null);
    setDirectorName("");
    setNotes("");
    setExpiryDate("");
  };

  const handleUpload = async () => {
    if (!file || !directorName.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Not authenticated", description: "Please sign in.", variant: "destructive" });
      return;
    }

    setUploading(true);
    const filePath = `${user.id}/${dealerName}/passport/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("dealer-documents")
      .upload(filePath, file);

    if (uploadError) {
      toast({ title: "Upload Failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { error: dbError } = await supabase.from("dealer_documents").insert({
      user_id: user.id,
      dealer_name: dealerName,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      file_type: file.type,
      category: "Passport / ID",
      description: notes || null,
      tags: [`director:${directorName.trim()}`, "status:pending"],
      expiry_date: expiryDate || null,
    });

    if (dbError) {
      toast({ title: "Save Failed", description: dbError.message, variant: "destructive" });
    } else {
      toast({ title: "Passport Uploaded", description: `${directorName}'s passport document has been uploaded for review.` });
      resetForm();
      setDialogOpen(false);
      fetchDocuments();
    }
    setUploading(false);
  };

  const updateStatus = async (doc: PassportDocument, newStatus: VerificationStatus, note: string) => {
    const existingTags = (doc.tags || []).filter((t) => !t.startsWith("status:") && !t.startsWith("review:"));
    const updatedTags = [...existingTags, `status:${newStatus}`, ...(note ? [`review:${note}`] : [])];

    const { error } = await supabase
      .from("dealer_documents")
      .update({ tags: updatedTags })
      .eq("id", doc.id);

    if (!error) {
      setStatuses((prev) => ({ ...prev, [doc.id]: newStatus }));
      setReviewNotes((prev) => ({ ...prev, [doc.id]: note }));
      toast({ title: "Status Updated", description: `Document marked as ${newStatus}.` });
      fetchDocuments();
    }
  };

  const handleDownload = async (doc: PassportDocument) => {
    const { data, error } = await supabase.storage
      .from("dealer-documents")
      .download(doc.file_path);

    if (error || !data) {
      toast({ title: "Download Failed", description: "Could not download the file.", variant: "destructive" });
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.file_name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (doc: PassportDocument) => {
    await supabase.storage.from("dealer-documents").remove([doc.file_path]);
    const { error } = await supabase.from("dealer_documents").delete().eq("id", doc.id);
    if (!error) {
      toast({ title: "Deleted", description: `${doc.file_name} removed.` });
      fetchDocuments();
    }
  };

  const getDirectorName = (doc: PassportDocument) => {
    const tag = doc.tags?.find((t) => t.startsWith("director:"));
    return tag?.slice(9) || "Unknown Director";
  };

  const getStatusConfig = (docId: string) => {
    const status = statuses[docId] || "pending";
    return VERIFICATION_STATUSES.find((s) => s.value === status) || VERIFICATION_STATUSES[0];
  };

  const verifiedCount = Object.values(statuses).filter((s) => s === "verified").length;
  const pendingCount = Object.values(statuses).filter((s) => s === "pending").length;
  const rejectedCount = Object.values(statuses).filter((s) => s === "rejected").length;

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Director Passport / ID Check</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {documents.length} document{documents.length !== 1 ? "s" : ""}
              {documents.length > 0 && (
                <span className="ml-2">
                  <span className="text-outcome-pass">{verifiedCount} verified</span>
                  {pendingCount > 0 && <span className="text-outcome-pending ml-1.5">{pendingCount} pending</span>}
                  {rejectedCount > 0 && <span className="text-outcome-fail ml-1.5">{rejectedCount} rejected</span>}
                </span>
              )}
            </p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <FileUp className="w-4 h-4" /> Upload Passport
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload Director Passport / ID</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Director Name *</label>
                <Input
                  placeholder="e.g. John Smith"
                  value={directorName}
                  onChange={(e) => setDirectorName(e.target.value)}
                  className="bg-background"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Passport / ID Scan *</label>
                <Input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.tiff,.bmp"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="bg-background"
                />
                {file && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {file.name} ({formatFileSize(file.size)})
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Document Expiry Date</label>
                <Input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Notes</label>
                <Textarea
                  placeholder="Optional notes about this document..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-background resize-none"
                  rows={2}
                  maxLength={500}
                />
              </div>
              <Button
                onClick={handleUpload}
                disabled={!file || !directorName.trim() || uploading}
                className="w-full gap-2"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
                {uploading ? "Uploading..." : "Upload Document"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Document list */}
      <div className="divide-y divide-border">
        {loading ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">Loading passport documents...</div>
        ) : documents.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <UserCheck className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No director passport documents uploaded yet.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Upload passport scans to verify director identities.
            </p>
          </div>
        ) : (
          documents.map((doc, i) => {
            const statusConfig = getStatusConfig(doc.id);
            const StatusIcon = statusConfig.icon;
            return (
              <div
                key={doc.id}
                className="px-5 py-4 space-y-3 opacity-0 animate-fade-in"
                style={{ animationDelay: `${i * 40}ms`, animationFillMode: "forwards" }}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{getDirectorName(doc)}</p>
                      <Badge
                        variant="outline"
                        className={`text-xs gap-1 ${statusConfig.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{doc.file_name}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{formatFileSize(doc.file_size)}</span>
                      <span>Uploaded: {new Date(doc.created_at).toLocaleDateString()}</span>
                      {doc.expiry_date && (
                        <span className={new Date(doc.expiry_date) < new Date() ? "text-destructive font-medium" : ""}>
                          {new Date(doc.expiry_date) < new Date() ? "EXPIRED" : "Expires"}: {new Date(doc.expiry_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {doc.description && (
                      <p className="text-xs text-muted-foreground mt-1">{doc.description}</p>
                    )}
                    {reviewNotes[doc.id] && (
                      <p className="text-xs mt-1 italic text-muted-foreground">
                        Review note: {reviewNotes[doc.id]}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDownload(doc)} title="Download">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(doc)} title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Review actions */}
                {statuses[doc.id] === "pending" && (
                  <div className="ml-8 flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="Add review note (optional)..."
                      value={reviewNotes[doc.id] || ""}
                      onChange={(e) => setReviewNotes((prev) => ({ ...prev, [doc.id]: e.target.value }))}
                      className="bg-background text-xs h-8 flex-1"
                      maxLength={200}
                    />
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-outcome-pass border-outcome-pass/30 hover:bg-outcome-pass/10 h-8"
                        onClick={() => updateStatus(doc, "verified", reviewNotes[doc.id] || "")}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-outcome-fail border-outcome-fail/30 hover:bg-outcome-fail/10 h-8"
                        onClick={() => updateStatus(doc, "rejected", reviewNotes[doc.id] || "")}
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
