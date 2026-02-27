import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, CheckCircle2, AlertTriangle, XCircle, Plus } from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";

interface Director {
  name: string;
  role: string;
  appointedDate: string;
  nationality: string;
  countryOfResidence: string;
  idCheckDate?: string;
  idCheckStatus?: string;
}

interface SanctionScreening {
  directorName: string;
  sanctionsResult: string;
  pepResult: string;
  adverseMediaResult: string;
  screeningDate: string;
}

interface Props {
  directors: Director[];
  sanctions: SanctionScreening[];
}

function getIdStatus(idCheckDate?: string): { label: string; variant: "pass" | "warn" | "overdue" | "none"; nextDue: string | null } {
  if (!idCheckDate) return { label: "Not recorded", variant: "none", nextDue: null };
  const checkDate = new Date(idCheckDate);
  const nextDue = addDays(checkDate, 365);
  const daysUntil = differenceInDays(nextDue, new Date());

  if (daysUntil < 0) return { label: "Overdue", variant: "overdue", nextDue: format(nextDue, "dd MMM yyyy") };
  if (daysUntil <= 60) return { label: "Due Soon", variant: "warn", nextDue: format(nextDue, "dd MMM yyyy") };
  return { label: "Verified", variant: "pass", nextDue: format(nextDue, "dd MMM yyyy") };
}

function fmtDate(d: string) {
  try { return format(new Date(d), "dd MMM yyyy"); } catch { return d; }
}

export function DirectorIdChecksPanel({ directors, sanctions }: Props) {
  const [dateModal, setDateModal] = useState<{ name: string } | null>(null);
  const [dateValue, setDateValue] = useState("");
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  const handleSaveDate = () => {
    if (dateModal && dateValue) {
      setOverrides((prev) => ({ ...prev, [dateModal.name]: dateValue }));
      setDateModal(null);
      setDateValue("");
    }
  };

  // Find earliest next due for cycle summary
  const allNextDues = directors
    .map((d) => {
      const checkDate = overrides[d.name] || d.idCheckDate;
      if (!checkDate) return null;
      return addDays(new Date(checkDate), 365);
    })
    .filter(Boolean) as Date[];
  const earliestDue = allNextDues.length > 0 ? allNextDues.sort((a, b) => a.getTime() - b.getTime())[0] : null;

  // Latest screening date
  const latestScreening = sanctions.length > 0 ? sanctions[0].screeningDate : null;

  return (
    <>
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-5 h-5 text-primary" />
            DIRECTOR & ID CHECKS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {/* Director table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="text-left py-2 pr-4">Director</th>
                  <th className="text-left py-2 pr-4">ID Check Date</th>
                  <th className="text-left py-2 pr-4">Status</th>
                  <th className="text-left py-2">Next Due</th>
                </tr>
              </thead>
              <tbody>
                {directors.map((d, i) => {
                  const effectiveDate = overrides[d.name] || d.idCheckDate;
                  const status = getIdStatus(effectiveDate);
                  return (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-2.5 pr-4 font-medium">{d.name}</td>
                      <td className="py-2.5 pr-4">
                        {effectiveDate ? fmtDate(effectiveDate) : (
                          <button
                            onClick={() => { setDateModal({ name: d.name }); setDateValue(""); }}
                            className="text-primary hover:underline text-xs inline-flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Record ID check date
                          </button>
                        )}
                      </td>
                      <td className="py-2.5 pr-4">
                        {status.variant === "pass" && (
                          <span className="inline-flex items-center gap-1.5 text-outcome-pass-text">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                          </span>
                        )}
                        {status.variant === "warn" && (
                          <span className="inline-flex items-center gap-1.5 text-outcome-pending-text">
                            <AlertTriangle className="w-3.5 h-3.5" /> Due Soon
                          </span>
                        )}
                        {status.variant === "overdue" && (
                          <span className="inline-flex items-center gap-1.5 text-outcome-fail-text">
                            <XCircle className="w-3.5 h-3.5" /> Overdue
                          </span>
                        )}
                        {status.variant === "none" && (
                          <span className="text-muted-foreground">— Not recorded</span>
                        )}
                      </td>
                      <td className="py-2.5">
                        {status.nextDue || <span className="text-muted-foreground">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cycle summary */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>ID check cycle: <span className="font-medium text-foreground">Annual</span></span>
            <span>·</span>
            <span>Next review due: <span className="font-medium text-foreground">{earliestDue ? format(earliestDue, "dd MMM yyyy") : "—"}</span></span>
          </div>

          {/* Sanctions screening */}
          {sanctions.length > 0 && (
            <div className="border-t pt-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Sanctions screening (most recent)
              </p>
              <div className="space-y-1.5">
                {sanctions.map((s, i) => (
                  <div key={i} className="flex items-center gap-4 flex-wrap">
                    <span className="font-medium w-44 shrink-0">{s.directorName}</span>
                    <span className="text-muted-foreground">Sanctions: {s.sanctionsResult}</span>
                    <span className="text-muted-foreground">PEP: {s.pepResult}</span>
                    <span className={s.adverseMediaResult.includes("Minor") || s.adverseMediaResult.includes("historical") ? "text-outcome-pending-text" : "text-muted-foreground"}>
                      Media: {s.adverseMediaResult}
                    </span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Last screened: {latestScreening ? fmtDate(latestScreening) : "—"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Date entry modal */}
      <Dialog open={!!dateModal} onOpenChange={() => setDateModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record ID Check Date</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Enter the ID check date for <span className="font-medium text-foreground">{dateModal?.name}</span>.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="idCheckDate">ID Check Date</Label>
              <Input
                id="idCheckDate"
                type="date"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDateModal(null)}>Cancel</Button>
            <Button onClick={handleSaveDate} disabled={!dateValue}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
