import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Building2,
  Bell,
  FileBarChart,
  GitCompare,
  TrendingUp,
  Settings,
  FolderOpen,
  Search,
  Clock,
  X,
  Zap,
  Navigation,
} from "lucide-react";
import { dealers } from "@/data/dealers";

const RECENT_SEARCHES_KEY = "global-search-recent";
const MAX_RECENT = 8;

interface RecentItem {
  label: string;
  url: string;
  timestamp: number;
}

function loadRecent(): RecentItem[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecent(items: RecentItem[]) {
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(items.slice(0, MAX_RECENT)));
}

const pages = [
  { label: "Dashboard", url: "/", icon: LayoutDashboard, keywords: ["home", "overview", "portfolio", "summary"] },
  { label: "Dealer Portfolio", url: "/dealers", icon: Building2, keywords: ["dealers", "list", "table", "firms"] },
  { label: "Documents", url: "/documents", icon: FolderOpen, keywords: ["files", "uploads", "storage"] },
  { label: "Alerts", url: "/alerts", icon: Bell, keywords: ["warnings", "critical", "red", "amber", "notifications"] },
  { label: "Reports", url: "/reports", icon: FileBarChart, keywords: ["pdf", "export", "compliance", "download"] },
  { label: "Comparison", url: "/comparison", icon: GitCompare, keywords: ["compare", "benchmark", "side by side"] },
  { label: "Trends", url: "/trends", icon: TrendingUp, keywords: ["analytics", "history", "performance", "chart"] },
  { label: "Settings", url: "/settings", icon: Settings, keywords: ["preferences", "config", "theme", "notifications"] },
];

const features = [
  { label: "CreditSafe Report", description: "Credit scores, phoenixing analysis & financial data", keywords: ["credit", "creditsafe", "score", "phoenix", "ccj", "dbt", "risk", "financial"], navigateTo: "dealer" },
  { label: "AI Audit Summary", description: "Generate AI-powered compliance summaries", keywords: ["ai", "summary", "audit", "generate", "compliance", "gpt"], navigateTo: "dealer" },
  { label: "Customer Sentiment Score", description: "CSS reputation, visibility & performance gauges", keywords: ["sentiment", "css", "customer", "reputation", "visibility", "performance", "gauge"], navigateTo: "dealer" },
  { label: "Compliance PDF Export", description: "Download branded compliance reports", keywords: ["pdf", "export", "download", "report", "print"], navigateTo: "/reports" },
  { label: "Batch AI Summaries", description: "Generate summaries for multiple dealers at once", keywords: ["batch", "bulk", "multiple", "mass", "ai"], navigateTo: "/dealers" },
  { label: "Recheck Schedule", description: "Monthly dealer recheck timeline", keywords: ["recheck", "schedule", "timeline", "due", "monthly"], navigateTo: "dealer" },
  { label: "Score Distribution", description: "Portfolio score distribution chart", keywords: ["distribution", "chart", "histogram", "scores"], navigateTo: "/" },
  { label: "Top Risk Dealers", description: "Dealers with lowest compliance scores", keywords: ["risk", "worst", "lowest", "bottom", "failing"], navigateTo: "/" },
  { label: "Regional Summary", description: "Compliance breakdown by region", keywords: ["region", "regional", "area", "geography", "location"], navigateTo: "/" },
  { label: "Alert Thresholds", description: "Configure RAG score thresholds", keywords: ["threshold", "rag", "green", "amber", "red", "limits"], navigateTo: "/settings" },
  { label: "Phoenixing Detection", description: "Flag businesses that may be phoenixing", keywords: ["phoenix", "phoenixing", "dissolved", "liquidat", "insolvency", "fraud"], navigateTo: "dealer" },
];

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [recentItems, setRecentItems] = useState<RecentItem[]>(loadRecent);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Reload recent when dialog opens
  useEffect(() => {
    if (open) setRecentItems(loadRecent());
  }, [open]);

  const topDealers = useMemo(() => dealers.slice(0, 50), []);

  const addRecent = useCallback((label: string, url: string) => {
    const updated = [{ label, url, timestamp: Date.now() }, ...loadRecent().filter((r) => r.url !== url)].slice(0, MAX_RECENT);
    saveRecent(updated);
    setRecentItems(updated);
  }, []);

  const removeRecent = useCallback((url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = loadRecent().filter((r) => r.url !== url);
    saveRecent(updated);
    setRecentItems(updated);
  }, []);

  const clearAllRecent = useCallback(() => {
    saveRecent([]);
    setRecentItems([]);
  }, []);

  const handleSelect = useCallback((label: string, url: string) => {
    addRecent(label, url);
    setOpen(false);
    navigate(url);
  }, [addRecent, navigate]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-sm text-muted-foreground w-56"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages, dealers, features..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {recentItems.length > 0 && (
            <>
              <CommandGroup heading={
                <div className="flex items-center justify-between w-full">
                  <span>Recent</span>
                  <button
                    onClick={clearAllRecent}
                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors font-normal"
                  >
                    Clear all
                  </button>
                </div>
              }>
                {recentItems.map((item) => (
                  <CommandItem
                    key={item.url + item.timestamp}
                    value={`recent ${item.label}`}
                    onSelect={() => handleSelect(item.label, item.url)}
                  >
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{item.label}</span>
                    <button
                      className="ml-auto p-0.5 rounded hover:bg-muted-foreground/20 transition-colors"
                      onClick={(e) => removeRecent(item.url, e)}
                    >
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          <CommandGroup heading={
            <div className="flex items-center justify-between w-full">
              <span className="flex items-center gap-1.5">
                <Navigation className="w-3 h-3" />
                Pages
              </span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">{pages.length}</Badge>
            </div>
          }>
            {pages.map((page) => (
              <CommandItem
                key={page.url}
                value={`${page.label} ${page.keywords.join(" ")}`}
                onSelect={() => handleSelect(page.label, page.url)}
              >
                <page.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{page.label}</span>
                <Badge variant="outline" className="ml-auto text-[9px] px-1.5 py-0 h-4 font-normal text-muted-foreground">Page</Badge>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading={
            <div className="flex items-center justify-between w-full">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3 h-3" />
                Features
              </span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">{features.length}</Badge>
            </div>
          }>
            {features.map((feat) => (
              <CommandItem
                key={feat.label}
                value={`${feat.label} ${feat.description} ${feat.keywords.join(" ")}`}
                onSelect={() => {
                  const url = feat.navigateTo === "dealer"
                    ? `/dealer/${encodeURIComponent(topDealers[0]?.name || "")}`
                    : feat.navigateTo;
                  handleSelect(feat.label, url);
                }}
              >
                <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <span>{feat.label}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{feat.description}</span>
                </div>
                <Badge variant="outline" className="ml-2 shrink-0 text-[9px] px-1.5 py-0 h-4 font-normal text-muted-foreground">Feature</Badge>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading={
            <div className="flex items-center justify-between w-full">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3 h-3" />
                Dealers
              </span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">{topDealers.length}</Badge>
            </div>
          }>
            {topDealers.map((dealer) => (
              <CommandItem
                key={dealer.name}
                value={`${dealer.name} ${dealer.region} ${dealer.firmType} ${dealer.postcode}`}
                onSelect={() => handleSelect(dealer.name, `/dealer/${encodeURIComponent(dealer.name)}`)}
              >
                <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{dealer.name}</span>
                <Badge variant="outline" className="ml-auto text-[9px] px-1.5 py-0 h-4 font-normal text-muted-foreground">{dealer.firmType}</Badge>
                <span className="ml-1.5 text-xs text-muted-foreground">{dealer.region}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
