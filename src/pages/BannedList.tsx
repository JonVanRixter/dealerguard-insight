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
import { useAuth } from "@/contexts/AuthContext";
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
  credit_score?: number;
}

const MOCK_BANNED: BannedEntity[] = [
  { id: "m1", entity_type: "dealer", entity_name: "QuickCars Ltd", company_name: "QuickCars Ltd", reason: "FCA authorisation revoked", failed_checks: ["FCA Status", "Credit Score"], banned_at: "2025-11-14", notes: null, credit_score: 18 },
  { id: "m2", entity_type: "dealer", entity_name: "DriveNow Motors", company_name: "DriveNow Motors Ltd", reason: "Phoenixing risk — linked to dissolved entity", failed_checks: ["Phoenixing Analysis", "Director History"], banned_at: "2025-10-28", notes: "Director linked to 2 dissolved companies", credit_score: 25 },
  { id: "m3", entity_type: "dealer", entity_name: "ABC Auto Finance", company_name: "ABC Auto Finance Ltd", reason: "Multiple CCJs registered", failed_checks: ["CCJ Check", "Credit Score", "DBT"], banned_at: "2025-09-15", notes: null, credit_score: 12 },
  { id: "m4", entity_type: "dealer", entity_name: "Premier Vehicle Solutions", company_name: "Premier VS Ltd", reason: "Fraudulent documentation submitted", failed_checks: ["Document Verification", "ID Check"], banned_at: "2025-08-22", notes: "Forged insurance certificate detected", credit_score: 31 },
  { id: "m5", entity_type: "dealer", entity_name: "EasyCar Direct", company_name: "EasyCar Direct Ltd", reason: "Trading while insolvent", failed_checks: ["Company Status", "Credit Score", "Insolvency Check"], banned_at: "2025-07-10", notes: null, credit_score: 5 },
  { id: "m6", entity_type: "dealer", entity_name: "Sunset Autos", company_name: "Sunset Automotive Group", reason: "Undisclosed adverse credit history", failed_checks: ["Credit Score", "CCJ Check"], banned_at: "2025-06-30", notes: null, credit_score: 22 },
  { id: "m7", entity_type: "dealer", entity_name: "Metro Car Sales", company_name: "Metro Car Sales Ltd", reason: "FCA permissions expired — continued trading", failed_checks: ["FCA Permissions", "FCA Status"], banned_at: "2025-06-18", notes: "Continued consumer credit activity after expiry", credit_score: 44 },
  { id: "m8", entity_type: "dealer", entity_name: "ValueDrive UK", company_name: "ValueDrive UK Ltd", reason: "Failed AML screening", failed_checks: ["AML Check", "PEP Screening", "Sanctions"], banned_at: "2025-05-25", notes: null, credit_score: 38 },
  { id: "m9", entity_type: "dealer", entity_name: "Greenfield Motors", company_name: "Greenfield Motors Ltd", reason: "Excessive DBT — 90+ days", failed_checks: ["DBT", "Credit Score"], banned_at: "2025-05-02", notes: "Average DBT 94 days over 12 months", credit_score: 15 },
  { id: "m10", entity_type: "dealer", entity_name: "National Auto Group", company_name: "NAG Trading Ltd", reason: "Director disqualification order", failed_checks: ["Director Check", "Companies House"], banned_at: "2025-04-17", notes: null, credit_score: 28 },
  { id: "m11", entity_type: "dealer", entity_name: "BrightStar Vehicles", company_name: "BrightStar Ltd", reason: "Misrepresentation of financial position", failed_checks: ["Financial Statements", "Credit Score"], banned_at: "2025-03-29", notes: "Inflated revenue figures on application", credit_score: 33 },
  { id: "m12", entity_type: "dealer", entity_name: "CityWide Cars", company_name: "CityWide Automotive Ltd", reason: "No valid insurance cover", failed_checks: ["Insurance Verification", "FCA Requirements"], banned_at: "2025-03-11", notes: null, credit_score: 41 },
  { id: "m13", entity_type: "director", entity_name: "James Hartley", company_name: "QuickCars Ltd", reason: "Bankruptcy order — undisclosed", failed_checks: ["Director Bankruptcy", "ID Verification"], banned_at: "2025-11-14", notes: "Failed to declare 2023 bankruptcy", credit_score: undefined },
  { id: "m14", entity_type: "director", entity_name: "Sarah Mitchell", company_name: "DriveNow Motors Ltd", reason: "Director of 3 dissolved companies in 24 months", failed_checks: ["Phoenixing Analysis", "Director History"], banned_at: "2025-10-28", notes: null, credit_score: undefined },
  { id: "m15", entity_type: "director", entity_name: "Michael O'Brien", company_name: "ABC Auto Finance Ltd", reason: "Outstanding personal CCJs — £85,000", failed_checks: ["Personal CCJ", "Credit Score"], banned_at: "2025-09-15", notes: null, credit_score: undefined },
  { id: "m16", entity_type: "director", entity_name: "David Chen", company_name: "Premier VS Ltd", reason: "Identity fraud — passport mismatch", failed_checks: ["Passport Verification", "ID Check"], banned_at: "2025-08-22", notes: "Name on passport does not match Companies House records", credit_score: undefined },
  { id: "m17", entity_type: "director", entity_name: "Lisa Greenwood", company_name: "EasyCar Direct Ltd", reason: "Disqualified director — 8 year ban", failed_checks: ["Director Disqualification", "Companies House"], banned_at: "2025-07-10", notes: "Ban effective until 2031", credit_score: undefined },
  { id: "m18", entity_type: "director", entity_name: "Robert Taylor", company_name: "Sunset Automotive Group", reason: "PEP — undisclosed political exposure", failed_checks: ["PEP Screening", "AML Check"], banned_at: "2025-06-30", notes: null, credit_score: undefined },
  { id: "m19", entity_type: "director", entity_name: "Karen Walsh", company_name: "Metro Car Sales Ltd", reason: "Failed enhanced due diligence", failed_checks: ["EDD Check", "Source of Wealth"], banned_at: "2025-06-18", notes: "Unable to verify source of funds", credit_score: undefined },
  { id: "m20", entity_type: "director", entity_name: "Andrew Patel", company_name: "ValueDrive UK Ltd", reason: "Sanctions list match", failed_checks: ["Sanctions Screening", "AML Check"], banned_at: "2025-05-25", notes: "Match confirmed with OFSI consolidated list", credit_score: undefined },
];

function getCreditScoreColor(score: number | undefined) {
  if (score === undefined) return "";
  if (score >= 60) return "text-[hsl(142,71%,45%)]";
  if (score >= 40) return "text-[hsl(38,92%,50%)]";
  return "text-destructive";
}

export default function BannedList() {
  const { toast } = useToast();
  const { demoMode } = useAuth();
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
    if (demoMode) {
      setEntities(MOCK_BANNED);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("banned_entities")
      .select("*")
      .order("banned_at", { ascending: false });
    if (data) setEntities(data as BannedEntity[]);
    setLoading(false);
  };

  useEffect(() => { fetchEntities(); }, [demoMode]);

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
              {demoMode && e.credit_score !== undefined ? (
                <span className={`font-semibold ${getCreditScoreColor(e.credit_score)}`}>{e.credit_score}/100</span>
              ) : (
                <CreditSafeSearch defaultSearch={e.entity_name} companyNumber={e.company_name || undefined} variant="score-only" />
              )}
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
