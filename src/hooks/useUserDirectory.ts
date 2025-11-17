import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { MOCK_USERS } from "@/data/mockUsers";
import { UserProfile, UserRole, UserStatus } from "@/types/auth";

type Mode = "readonly" | "manage";

export function useUserDirectory(mode: Mode = "readonly", enabled = true) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    if (!enabled) {
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    if (!supabase) {
      setUsers(MOCK_USERS);
      setLoading(false);
      return;
    }

    const { data, error: selectError } = await supabase
      .from("profiles")
      .select("id, email, display_name, role, status, avatar_url")
      .order("display_name", { ascending: true });

    if (selectError) {
      console.error(selectError);
      setError("Não foi possível carregar os usuários.");
      setUsers([]);
    } else {
      setUsers(
        (data ?? []).map((profile) => ({
          id: profile.id,
          email: profile.email,
          name: profile.display_name ?? profile.email,
          role: profile.role as UserRole,
          status: profile.status as UserStatus,
          avatarUrl: profile.avatar_url ?? undefined,
        }))
      );
    }

    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const updateRole = useCallback(
    async (targetId: string, role: UserRole) => {
      if (!supabase) {
        setUsers((prev) =>
          prev.map((user) => (user.id === targetId ? { ...user, role } : user))
        );
        return;
      }
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", targetId);
      if (updateError) {
        console.error(updateError);
        setError("Não foi possível alterar o papel.");
        return;
      }
      loadUsers();
    },
    [loadUsers]
  );

  const updateStatus = useCallback(
    async (targetId: string, status: UserStatus) => {
      if (!supabase) {
        setUsers((prev) =>
          prev.map((user) => (user.id === targetId ? { ...user, status } : user))
        );
        return;
      }
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ status })
        .eq("id", targetId);
      if (updateError) {
        console.error(updateError);
        setError("Não foi possível alterar o status.");
        return;
      }
      loadUsers();
    },
    [loadUsers]
  );

  return {
    users,
    loading,
    error,
    updateRole: mode === "manage" ? updateRole : undefined,
    updateStatus: mode === "manage" ? updateStatus : undefined,
    reload: loadUsers,
  };
}
