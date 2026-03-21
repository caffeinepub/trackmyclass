import { Button } from "@/components/ui/button";
import { GraduationCap, Loader2 } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-card">
            <GraduationCap size={28} className="text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="font-display font-bold text-2xl text-foreground">
              TrackMyClass
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Vivekananda Kendra Vidyalaya Raga
            </p>
            <p className="text-xs text-muted-foreground">
              Dist- Kamle, Arunachal Pradesh
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <h2 className="font-display font-semibold text-lg mb-1">Sign In</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Access the student records management system.
          </p>
          <Button
            className="w-full"
            onClick={login}
            disabled={isLoggingIn}
            data-ocid="login.submit_button"
          >
            {isLoggingIn ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" /> Signing in…
              </>
            ) : (
              "Sign In with Internet Identity"
            )}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          For school administrators and teachers only.
        </p>
      </div>
    </div>
  );
}
