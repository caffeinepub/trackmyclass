import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  BookOpen,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import type { AppNav } from "../App";
import type { AuthSession } from "../hooks/useAuth";

interface LayoutProps {
  nav: AppNav;
  children: React.ReactNode;
  logout: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  developer: "Developer",
  admin: "Admin",
  classTeacher: "Class Teacher",
  teacher: "Teacher",
};

const ROLE_COLORS: Record<string, string> = {
  developer: "bg-purple-600 text-white",
  admin: "bg-blue-600 text-white",
  classTeacher: "bg-green-600 text-white",
  teacher: "bg-gray-500 text-white",
};

function RoleBadge({ session }: { session: AuthSession }) {
  const color = ROLE_COLORS[session.role] ?? "bg-gray-500 text-white";
  const label = ROLE_LABELS[session.role] ?? session.role;
  const classInfo =
    session.role === "classTeacher" && session.assignedClass
      ? ` (Class ${session.assignedClass})`
      : "";
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${color}`}
    >
      {label}
      {classInfo}
    </span>
  );
}

export default function Layout({ nav, children, logout }: LayoutProps) {
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { session } = nav;

  const canAccessSettings =
    session.role === "developer" || session.role === "admin";

  const baseNavLinks = [
    { page: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    { page: "students" as const, label: "Students", icon: Users },
    { page: "notice-board" as const, label: "Notice Board", icon: Bell },
    { page: "circulars" as const, label: "Circulars", icon: FileText },
    {
      page: "study-materials" as const,
      label: "Study Materials",
      icon: BookOpen,
    },
    ...(canAccessSettings
      ? [{ page: "settings" as const, label: "Settings", icon: Settings }]
      : []),
  ];

  const navLinks = [
    ...baseNavLinks,
    ...(session.role === "developer"
      ? [{ page: "users" as const, label: "Users", icon: ShieldCheck }]
      : []),
  ];

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-sidebar border-b border-sidebar-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="md:hidden text-white p-1"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
                <GraduationCap size={16} className="text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <span className="font-display font-semibold text-white text-sm leading-tight block">
                  TrackMyClass
                </span>
                <span className="text-xs text-white/60 leading-tight block">
                  VKV Raga
                </span>
              </div>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ page, label, icon: Icon }) => (
              <button
                type="button"
                key={page}
                data-ocid={`nav.${page}.link`}
                onClick={() => nav.navigate(page)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  nav.currentPage === page
                    ? "bg-sidebar-accent text-white"
                    : "text-white/70 hover:text-white hover:bg-sidebar-accent/50"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </nav>

          {/* User area */}
          <div className="flex items-center gap-2">
            <RoleBadge session={session} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-sidebar-accent text-xs gap-1.5"
                  data-ocid="nav.user.dropdown_menu"
                >
                  <GraduationCap size={14} />
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {session.displayName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-xs text-muted-foreground border-b mb-1">
                  {session.displayName}
                </div>
                <DropdownMenuItem
                  onClick={handleLogout}
                  data-ocid="nav.logout.button"
                >
                  <LogOut size={14} className="mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile dropdown nav */}
        {mobileOpen && (
          <div className="md:hidden bg-sidebar border-t border-sidebar-border px-4 py-2 flex flex-col gap-1">
            {navLinks.map(({ page, label, icon: Icon }) => (
              <button
                type="button"
                key={page}
                onClick={() => {
                  nav.navigate(page);
                  setMobileOpen(false);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium ${
                  nav.currentPage === page
                    ? "bg-sidebar-accent text-white"
                    : "text-white/70 hover:text-white hover:bg-sidebar-accent/50"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="flex flex-col items-center border-t border-border py-4 gap-1">
        <p className="text-xs text-muted-foreground">
          Developed by{" "}
          <strong className="text-foreground">Phanindra Bharali</strong>
        </p>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
