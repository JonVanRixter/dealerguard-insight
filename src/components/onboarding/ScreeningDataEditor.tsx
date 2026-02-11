import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Check, X, ShieldCheck } from "lucide-react";

const FIELD_CONFIG: { key: string; label: string }[] = [
  { key: "companyRegNo", label: "Company Reg No" },
  { key: "registeredAddress", label: "Registered Address" },
  { key: "vatRegistration", label: "VAT Registration" },
  { key: "creditScore", label: "Credit Score" },
  { key: "fcaFrn", label: "FCA Status" },
  { key: "fcaPermissions", label: "FCA Permissions" },
  { key: "fcaIndividuals", label: "FCA Individuals" },
];

interface Props {
  screeningDataMap: Record<string, string>;
  onUpdate: (updated: Record<string, string>) => void;
}

export function ScreeningDataEditor({ screeningDataMap, onUpdate }: Props) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [overrides, setOverrides] = useState<Set<string>>(new Set());

  const startEdit = (key: string) => {
    setEditingKey(key);
    setEditValue(screeningDataMap[key] || "");
  };

  const confirmEdit = () => {
    if (!editingKey) return;
    const next = { ...screeningDataMap, [editingKey]: editValue };
    setOverrides((prev) => new Set(prev).add(editingKey));
    onUpdate(next);
    setEditingKey(null);
  };

  const cancelEdit = () => setEditingKey(null);

  const visibleFields = FIELD_CONFIG.filter((f) => screeningDataMap[f.key]);

  if (visibleFields.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <CardTitle className="text-base">Collected Screening Data</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">Click the edit icon to manually override any value.</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {visibleFields.map(({ key, label }) => (
            <div key={key} className="rounded-md bg-muted/30 px-3 py-2 group relative">
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                {label}
                {overrides.has(key) && (
                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-auto">Manual</Badge>
                )}
              </p>
              {editingKey === key ? (
                <div className="flex items-center gap-1 mt-1">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="h-7 text-sm"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Enter") confirmEdit(); if (e.key === "Escape") cancelEdit(); }}
                  />
                  <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={confirmEdit}>
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={cancelEdit}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate pr-2">{screeningDataMap[key]}</p>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={() => startEdit(key)}
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
