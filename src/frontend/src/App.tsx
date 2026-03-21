import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import StudentDetailPage from "./pages/StudentDetailPage";
import StudentsPage from "./pages/StudentsPage";

export type AppPage = "dashboard" | "students" | "student-detail" | "settings";

export interface AppNav {
  currentPage: AppPage;
  navigate: (page: AppPage, params?: Record<string, string>) => void;
  params: Record<string, string>;
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
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

  if (!identity) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  const nav: AppNav = { currentPage, navigate, params };

  const renderPage = () => {
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
