import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { AppFooter } from "./AppFooter";
import { useAuth } from "@/contexts/AuthContext";
import { AlertTriangle } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { demoMode } = useAuth();

  return (
    <div className="flex min-h-screen w-full bg-surface">
      <AppSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        {demoMode && (
          <div className="bg-amber-500 text-white text-center py-1.5 px-4 text-sm font-medium flex items-center justify-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            DEMO MODE — Data shown is simulated. No changes will be saved.
          </div>
        )}
        <AppHeader />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
