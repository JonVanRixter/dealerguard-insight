import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileUp, FileText, FileSpreadsheet, File, Trash2, Download,
  Loader2, Upload,
} from "lucide-react";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  if (type.includes("pdf")) return <FileText className="w-5 h-5 text-destructive" />;
  if (type.includes("sheet") || type.includes("excel") || type.includes("csv"))
    return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
  if (type.includes("word") || type.includes("document"))
    return <FileText className="w-5 h-5 text-primary" />;
  return <File className="w-5 h-5 text-muted-foreground" />;
}

interface UploadedDoc {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  category: string;
  created_at: string;
}

interface Props {
  dealerName: string;
  category: string;
  compact?: boolean;
}

export function OnboardingDocUpload({ dealerName, category, compact }: Props) {
  const { toast } = useToast();
  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchDocs = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("dealer_documents")
      .select("id, file_name, file_path, file_size, file_type, category, created_at")
      .eq("dealer_name", dealerName)
      .eq("category", category)
      .order("created_at", { ascending: false });
    if (data) setDocs(data as UploadedDoc[]);
    setLoaded(true);
  }, [dealerName, category]);

  // Load on first render
  if (!loaded) fetchDocs();

  const uploadFiles = async (files: FileList | File[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Not authenticated", variant: "destructive" });
      return;
    }
    setUploading(true);
    for (const file of Array.from(files)) {
      const filePath = `${user.id}/${dealerName}/${Date.now()}_${file.name}`;
      const { error: upErr } = await supabase.storage.from("dealer-documents").upload(filePath, file);
      if (upErr) {
        toast({ title: "Upload Failed", description: upErr.message, variant: "destructive" });
        continue;
      }
      await supabase.from("dealer_documents").insert({
        user_id: user.id,
        dealer_name: dealerName,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        category,
      });
    }
    toast({ title: "Uploaded", description: `${Array.from(files).length} file(s) added to ${category}.` });
    setUploading(false);
    fetchDocs();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
  };

  const handleDownload = async (doc: UploadedDoc) => {
    const { data } = await supabase.storage.from("dealer-documents").download(doc.file_path);
    if (!data) return;
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.file_name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (doc: UploadedDoc) => {
    await supabase.storage.from("dealer-documents").remove([doc.file_path]);
    await supabase.from("dealer_documents").delete().eq("id", doc.id);
    fetchDocs();
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
        } ${compact ? "py-3" : "py-6"}`}
      >
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.tiff,.bmp"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Uploading…
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <Upload className="w-5 h-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drag & drop files or <span className="text-primary font-medium">browse</span>
            </p>
          </div>
        )}
      </div>

      {/* File list */}
      {docs.length > 0 && (
        <div className="space-y-1.5">
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
              {getFileIcon(doc.file_type)}
              <span className="flex-1 truncate">{doc.file_name}</span>
              <span className="text-xs text-muted-foreground shrink-0">{formatFileSize(doc.file_size)}</span>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}>
                <Download className="w-3.5 h-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(doc); }}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
