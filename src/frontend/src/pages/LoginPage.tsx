import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Loader2, Lock, RefreshCw, User } from "lucide-react";
import { useState } from "react";

interface Props {
  login: (
    username: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  isLoggingIn: boolean;
  actorError?: boolean;
}

export default function LoginPage({ login, isLoggingIn, actorError }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password");
      return;
    }
    const result = await login(username.trim(), password);
    if (!result.ok) {
      setError(result.error ?? "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
            <GraduationCap size={30} className="text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="font-display font-bold text-2xl text-foreground">
              TrackMyClass
            </h1>
            <p className="text-xs font-semibold text-muted-foreground mt-1 uppercase tracking-wider">
              VIVEKANANDA KENDRA VIDYALAYA RAGA
            </p>
            <p className="text-xs text-muted-foreground">
              Dist. Kamle, Arunachal Pradesh
            </p>
          </div>
        </div>

        {/* Actor error banner */}
        {actorError && (
          <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
            <RefreshCw size={14} className="shrink-0" />
            <span>
              Connection issue detected. Please{" "}
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="underline font-medium"
              >
                refresh the page
              </button>{" "}
              and try again.
            </span>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
          <h2 className="font-display font-semibold text-lg mb-1">Sign In</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Access the student records management system.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username"
                  className="pl-9"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Developed by Phanindra Bharali
        </p>
      </div>
    </div>
  );
}
