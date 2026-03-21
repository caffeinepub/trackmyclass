import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { GraduationCap, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";
import StudentDetailPage from "./pages/StudentDetailPage";
import StudentsPage from "./pages/StudentsPage";

export type AppPage = "dashboard" | "students" | "student-detail" | "settings";

export interface AppNav {
  currentPage: AppPage;
  navigate: (page: AppPage, params?: Record<string, string>) => void;
  params: Record<string, string>;
}

function ProtectedMessage({
  login,
  isLoggingIn,
}: { login: () => void; isLoggingIn: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <Lock size={32} className="text-primary" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">
          Login Required
        </h2>
        <p className="text-muted-foreground max-w-sm">
          Please log in to access student records, dashboard analytics, and
          settings.
        </p>
      </div>
      <Button
        onClick={login}
        disabled={isLoggingIn}
        className="gap-2"
        data-ocid="protected.login.button"
      >
        <GraduationCap size={16} />
        {isLoggingIn ? "Connecting…" : "Login to TrackMyClass"}
      </Button>
    </div>
  );
}

export default function App() {
  const { identity, isInitializing, login, isLoggingIn } =
    useInternetIdentity();
  const [currentPage, setCurrentPage] = useState<AppPage>("dashboard");
  const [params, setParams] = useState<Record<string, string>>({});

  useEffect(() => {
    document.title = "TrackMyClass — VKV Raga";
  }, []);

  const navigate = (page: AppPage, newParams?: Record<string, string>) => {
    setCurrentPage(page);
    setParams(newParams ?? {});
  };

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading TrackMyClass…</p>
        </div>
      </div>
    );
  }

  const nav: AppNav = { currentPage, navigate, params };

  const renderPage = () => {
    if (!identity) {
      return <ProtectedMessage login={login} isLoggingIn={isLoggingIn} />;
    }
    switch (currentPage) {
      case "students":
        return <StudentsPage nav={nav} />;
      case "student-detail":
        return (
          <StudentDetailPage nav={nav} studentId={params.studentId ?? ""} />
        );
      case "settings":
        return <SettingsPage nav={nav} />;
      default:
        return <DashboardPage nav={nav} />;
    }
  };

  return (
    <Layout nav={nav}>
      {renderPage()}
      <Toaster />
    </Layout>
  );
}
