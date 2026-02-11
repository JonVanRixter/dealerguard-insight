import { useState } from "react";
import { Bell, ArrowRight, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RagBadge } from "./RagBadge";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Notification {
  id: string;
  dealerName: string;
  message: string;
  oldScore: number;
  newScore: number;
  oldRag: "green" | "amber" | "red";
  newRag: "green" | "amber" | "red";
  time: string;
  read: boolean;
}

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    dealerName: "Redline Specialist Cars",
    message: "Score dropped from 78 to 68 — now Amber",
    oldScore: 78,
    newScore: 68,
    oldRag: "green",
    newRag: "amber",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "2",
    dealerName: "Apex Motors Ltd",
    message: "DBS Compliance failed — Score now 45 (Red)",
    oldScore: 62,
    newScore: 45,
    oldRag: "amber",
    newRag: "red",
    time: "5 hours ago",
    read: false,
  },
  {
    id: "3",
    dealerName: "Ocean Car Sales",
    message: "Training certificates expired — Now 72 (Amber)",
    oldScore: 81,
    newScore: 72,
    oldRag: "green",
    newRag: "amber",
    time: "1 day ago",
    read: false,
  },
  {
    id: "4",
    dealerName: "Lookers Manchester",
    message: "FCA permissions review overdue",
    oldScore: 79,
    newScore: 72,
    oldRag: "green",
    newRag: "amber",
    time: "1 day ago",
    read: true,
  },
  {
    id: "5",
    dealerName: "Marsh Motor Group",
    message: "Financial checks flagged — credit score declined",
    oldScore: 65,
    newScore: 58,
    oldRag: "amber",
    newRag: "amber",
    time: "2 days ago",
    read: true,
  },
];

export function NotificationsDropdown() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const [rerunning, setRerunning] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleRerunAudit = (notif: Notification) => {
    setRerunning(notif.id);
    setTimeout(() => {
      setRerunning(null);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
      toast({
        title: "Audit Queued",
        description: `Re-audit queued for ${notif.dealerName}. Results will be available shortly.`,
      });
    }, 1500);
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="w-[18px] h-[18px] text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-rag-red text-[10px] font-bold text-white px-1">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto divide-y divide-border">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`px-4 py-3 transition-colors ${
                notif.read ? "bg-background" : "bg-primary/5"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {notif.dealerName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Score: {notif.oldScore}
                    </span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className={`text-xs font-semibold ${
                      notif.newRag === "red" ? "text-rag-red" : notif.newRag === "amber" ? "text-rag-amber" : "text-rag-green"
                    }`}>
                      {notif.newScore}
                    </span>
                    <RagBadge status={notif.newRag} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{notif.time}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 h-7 text-xs gap-1"
                  disabled={rerunning === notif.id}
                  onClick={() => handleRerunAudit(notif)}
                >
                  {rerunning === notif.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                  Re-run
                </Button>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
