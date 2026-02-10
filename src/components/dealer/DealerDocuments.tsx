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
  FileSpreadsheet,
  File,
  Trash2,
  Download,
  Calendar,
  Tag,
  Plus,
  X,
  Loader2,
} from "lucide-react";

const CATEGORIES = [
  "Compliance",
  "Financial",
  "Contract",
  "Audit Report",
  "Training",
  "Correspondence",
  "Legal",
  "Other",
];

interface DealerDocument {
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

function getFileIcon(type: string) {
  if (type.includes("pdf")) return <FileText className="w-5 h-5 text-rag-red" />;
  if (type.includes("sheet") || type.includes("excel") || type.includes("csv"))
    return <FileSpreadsheet className="w-5 h-5 text-rag-green" />;
  if (type.includes("word") || type.includes("document"))
    return <FileText className="w-5 h-5 text-primary" />;
  return <File className="w-5 h-5 text-muted-foreground" />;
}

interface Props {
  dealerName: string;
}

export function DealerDocuments({ dealerName }: Props) {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<DealerDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("Other");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const fetchDocuments = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from("dealer_documents")
      .select("*")
      .eq("dealer_name", dealerName)
      .order("created_at", { ascending: false });

    if (!error && data) setDocuments(data as DealerDocument[]);
    setLoading(false);
  }, [dealerName]);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const resetForm = () => {
    setFile(null);
    setCategory("Other");
    setDescription("");
    setTags([]);
    setTagInput("");
    setExpiryDate("");
  };

  const handleUpload = async () => {
    if (!file) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Not authenticated", description: "Please sign in to upload documents.", variant: "destructive" });
      return;
    }

    setUploading(true);
    const filePath = `${user.id}/${dealerName}/${Date.now()}_${file.name}`;

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
      category,
      description: description || null,
      tags,
      expiry_date: expiryDate || null,
    });

    if (dbError) {
      toast({ title: "Save Failed", description: dbError.message, variant: "destructive" });
    } else {
      toast({ title: "Document Uploaded", description: `${file.name} has been allocated to ${dealerName}.` });
      resetForm();
      setDialogOpen(false);
      fetchDocuments();
    }
    setUploading(false);
  };

  const handleDownload = async (doc: DealerDocument) => {
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

  const handleDelete = async (doc: DealerDocument) => {
    await supabase.storage.from("dealer-documents").remove([doc.file_path]);
    const { error } = await supabase.from("dealer_documents").delete().eq("id", doc.id);
    if (!error) {
      toast({ title: "Deleted", description: `${doc.file_name} removed.` });
      fetchDocuments();
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Documents</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {documents.length} document{documents.length !== 1 ? "s" : ""} allocated
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <FileUp className="w-4 h-4" /> Upload
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              {/* File input */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">File</label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.tiff,.bmp"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="bg-background"
                />
                {file && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {file.name} ({formatFileSize(file.size)})
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Description</label>
                <Textarea
                  placeholder="Optional notes about this document..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-background resize-none"
                  rows={2}
                  maxLength={500}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Tags</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    className="bg-background"
                    maxLength={30}
                  />
                  <Button type="button" size="sm" variant="outline" onClick={addTag}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map((t) => (
                      <Badge key={t} variant="secondary" className="gap-1 text-xs">
                        <Tag className="w-3 h-3" />
                        {t}
                        <button onClick={() => removeTag(t)} className="ml-0.5 hover:text-foreground">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Expiry date */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Expiry Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="pl-9 bg-background"
                  />
                </div>
              </div>

              <Button onClick={handleUpload} disabled={!file || uploading} className="w-full gap-2">
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
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            No documents uploaded yet. Click Upload to add files.
          </div>
        ) : (
          documents.map((doc, i) => (
            <div
              key={doc.id}
              className="px-5 py-3.5 flex items-start gap-3 opacity-0 animate-fade-in"
              style={{ animationDelay: `${i * 40}ms`, animationFillMode: "forwards" }}
            >
              <div className="mt-0.5 shrink-0">{getFileIcon(doc.file_type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{doc.file_name}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">{doc.category}</Badge>
                  <span>{formatFileSize(doc.file_size)}</span>
                  <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                  {doc.expiry_date && (
                    <span className={new Date(doc.expiry_date) < new Date() ? "text-rag-red" : ""}>
                      Expires: {new Date(doc.expiry_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {doc.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{doc.description}</p>
                )}
                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {doc.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0 gap-0.5">
                        <Tag className="w-2.5 h-2.5" /> {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDownload(doc)}>
                  <Download className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-rag-red hover:text-rag-red" onClick={() => handleDelete(doc)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
