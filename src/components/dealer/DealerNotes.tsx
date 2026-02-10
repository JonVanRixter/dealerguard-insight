import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  StickyNote,
  Send,
  Trash2,
  Pencil,
  X,
  Check,
  User,
  Clock,
} from "lucide-react";

interface DealerNote {
  id: string;
  dealer_name: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author_name?: string;
}

interface DealerNotesProps {
  dealerName: string;
}

export function DealerNotes({ dealerName }: DealerNotesProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<DealerNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const fetchNotes = useCallback(async () => {
    const { data, error } = await supabase
      .from("dealer_notes")
      .select("*, profiles!dealer_notes_user_id_fkey(display_name)")
      .eq("dealer_name", dealerName)
      .order("created_at", { ascending: false });

    if (error) {
      // Fallback without join if FK doesn't exist
      const { data: fallbackData } = await supabase
        .from("dealer_notes")
        .select("*")
        .eq("dealer_name", dealerName)
        .order("created_at", { ascending: false });
      setNotes(fallbackData || []);
    } else {
      setNotes(
        (data || []).map((n: any) => ({
          ...n,
          author_name: n.profiles?.display_name || undefined,
        }))
      );
    }
    setLoading(false);
  }, [dealerName]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleAddNote = async () => {
    if (!newNote.trim() || !user) return;
    setSubmitting(true);

    const { error } = await supabase.from("dealer_notes").insert({
      dealer_name: dealerName,
      user_id: user.id,
      content: newNote.trim(),
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add note. Please try again.",
        variant: "destructive",
      });
    } else {
      setNewNote("");
      toast({ title: "Note Added", description: "Your note has been saved." });
      fetchNotes();
    }
    setSubmitting(false);
  };

  const handleDeleteNote = async (id: string) => {
    const { error } = await supabase.from("dealer_notes").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete note.",
        variant: "destructive",
      });
    } else {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      toast({ title: "Note Deleted" });
    }
  };

  const handleStartEdit = (note: DealerNote) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editContent.trim()) return;

    const { error } = await supabase
      .from("dealer_notes")
      .update({ content: editContent.trim() })
      .eq("id", editingId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update note.",
        variant: "destructive",
      });
    } else {
      setEditingId(null);
      setEditContent("");
      toast({ title: "Note Updated" });
      fetchNotes();
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const wasEdited = (note: DealerNote) => {
    return new Date(note.updated_at).getTime() - new Date(note.created_at).getTime() > 1000;
  };

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Notes</h3>
        </div>
        <span className="text-xs text-muted-foreground">{notes.length} note{notes.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Add Note Form */}
        {user && (
          <div className="flex gap-2">
            <Textarea
              placeholder="Add a note about this dealer..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[72px] bg-background resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAddNote();
              }}
            />
            <Button
              onClick={handleAddNote}
              disabled={!newNote.trim() || submitting}
              size="sm"
              className="h-auto px-3 self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/20 border border-border space-y-2">
                <div className="flex gap-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        )}

        {/* Notes List */}
        {!loading && notes.length === 0 && (
          <div className="text-center py-6">
            <StickyNote className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No notes yet. Add a note above.</p>
          </div>
        )}

        {!loading && notes.length > 0 && (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {notes.map((note) => (
              <div
                key={note.id}
                className="group p-3 rounded-lg bg-muted/20 border border-border hover:border-border/80 transition-colors"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium">
                      <User className="w-3 h-3" />
                      {note.author_name || user?.email || "Unknown"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(note.created_at)}
                    </span>
                    {wasEdited(note) && (
                      <span className="italic text-muted-foreground/70">(edited)</span>
                    )}
                  </div>

                  {/* Actions (only for own notes) */}
                  {user?.id === note.user_id && editingId !== note.id && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleStartEdit(note)}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Content */}
                {editingId === note.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[60px] bg-background resize-none text-sm"
                    />
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="w-3 h-3 mr-1" /> Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={handleSaveEdit}
                        disabled={!editContent.trim()}
                      >
                        <Check className="w-3 h-3 mr-1" /> Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
