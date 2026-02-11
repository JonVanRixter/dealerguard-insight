import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreditSafeSearch } from "@/components/onboarding/CreditSafeSearch";
import {
  ShieldBan, Plus, Trash2, Building2, User, Search, AlertTriangle,
} from "lucide-react";

interface BannedEntity {
  id: string;
  entity_type: string;
  entity_name: string;
  company_name: string | null;
  reason: string;
  failed_checks: string[];
  banned_at: string;
  notes: string | null;
}

export default function BannedList() {
  const { toast } = useToast();
  const [entities, setEntities] = useState<BannedEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form
  const [form, setForm] = useState({
    entity_type: "dealer" as string,
    entity_name: "",
    company_name: "",
    reason: "",
    notes: "",
  });

  const fetchEntities = async () => {
    const { data } = await supabase
      .from("banned_entities")
      .select("*")
      .order("banned_at", { ascending: false });
    if (data) setEntities(data as BannedEntity[]);
    setLoading(false);
  };

  useEffect(() => { fetchEntities(); }, []);

  const handleAdd = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("banned_entities").insert({
      ...form,
      company_name: form.company_name || null,
      notes: form.notes || null,
      banned_by: user.id,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Entity Banned", description: `${form.entity_name} added to banned list.` });
      setForm({ entity_type: "dealer", entity_name: "", company_name: "", reason: "", notes: "" });
      setDialogOpen(false);
      fetchEntities();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("banned_entities").delete().eq("id", id);
    fetchEntities();
  };

  const filtered = entities.filter((e) => {
    const q = search.toLowerCase();
    return !q || e.entity_name.toLowerCase().includes(q) || (e.company_name || "").toLowerCase().includes(q) || e.reason.toLowerCase().includes(q);
  });

  const dealers = filtered.filter((e) => e.entity_type === "dealer");
  const directors = filtered.filter((e) => e.entity_type === "director");

  const renderTable = (items: BannedEntity[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Credit Score</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Date Banned</TableHead>
          <TableHead>Failed Checks</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No entries found.</TableCell></TableRow>
        ) : items.map((e) => (
          <TableRow key={e.id}>
            <TableCell className="font-medium">{e.entity_name}</TableCell>
            <TableCell>{e.company_name || "—"}</TableCell>
            <TableCell>
              <CreditSafeSearch defaultSearch={e.entity_name} companyNumber={e.company_name || undefined} variant="score-only" />
            </TableCell>
            <TableCell>
              <span className="text-sm">{e.reason}</span>
              {e.notes && <p className="text-xs text-muted-foreground mt-0.5">{e.notes}</p>}
            </TableCell>
            <TableCell className="text-sm">{new Date(e.banned_at).toLocaleDateString()}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {(e.failed_checks || []).map((c) => (
                  <Badge key={c} variant="destructive" className="text-[10px]">{c}</Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(e.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <ShieldBan className="w-6 h-6 text-destructive" /> Banned List
            </h1>
            <p className="text-muted-foreground mt-1">
              Dealers and directors who have failed checks or been flagged — {entities.length} total entries.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> Add Entry</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Add to Banned List</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label>Type</Label>
                  <Select value={form.entity_type} onValueChange={(v) => setForm({ ...form, entity_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dealer">Dealer</SelectItem>
                      <SelectItem value="director">Director</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{form.entity_type === "dealer" ? "Dealer Name" : "Director Name"}</Label>
                  <Input value={form.entity_name} onChange={(e) => setForm({ ...form, entity_name: e.target.value })} />
                </div>
                <div>
                  <Label>Company Name</Label>
                  <Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} placeholder="Optional" />
                </div>
                <div>
                  <Label>Reason for Ban</Label>
                  <Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={2} />
                </div>
                <div>
                  <Label>Additional Notes</Label>
                  <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Optional" />
                </div>
                <Button onClick={handleAdd} disabled={!form.entity_name || !form.reason} className="w-full">
                  Add to Banned List
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search banned list…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <Tabs defaultValue="dealers" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dealers" className="gap-2">
              <Building2 className="w-4 h-4" /> Dealers ({dealers.length})
            </TabsTrigger>
            <TabsTrigger value="directors" className="gap-2">
              <User className="w-4 h-4" /> Directors ({directors.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dealers">
            <Card>
              <CardContent className="p-0">{renderTable(dealers)}</CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="directors">
            <Card>
              <CardContent className="p-0">{renderTable(directors)}</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
