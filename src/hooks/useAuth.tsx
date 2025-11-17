import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { createMockUser, findMockUser, MOCK_USERS } from "@/data/mockUsers";
import { PermissionSet, UserProfile, UserRole } from "@/types/auth";
import { DisciplineRecord } from "@/types/dashboard";

type AuthContextValue = {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (payload: { email: string; password: string }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signUp: (payload: { name: string; email: string; password: string; role: UserRole }) => Promise<void>;
  logout: () => Promise<void>;
  permissions: PermissionSet;
  canEditDiscipline: (discipline: DisciplineRecord) => boolean;
  canUpdateStatus: (discipline: DisciplineRecord) => boolean;
  refreshProfile: () => Promise<void>;
};

const defaultPermissions: PermissionSet = {
  canCreateDiscipline: false,
  canEditAnyDiscipline: false,
  canEditOwnDiscipline: false,
  canUpdateAnyStatus: false,
  canUpdateOwnStatus: false,
  canAssignTutor: false,
  canManageUsers: false,
};

const roleMatrix: Record<UserRole, PermissionSet> = {
  master: {
    canCreateDiscipline: true,
    canEditAnyDiscipline: true,
    canEditOwnDiscipline: true,
    canUpdateAnyStatus: true,
    canUpdateOwnStatus: true,
    canAssignTutor: true,
    canManageUsers: true,
  },
  tutor: {
    canCreateDiscipline: true,
    canEditAnyDiscipline: false,
    canEditOwnDiscipline: true,
    canUpdateAnyStatus: false,
    canUpdateOwnStatus: true,
    canAssignTutor: false,
    canManageUsers: false,
  },
  professor: {
    canCreateDiscipline: false,
    canEditAnyDiscipline: false,
    canEditOwnDiscipline: true,
    canUpdateAnyStatus: false,
    canUpdateOwnStatus: false,
    canAssignTutor: false,
    canManageUsers: false,
  },
  aluno: {
    canCreateDiscipline: false,
    canEditAnyDiscipline: false,
    canEditOwnDiscipline: false,
    canUpdateAnyStatus: false,
    canUpdateOwnStatus: false,
    canAssignTutor: false,
    canManageUsers: false,
  },
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  loginWithGoogle: async () => {},
  signUp: async () => {},
  logout: async () => {},
  permissions: defaultPermissions,
  canEditDiscipline: () => false,
  canUpdateStatus: () => false,
  refreshProfile: async () => {},
});

const buildPermissions = (role?: UserRole | null): PermissionSet =>
  role ? roleMatrix[role] : defaultPermissions;

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(
    async (sessionUser: User | null) => {
      if (!supabase || !sessionUser) return;
      const { data, error: selectError, status } = await supabase
        .from("profiles")
        .select("id, email, display_name, role, status, avatar_url")
        .eq("id", sessionUser.id)
        .maybeSingle();

      if (selectError && status !== 406) {
        console.error(selectError);
        setError("Não conseguimos carregar seu perfil.");
        return;
      }

      if (!data) {
        const { data: inserted, error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: sessionUser.id,
            email: sessionUser.email,
            display_name:
              (sessionUser.user_metadata as Record<string, string> | undefined)?.full_name ??
              sessionUser.email,
            role: "tutor",
            status: "active",
            avatar_url:
              (sessionUser.user_metadata as Record<string, string> | undefined)?.avatar_url ??
              null,
          })
          .select("id, email, display_name, role, status, avatar_url")
          .single();
        if (insertError || !inserted) {
          console.error(insertError);
          setError("Não conseguimos criar seu perfil.");
          return;
        }
        setUser({
          id: inserted.id,
          email: inserted.email,
          name: inserted.display_name ?? inserted.email,
          role: inserted.role as UserRole,
          status: inserted.status,
          avatarUrl: inserted.avatar_url ?? undefined,
        });
        return;
      }

      setUser({
        id: data.id,
        email: data.email,
        name: data.display_name ?? data.email,
        role: data.role as UserRole,
        status: data.status,
        avatarUrl: data.avatar_url ?? undefined,
      });
    },
    []
  );

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setUser(MOCK_USERS[0]);
      setLoading(false);
      return;
    }

    const loadSession = async () => {
      const { data } = await client.auth.getSession();
      if (data.session) {
        await loadProfile(data.session.user);
      }
    };

    loadSession();
    const { data: listener } = client.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await loadProfile(session.user);
        } else {
          setUser(null);
        }
        if (event === "INITIAL_SESSION") {
          setLoading(false);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
      setLoading(false);
    };
  }, [loadProfile]);

  const login = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      setError(null);
      if (!supabase) {
        const mock = findMockUser(email, password);
        if (!mock) {
          throw new Error("Credenciais inválidas no modo offline.");
        }
        setUser(mock);
        return;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !data.session) {
        throw authError ?? new Error("Falha ao autenticar.");
      }

      await loadProfile(data.session.user);
    },
    [loadProfile]
  );

  const loginWithGoogle = useCallback(async () => {
    setError(null);
    try {
      if (!supabase) {
        const fallback = MOCK_USERS.find((user) => user.role === "aluno") ?? MOCK_USERS[0];
        setUser(fallback);
        return;
      }

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (authError) {
        throw authError;
      }
    } catch (err) {
      const message = err instanceof Error 
        ? err.message 
        : "Falha ao entrar com Google";
      setError(message);
      console.error("Google login error:", err);
    }
  }, []);

  const signUp = useCallback(
    async ({
      name,
      email,
      password,
      role,
    }: {
      name: string;
      email: string;
      password: string;
      role: UserRole;
    }) => {
      if (!supabase) {
        const mock = createMockUser({ name, email, role, password });
        setUser(mock);
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email,
          display_name: name,
          role,
          status: "active",
        });
        if (profileError) {
          console.error(profileError);
        }
        await loadProfile(data.user);
      }
    },
    [loadProfile]
  );

  const logout = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  }, []);

  const permissions = useMemo(() => buildPermissions(user?.role), [user]);

  const canEditDiscipline = useCallback(
    (discipline: DisciplineRecord) => {
      if (!user) return false;
      if (permissions.canEditAnyDiscipline) return true;
      if (
        permissions.canEditOwnDiscipline &&
        discipline.createdBy &&
        discipline.createdBy === user.id
      ) {
        return true;
      }
      return false;
    },
    [permissions, user]
  );

  const canUpdateStatus = useCallback(
    (discipline: DisciplineRecord) => {
      if (!user) return false;
      if (permissions.canUpdateAnyStatus) return true;
      if (
        permissions.canUpdateOwnStatus &&
        discipline.createdBy === user.id
      ) {
        return true;
      }
      return false;
    },
    [permissions, user]
  );

  const refreshProfile = useCallback(async () => {
    if (supabase) {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await loadProfile(data.user);
      }
    }
  }, [loadProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        loginWithGoogle,
        signUp,
        logout,
        permissions,
        canEditDiscipline,
        canUpdateStatus,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
