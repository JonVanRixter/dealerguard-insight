import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, User, Bell, Settings, Activity, HelpCircle, LogOut } from "lucide-react";

export function UserProfileDropdown() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [helpOpen, setHelpOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Logged out successfully" });
    navigate("/auth");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 pl-3 border-l border-border hover:bg-muted/50 rounded-md px-2 py-1 transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground">
              JK
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-foreground leading-tight">Joel Knight</p>
              <p className="text-[11px] text-muted-foreground leading-tight">Lender Admin</p>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => navigate("/settings")} className="gap-2 cursor-pointer">
            <User className="w-4 h-4" /> My Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setNotifOpen(true)} className="gap-2 cursor-pointer">
            <Bell className="w-4 h-4" /> Notifications
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPrefsOpen(true)} className="gap-2 cursor-pointer">
            <Settings className="w-4 h-4" /> Preferences
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActivityOpen(true)} className="gap-2 cursor-pointer">
            <Activity className="w-4 h-4" /> Activity Log
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setHelpOpen(true)} className="gap-2 cursor-pointer">
            <HelpCircle className="w-4 h-4" /> Help & Support
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
            <LogOut className="w-4 h-4" /> Log Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Help & Support Modal */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Help & Support</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Email</p>
              <p className="font-medium text-foreground">support@thecomplianceguys.co.uk</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Phone</p>
              <p className="font-medium text-foreground">01792 926 040</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Knowledge Base</p>
              <p className="font-medium text-primary">docs.thecomplianceguys.co.uk</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Office Hours</p>
              <p className="font-medium text-foreground">Mon – Fri, 9:00 AM – 5:30 PM GMT</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Activity Log Modal */}
      <Dialog open={activityOpen} onOpenChange={setActivityOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>My Activity Log</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm max-h-[400px] overflow-y-auto">
            {[
              { action: "Logged in", time: "Today, 09:14 AM" },
              { action: "Ran audit for Redline Specialist Cars", time: "Today, 09:22 AM" },
              { action: "Updated alert triggers", time: "Yesterday, 4:45 PM" },
              { action: "Exported portfolio CSV", time: "Yesterday, 3:10 PM" },
              { action: "Approved NewStart Motors onboarding", time: "10 Feb 2026, 11:30 AM" },
              { action: "Added QuickCars Ltd to DND list", time: "09 Feb 2026, 2:15 PM" },
              { action: "Uploaded 3 documents for Arnold Clark", time: "08 Feb 2026, 10:00 AM" },
              { action: "Logged in", time: "08 Feb 2026, 09:05 AM" },
            ].map((item, i) => (
              <div key={i} className="flex items-start justify-between py-2 border-b border-border last:border-0">
                <p className="text-foreground">{item.action}</p>
                <p className="text-muted-foreground text-xs shrink-0 ml-4">{item.time}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Notifications Modal */}
      <Dialog open={notifOpen} onOpenChange={setNotifOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Notification Preferences</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            {[
              { label: "Email notifications", defaultOn: true },
              { label: "Push notifications", defaultOn: false },
              { label: "RAG status change alerts", defaultOn: true },
              { label: "Weekly digest summary", defaultOn: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-foreground">{item.label}</span>
                <Switch defaultChecked={item.defaultOn} />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Preferences Modal */}
      <Dialog open={prefsOpen} onOpenChange={setPrefsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Preferences</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-foreground">Dark mode</span>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground">Compact view</span>
              <Switch />
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Date format</p>
              <p className="font-medium text-foreground">DD/MM/YYYY</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Timezone</p>
              <p className="font-medium text-foreground">GMT (London)</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
