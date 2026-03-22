import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import { type AuthSession, useAuth } from "./hooks/useAuth";
import CircularsPage from "./pages/CircularsPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import NoticeBoardPage from "./pages/NoticeBoardPage";
import SettingsPage from "./pages/SettingsPage";
import StudentDetailPage from "./pages/StudentDetailPage";
import StudentsPage from "./pages/StudentsPage";
import StudyMaterialsPage from "./pages/StudyMaterialsPage";
import UsersPage from "./pages/UsersPage";

export type { AuthSession };
export type AppPage =
  | "dashboard"
  | "students"
  | "student-detail"
  | "settings"
  | "users"
  | "notice-board"
  | "circulars"
  | "study-materials";

export interface AppNav {
  currentPage: AppPage;
  navigate: (page: AppPage, params?: Record<string, string>) => void;
  params: Record<string, string>;
  session: AuthSession;
}

export default function App() {
  const { session, login, logout, isInitializing, isLoggingIn } = useAuth();
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

  if (!session) {
    return (
      <>
        <LoginPage login={login} isLoggingIn={isLoggingIn} />
        <Toaster />
      </>
    );
  }

  const nav: AppNav = { currentPage, navigate, params, session };

  const canAccessSettings =
    session.role === "developer" || session.role === "admin";

  const renderPage = () => {
    switch (currentPage) {
      case "students":
        return <StudentsPage nav={nav} />;
      case "student-detail":
        return (
          <StudentDetailPage nav={nav} studentId={params.studentId ?? ""} />
        );
      case "settings":
        return canAccessSettings ? (
          <SettingsPage nav={nav} />
        ) : (
          <DashboardPage nav={nav} />
        );
      case "users":
        return session.role === "developer" ? (
          <UsersPage nav={nav} />
        ) : (
          <DashboardPage nav={nav} />
        );
      case "notice-board":
        return <NoticeBoardPage nav={nav} />;
      case "circulars":
        return <CircularsPage nav={nav} />;
      case "study-materials":
        return <StudyMaterialsPage nav={nav} />;
      default:
        return <DashboardPage nav={nav} />;
    }
  };

  return (
    <Layout nav={nav} logout={logout}>
      {renderPage()}
      <Toaster />
    </Layout>
  );
}
