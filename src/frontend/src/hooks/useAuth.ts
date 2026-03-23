import { useCallback, useEffect, useState } from "react";
import { useActor } from "./useActor";

export interface AuthSession {
  sessionToken: string;
  role: string;
  assignedClass?: number;
  displayName: string;
}

const SESSION_KEY = "trackmyclass_session";

export function canEdit(role: string): boolean {
  return role === "developer" || role === "admin" || role === "classTeacher";
}

export function canEditClass(
  role: string,
  assignedClass: number | undefined,
  classLevel: number,
): boolean {
  if (role === "developer" || role === "admin") return true;
  if (role === "classTeacher") return assignedClass === classLevel;
  return false;
}

function isCanisterStoppedError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return (
    msg.includes("IC0508") ||
    msg.includes("is stopped") ||
    msg.includes("canister stopped")
  );
}

export function useAuth() {
  const { actor, isFetching, actorError } = useActor();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // On mount: validate stored session
  useEffect(() => {
    // If still fetching, wait
    if (isFetching) return;

    // If actor failed to load or is not available, unblock the app and show login page
    if (!actor) {
      localStorage.removeItem(SESSION_KEY);
      setIsInitializing(false);
      return;
    }

    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) {
      setIsInitializing(false);
      return;
    }
    let parsed: AuthSession | null = null;
    try {
      parsed = JSON.parse(stored) as AuthSession;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      setIsInitializing(false);
      return;
    }
    actor
      .validateSession(parsed.sessionToken)
      .then((infoResult) => {
        // Candid optionals come back as [] | [value] arrays
        const info = Array.isArray(infoResult) ? infoResult[0] : infoResult;
        if (info) {
          const assignedClassRaw = Array.isArray(info.assignedClass)
            ? info.assignedClass[0]
            : info.assignedClass;
          const validated: AuthSession = {
            sessionToken: parsed!.sessionToken,
            role: info.role,
            assignedClass:
              assignedClassRaw !== undefined && assignedClassRaw !== null
                ? Number(assignedClassRaw)
                : undefined,
            displayName: info.displayName,
          };
          setSession(validated);
          localStorage.setItem(SESSION_KEY, JSON.stringify(validated));
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      })
      .catch(() => {
        localStorage.removeItem(SESSION_KEY);
      })
      .finally(() => {
        setIsInitializing(false);
      });
  }, [actor, isFetching]);

  const login = useCallback(
    async (
      username: string,
      password: string,
    ): Promise<{ ok: boolean; error?: string }> => {
      if (!actor) {
        return {
          ok: false,
          error:
            "System is still initializing. Please refresh the page and try again.",
        };
      }
      setIsLoggingIn(true);
      try {
        const resultRaw = await actor.loginUser(username, password);
        // Candid optionals come back as [] | [value] arrays
        const result = Array.isArray(resultRaw) ? resultRaw[0] : resultRaw;
        if (!result)
          return { ok: false, error: "Invalid username or password." };
        const assignedClassRaw = Array.isArray(result.assignedClass)
          ? result.assignedClass[0]
          : result.assignedClass;
        const newSession: AuthSession = {
          sessionToken: result.sessionToken,
          role: result.role,
          assignedClass:
            assignedClassRaw !== undefined && assignedClassRaw !== null
              ? Number(assignedClassRaw)
              : undefined,
          displayName: result.displayName,
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
        setSession(newSession);
        return { ok: true };
      } catch (e) {
        if (isCanisterStoppedError(e)) {
          return {
            ok: false,
            error:
              "The server is temporarily unavailable (restarting after an update). Please wait 30 seconds and try again.",
          };
        }
        const msg = e instanceof Error ? e.message : String(e);
        return { ok: false, error: `Login failed: ${msg}` };
      } finally {
        setIsLoggingIn(false);
      }
    },
    [actor],
  );

  const logout = useCallback(async () => {
    if (session?.sessionToken && actor) {
      try {
        await actor.logoutUser(session.sessionToken);
      } catch {
        // ignore
      }
    }
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, [actor, session]);

  return { session, login, logout, isInitializing, isLoggingIn, actorError };
}
