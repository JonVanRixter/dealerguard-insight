import {
  LayoutDashboard,
  Building2,
  Bell,
  FileBarChart,
  GitCompare,
  TrendingUp,
  Settings,
  X,
  FolderOpen,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import logo from "@/assets/logo-light.png";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Dealer Portfolio", url: "/dealers", icon: Building2 },
  { title: "Documents", url: "/documents", icon: FolderOpen },
  { title: "Alerts", url: "/alerts", icon: Bell },
  { title: "Reports", url: "/reports", icon: FileBarChart },
  { title: "Comparison", url: "/comparison", icon: GitCompare },
  { title: "Trends", url: "/trends", icon: TrendingUp },
  { title: "Settings", url: "/settings", icon: Settings },
];

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-foreground/30" onClick={onClose} />
      <aside className="relative w-64 h-full bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
          <img src={logo} alt="The Compliance Guys" className="h-8 w-auto" />
          <button onClick={onClose}>
            <X className="w-5 h-5 text-sidebar-muted" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              end={item.url === "/"}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              onClick={onClose}
            >
              <item.icon className="w-[18px] h-[18px]" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </div>
  );
}
