import { useState, useEffect, useMemo } from "react";
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
  CreditCard,
  ShieldCheck,
  BarChart3,
  FileText,
  Users,
} from "lucide-react";
import { dealers } from "@/data/dealers";

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

  const topDealers = useMemo(() => dealers.slice(0, 50), []);

  const handleSelect = (url: string) => {
    setOpen(false);
    navigate(url);
  };

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

          <CommandGroup heading="Pages">
            {pages.map((page) => (
              <CommandItem
                key={page.url}
                value={`${page.label} ${page.keywords.join(" ")}`}
                onSelect={() => handleSelect(page.url)}
              >
                <page.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{page.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Features">
            {features.map((feat) => (
              <CommandItem
                key={feat.label}
                value={`${feat.label} ${feat.description} ${feat.keywords.join(" ")}`}
                onSelect={() => {
                  if (feat.navigateTo === "dealer") {
                    // Navigate to first dealer as an example entry point
                    handleSelect(`/dealer/${encodeURIComponent(topDealers[0]?.name || "")}`);
                  } else {
                    handleSelect(feat.navigateTo);
                  }
                }}
              >
                <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                <div>
                  <span>{feat.label}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{feat.description}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Dealers">
            {topDealers.map((dealer) => (
              <CommandItem
                key={dealer.name}
                value={`${dealer.name} ${dealer.region} ${dealer.firmType} ${dealer.postcode}`}
                onSelect={() => handleSelect(`/dealer/${encodeURIComponent(dealer.name)}`)}
              >
                <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{dealer.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{dealer.region}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
