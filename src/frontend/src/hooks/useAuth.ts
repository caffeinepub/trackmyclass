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

export function useAuth() {
  const { actor, isFetching } = useActor();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // On mount: validate stored session
  useEffect(() => {
    if (isFetching || !actor) return;
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
      .then((info) => {
        if (info) {
          const validated: AuthSession = {
            sessionToken: parsed!.sessionToken,
            role: info.role,
            assignedClass:
              info.assignedClass !== undefined
                ? Number(info.assignedClass)
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
    async (username: string, password: string): Promise<boolean> => {
      if (!actor) return false;
      setIsLoggingIn(true);
      try {
        const result = await actor.loginUser(username, password);
        if (!result) return false;
        const newSession: AuthSession = {
          sessionToken: result.sessionToken,
          role: result.role,
          assignedClass:
            result.assignedClass !== undefined
              ? Number(result.assignedClass)
              : undefined,
          displayName: result.displayName,
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
        setSession(newSession);
        return true;
      } catch {
        return false;
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

  return { session, login, logout, isInitializing, isLoggingIn };
}
