import { Bell, ChevronDown, Menu } from "lucide-react";
import { useState } from "react";
import { MobileSidebar } from "./MobileSidebar";

export function AppHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-base font-semibold text-foreground">
            Dealer Risk Platform
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
            <Bell className="w-[18px] h-[18px] text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rag-red rounded-full" />
          </button>
          <div className="flex items-center gap-2 pl-3 border-l border-border">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground">
              JK
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-foreground leading-tight">Joel Knight</p>
              <p className="text-[11px] text-muted-foreground leading-tight">Lender Admin</p>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
          </div>
        </div>
      </header>

      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
