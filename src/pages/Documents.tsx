import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Search,
  FileText,
  FileSpreadsheet,
  File,
  Download,
  Trash2,
  Tag,
  ExternalLink,
  FolderOpen,
  FileUp,
  Calendar,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { dealers } from "@/data/dealers";

const CATEGORIES = ["All", "Compliance", "Financial", "Contract", "Audit Report", "Training", "Correspondence", "Legal", "Other"];
const UPLOAD_CATEGORIES = CATEGORIES.filter((c) => c !== "All");
const allDealerNames = dealers.map((d) => d.name).sort();

interface DealerDocument {
  id: string;
  dealer_name: string;
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

const MOCK_DOCUMENTS: DealerDocument[] = [
  { id: "m1", dealer_name: "Redline Specialist Cars", file_name: "Redline Specialist Cars - Audit Report - Feb 2026.pdf", file_path: "", file_size: 251000, file_type: "application/pdf", category: "Audit Report", description: "Full compliance audit report", tags: ["audit", "feb-2026"], expiry_date: null, created_at: "2026-02-07T10:00:00Z" },
  { id: "m2", dealer_name: "Apex Motors Ltd", file_name: "Apex Motors - Audit Report - Feb 2026.pdf", file_path: "", file_size: 319000, file_type: "application/pdf", category: "Audit Report", description: "Full compliance audit report", tags: ["audit", "feb-2026"], expiry_date: null, created_at: "2026-02-08T09:00:00Z" },
  { id: "m3", dealer_name: "Stratstone BMW", file_name: "Stratstone BMW - Audit Report - Feb 2026.pdf", file_path: "", file_size: 198000, file_type: "application/pdf", category: "Audit Report", description: "Full compliance audit report", tags: ["audit", "feb-2026"], expiry_date: null, created_at: "2026-02-05T14:00:00Z" },
  { id: "m4", dealer_name: "Portfolio", file_name: "Portfolio Compliance Summary - Q1 2026.pdf", file_path: "", file_size: 1228800, file_type: "application/pdf", category: "Compliance", description: "Quarterly portfolio compliance summary", tags: ["compliance", "q1-2026"], expiry_date: null, created_at: "2026-02-01T08:00:00Z" },
  { id: "m5", dealer_name: "Portfolio", file_name: "FCA Compliance Pack - Jan 2026.xlsx", file_path: "", file_size: 467000, file_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", category: "Compliance", description: "FCA regulatory compliance pack", tags: ["fca", "jan-2026"], expiry_date: null, created_at: "2026-01-31T16:00:00Z" },
  { id: "m6", dealer_name: "Portfolio", file_name: "Monthly Risk Dashboard - Feb 2026.pdf", file_path: "", file_size: 890000, file_type: "application/pdf", category: "Compliance", description: "Monthly risk analysis dashboard", tags: ["risk", "feb-2026"], expiry_date: null, created_at: "2026-02-08T11:00:00Z" },
  { id: "m7", dealer_name: "Lookers Manchester", file_name: "Amber Dealers - Action Plan.docx", file_path: "", file_size: 79800, file_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", category: "Compliance", description: "Action plan for amber-rated dealers", tags: ["action-plan", "amber"], expiry_date: null, created_at: "2026-02-07T13:00:00Z" },
  { id: "m8", dealer_name: "NewStart Motors", file_name: "NewStart Motors - Onboarding Checklist.pdf", file_path: "", file_size: 234000, file_type: "application/pdf", category: "Other", description: "Onboarding checklist for new dealer", tags: ["onboarding"], expiry_date: null, created_at: "2026-02-10T10:00:00Z" },
  { id: "m9", dealer_name: "Arnold Clark Glasgow", file_name: "Arnold Clark - Training Certificates.pdf", file_path: "", file_size: 456000, file_type: "application/pdf", category: "Training", description: "Staff training completion certificates", tags: ["training", "certificates"], expiry_date: "2027-02-01", created_at: "2026-01-20T09:00:00Z" },
  { id: "m10", dealer_name: "Evans Halshaw", file_name: "Evans Halshaw - Insurance Certificate 2026.pdf", file_path: "", file_size: 187000, file_type: "application/pdf", category: "Compliance", description: "Motor trade insurance certificate", tags: ["insurance"], expiry_date: "2027-01-15", created_at: "2026-01-15T10:00:00Z" },
  { id: "m11", dealer_name: "Shirlaws Limited", file_name: "Shirlaws - Enhanced Due Diligence Report.pdf", file_path: "", file_size: 345000, file_type: "application/pdf", category: "Compliance", description: "Enhanced due diligence for high-risk dealer", tags: ["edd", "high-risk"], expiry_date: null, created_at: "2026-02-05T15:00:00Z" },
  { id: "m12", dealer_name: "Thurlby Motors", file_name: "Thurlby Motors - Financial Statements 2025.xlsx", file_path: "", file_size: 523000, file_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", category: "Financial", description: "Annual financial statements", tags: ["financial", "2025"], expiry_date: null, created_at: "2026-01-28T11:00:00Z" },
];

const Documents = () => {
  const { demoMode } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<DealerDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dealerFilter, setDealerFilter] = useState(searchParams.get("dealer") || "All");

  // Upload form state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [uploadDealer, setUploadDealer] = useState("");
  const [uploadCategory, setUploadCategory] = useState("Other");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadTags, setUploadTags] = useState<string[]>([]);
  const [uploadTagInput, setUploadTagInput] = useState("");
  const [uploadExpiry, setUploadExpiry] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles);
    setUploadFiles((prev) => {
      const existing = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const unique = arr.filter((f) => !existing.has(`${f.name}-${f.size}`));
      return [...prev, ...unique];
    });
  };

  const removeFile = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const resetUploadForm = () => {
    setUploadFiles([]);
    setUploadProgress({ current: 0, total: 0 });
    setUploadDealer("");
    setUploadCategory("Other");
    setUploadDescription("");
    setUploadTags([]);
    setUploadTagInput("");
    setUploadExpiry("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addUploadTag = () => {
    const t = uploadTagInput.trim();
    if (t && !uploadTags.includes(t) && uploadTags.length < 10) {
      setUploadTags([...uploadTags, t]);
      setUploadTagInput("");
    }
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0 || !uploadDealer) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Not authenticated", description: "Please sign in to upload documents.", variant: "destructive" });
      return;
    }
    setUploading(true);
    const total = uploadFiles.length;
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < total; i++) {
      const file = uploadFiles[i];
      setUploadProgress({ current: i + 1, total });
      const filePath = `${user.id}/${uploadDealer}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("dealer-documents").upload(filePath, file);
      if (uploadError) {
        failCount++;
        continue;
      }
      const { error: dbError } = await supabase.from("dealer_documents").insert({
        user_id: user.id,
        dealer_name: uploadDealer,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        category: uploadCategory,
        description: uploadDescription || null,
        tags: uploadTags,
        expiry_date: uploadExpiry || null,
      });
      if (dbError) failCount++;
      else successCount++;
    }

    if (successCount > 0) {
      toast({
        title: "Upload Complete",
        description: `${successCount} file${successCount > 1 ? "s" : ""} uploaded to ${uploadDealer}.${failCount > 0 ? ` ${failCount} failed.` : ""}`,
      });
      resetUploadForm();
      setUploadOpen(false);
      fetchDocuments();
    } else {
      toast({ title: "Upload Failed", description: `All ${failCount} file(s) failed to upload.`, variant: "destructive" });
    }
    setUploading(false);
  };

  const fetchDocuments = useCallback(async () => {
    if (demoMode) {
      setDocuments(MOCK_DOCUMENTS);
      setLoading(false);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data, error } = await supabase
      .from("dealer_documents")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setDocuments(data as DealerDocument[]);
    setLoading(false);
  }, [demoMode]);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const dealerNames = useMemo(
    () => ["All", ...Array.from(new Set(documents.map((d) => d.dealer_name))).sort()],
    [documents]
  );

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.dealer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.tags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = categoryFilter === "All" || doc.category === categoryFilter;
      const matchesDealer = dealerFilter === "All" || doc.dealer_name === dealerFilter;
      return matchesSearch && matchesCategory && matchesDealer;
    });
  }, [documents, searchQuery, categoryFilter, dealerFilter]);

  const handleDownload = async (doc: DealerDocument) => {
    const { data, error } = await supabase.storage
      .from("dealer-documents")
      .download(doc.file_path);
    if (error || !data) {
      toast({ title: "Download Failed", variant: "destructive" });
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

  const expiredCount = documents.filter((d) => d.expiry_date && new Date(d.expiry_date) < new Date()).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Documents</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Browse all uploaded documents across your dealer network.
            </p>
          </div>
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5">
                <FileUp className="w-4 h-4" /> Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                {/* Dealer selector */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Dealer</label>
                  <Select value={uploadDealer} onValueChange={setUploadDealer}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select a dealer..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {allDealerNames.map((name) => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* File input with drag-and-drop */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    Files {uploadFiles.length > 0 && <span className="text-muted-foreground font-normal">({uploadFiles.length} selected)</span>}
                  </label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.dataset.dragging = "true"; }}
                    onDragLeave={(e) => { e.preventDefault(); e.currentTarget.dataset.dragging = "false"; }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.dataset.dragging = "false";
                      if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
                    }}
                    className="relative border-2 border-dashed border-border rounded-lg p-6 text-center transition-colors hover:border-primary/50 data-[dragging=true]:border-primary data-[dragging=true]:bg-primary/5 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.tiff,.bmp"
                      onChange={(e) => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ""; }}
                      className="hidden"
                    />
                    <div className="space-y-1">
                      <FileUp className="w-8 h-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Drag & drop files here, or <span className="text-primary font-medium">browse</span>
                      </p>
                      <p className="text-xs text-muted-foreground">PDF, Word, Excel, CSV, images — select multiple files</p>
                    </div>
                  </div>
                  {uploadFiles.length > 0 && (
                    <div className="mt-2 max-h-32 overflow-y-auto space-y-1 rounded-md border border-border p-2">
                      {uploadFiles.map((file, i) => (
                        <div key={`${file.name}-${i}`} className="flex items-center gap-2 text-sm py-1 px-1 rounded hover:bg-muted/50">
                          <div className="shrink-0">{getFileIcon(file.type)}</div>
                          <span className="truncate flex-1 text-foreground">{file.name}</span>
                          <span className="text-xs text-muted-foreground shrink-0">{formatFileSize(file.size)}</span>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-5 w-5 shrink-0"
                            onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Category */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Category</label>
                  <Select value={uploadCategory} onValueChange={setUploadCategory}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UPLOAD_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Description */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Description</label>
                  <Textarea
                    placeholder="Optional notes about these documents..."
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
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
                      value={uploadTagInput}
                      onChange={(e) => setUploadTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUploadTag())}
                      className="bg-background"
                      maxLength={30}
                    />
                    <Button type="button" size="sm" variant="outline" onClick={addUploadTag}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {uploadTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {uploadTags.map((t) => (
                        <Badge key={t} variant="secondary" className="gap-1 text-xs">
                          <Tag className="w-3 h-3" />
                          {t}
                          <button onClick={() => setUploadTags(uploadTags.filter((x) => x !== t))} className="ml-0.5 hover:text-foreground">
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
                      value={uploadExpiry}
                      onChange={(e) => setUploadExpiry(e.target.value)}
                      className="pl-9 bg-background"
                    />
                  </div>
                </div>
                {uploading && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Uploading file {uploadProgress.current} of {uploadProgress.total}...</span>
                      <span>{Math.round((uploadProgress.current / uploadProgress.total) * 100)}%</span>
                    </div>
                    <Progress value={(uploadProgress.current / uploadProgress.total) * 100} className="h-2" />
                  </div>
                )}
                <Button onClick={handleUpload} disabled={uploadFiles.length === 0 || !uploadDealer || uploading} className="w-full gap-2">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
                  {uploading ? `Uploading ${uploadProgress.current}/${uploadProgress.total}...` : `Upload ${uploadFiles.length > 1 ? `${uploadFiles.length} Documents` : "Document"}`}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <FolderOpen className="w-4 h-4" />
              Total Documents
            </div>
            <span className="text-3xl font-bold text-foreground">{documents.length}</span>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <FileText className="w-4 h-4" />
              Dealers with Docs
            </div>
            <span className="text-3xl font-bold text-foreground">
              {new Set(documents.map((d) => d.dealer_name)).size}
            </span>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <Tag className="w-4 h-4" />
              Categories Used
            </div>
            <span className="text-3xl font-bold text-foreground">
              {new Set(documents.map((d) => d.category)).size}
            </span>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <FileText className="w-4 h-4 text-rag-red" />
              Expired
            </div>
            <span className={`text-3xl font-bold ${expiredCount > 0 ? "text-rag-red" : "text-foreground"}`}>
              {expiredCount}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by file name, dealer, description, or tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-background"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-40 h-9 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dealerFilter} onValueChange={setDealerFilter}>
                <SelectTrigger className="w-full sm:w-48 h-9 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dealerNames.map((d) => (
                    <SelectItem key={d} value={d}>{d === "All" ? "All Dealers" : d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Document list */}
          <div className="divide-y divide-border">
            {loading ? (
              <div className="px-5 py-12 text-center text-sm text-muted-foreground">Loading documents...</div>
            ) : filtered.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                {documents.length === 0
                  ? "No documents uploaded yet. Upload documents from individual dealer pages."
                  : "No documents match your filters."}
              </div>
            ) : (
              filtered.map((doc, i) => (
                <div
                  key={doc.id}
                  className="px-5 py-3.5 flex items-start gap-3 opacity-0 animate-fade-in"
                  style={{ animationDelay: `${Math.min(i, 20) * 30}ms`, animationFillMode: "forwards" }}
                >
                  <div className="mt-0.5 shrink-0">{getFileIcon(doc.file_type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{doc.file_name}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <button
                        onClick={() => navigate(`/dealer/${encodeURIComponent(doc.dealer_name)}`)}
                        className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                      >
                        {doc.dealer_name}
                        <ExternalLink className="w-3 h-3" />
                      </button>
                      <Badge variant="outline" className="text-xs">{doc.category}</Badge>
                      <span>{formatFileSize(doc.file_size)}</span>
                      <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                      {doc.expiry_date && (
                        <span className={new Date(doc.expiry_date) < new Date() ? "text-rag-red font-medium" : ""}>
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
      </div>
    </DashboardLayout>
  );
};

export default Documents;
