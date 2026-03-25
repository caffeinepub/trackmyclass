import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Plus } from "lucide-react";
import { useState } from "react";
import type { AuthSession } from "../hooks/useAuth";

const SESSIONS_KEY = "trackmyclass_sessions";

function getStoredSessions(): string[] {
  const raw = localStorage.getItem(SESSIONS_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as string[];
    } catch {
      // fall through
    }
  }
  const defaults = ["2025-26"];
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(defaults));
  return defaults;
}

interface Props {
  session: AuthSession;
  onSelectSession: (s: string) => void;
}

export default function SessionSelectPage({ session, onSelectSession }: Props) {
  const [sessions, setSessions] = useState<string[]>(() => getStoredSessions());
  const [newSession, setNewSession] = useState("");
  const [error, setError] = useState("");

  const canManage = session.role === "developer" || session.role === "admin";

  const handleAdd = () => {
    const trimmed = newSession.trim();
    if (!trimmed) {
      setError("Please enter a session year.");
      return;
    }
    if (sessions.includes(trimmed)) {
      setError("Session already exists.");
      return;
    }
    const updated = [...sessions, trimmed];
    setSessions(updated);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
    setNewSession("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4">
      {/* School Branding */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
            <GraduationCap className="text-white" size={28} />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          TrackMyClass
        </h1>
        <p className="text-blue-200 text-sm mt-1">
          VIVEKANANDA KENDRA VIDYALAYA RAGA
        </p>
        <p className="text-blue-300 text-xs">Kamle, Arunachal Pradesh</p>
      </div>

      <Card
        className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur"
        data-ocid="session_select.card"
      >
        <CardHeader className="pb-4">
          <CardTitle className="text-center text-lg font-semibold text-gray-800">
            Select Academic Session
          </CardTitle>
          <p className="text-center text-xs text-muted-foreground">
            Welcome, {session.displayName}. Choose a session to continue.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Session Buttons */}
          <div className="space-y-2">
            {sessions.map((s) => (
              <Button
                key={s}
                variant="outline"
                className="w-full justify-start text-left h-11 font-medium hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-colors"
                onClick={() => onSelectSession(s)}
                data-ocid="session_select.session.button"
              >
                <span className="mr-2 text-blue-500">📅</span>
                {s}
              </Button>
            ))}
          </div>

          {/* Create New Session (Admin/Developer only) */}
          {canManage && (
            <div className="pt-4 border-t">
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Create New Session
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newSession}
                  onChange={(e) => {
                    setNewSession(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  placeholder="e.g. 2026-27"
                  className="flex-1"
                  data-ocid="session_select.new_session.input"
                />
                <Button
                  onClick={handleAdd}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  data-ocid="session_select.add_session.button"
                >
                  <Plus size={14} className="mr-1" /> Add
                </Button>
              </div>
              {error && (
                <p
                  className="text-xs text-red-500 mt-1"
                  data-ocid="session_select.error_state"
                >
                  {error}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-blue-300 text-xs mt-6">
        Logged in as{" "}
        <strong className="text-blue-100">{session.displayName}</strong> (
        {session.role})
      </p>
    </div>
  );
}
