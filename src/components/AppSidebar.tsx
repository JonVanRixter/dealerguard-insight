import {
  LayoutDashboard,
  Building2,
  Bell,
  FileBarChart,
  GitCompare,
  TrendingUp,
  Settings,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo-light.png";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Dealer Portfolio", url: "/dealers", icon: Building2 },
  { title: "Alerts", url: "/alerts", icon: Bell },
  { title: "Reports", url: "/reports", icon: FileBarChart },
  { title: "Comparison", url: "/comparison", icon: GitCompare },
  { title: "Trends", url: "/trends", icon: TrendingUp },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { signOut } = useAuth();

  return (
    <aside className="hidden md:flex w-60 flex-col bg-sidebar text-sidebar-foreground min-h-screen shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-sidebar-border">
        <img src={logo} alt="The Compliance Guys" className="h-10 w-auto" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === "/"}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          >
            <item.icon className="w-[18px] h-[18px]" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-2">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors w-full"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span>Sign Out</span>
        </button>
      </div>
      <div className="px-5 py-4 border-t border-sidebar-border">
        <p className="text-[11px] text-sidebar-muted">
          © 2026 The Compliance Guys
        </p>
      </div>
    </aside>
  );
}
