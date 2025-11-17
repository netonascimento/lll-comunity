import { useMemo } from "react";
import { useUserDirectory } from "@/hooks/useUserDirectory";
import { UserRole } from "@/types/auth";

const roleOptions: UserRole[] = ["master", "tutor", "professor"];

export function UserManagementPanel() {
  const {
    users,
    loading,
    error,
    updateRole,
    updateStatus,
    reload,
  } = useUserDirectory("manage");

  const activeUsers = useMemo(
    () => users.filter((user) => user.status === "active"),
    [users]
  );

  return (
    <section className="glass-panel rounded-3xl p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-brand-200">
            Contas & papéis
          </p>
          <h2 className="text-2xl font-semibold text-white">
            Controle de acessos
          </h2>
          <p className="text-sm text-slate-300">
            Promova tutores, paute professores e bloqueie contas inativas.
          </p>
        </div>
        <button
          onClick={reload}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
        >
          Atualizar lista
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-100">
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-32 animate-pulse rounded-2xl bg-white/5" />
            ))
          : users.map((user) => (
              <article
                key={user.id}
                className="rounded-2xl border border-white/5 bg-white/5 p-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      user.avatarUrl ??
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff`
                    }
                    alt={user.name}
                    className="h-12 w-12 rounded-full border border-white/10 object-cover"
                  />
                  <div>
                    <p className="text-base font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="text-xs text-slate-400">
                    Papel
                    <select
                      className="mt-1 w-full rounded-2xl bg-black/20 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                      value={user.role}
                      onChange={(event) =>
                        updateRole?.(user.id, event.target.value as UserRole)
                      }
                    >
                      {roleOptions.map((role) => (
                        <option
                          key={role}
                          value={role}
                          className="bg-slate-900 text-white"
                        >
                          {role}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs text-slate-400">
                    Status
                    <select
                      className="mt-1 w-full rounded-2xl bg-black/20 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                      value={user.status}
                      onChange={(event) =>
                        updateStatus?.(
                          user.id,
                          event.target.value as "active" | "inactive"
                        )
                      }
                    >
                      <option value="active" className="bg-slate-900 text-white">
                        Ativo
                      </option>
                      <option value="inactive" className="bg-slate-900 text-white">
                        Inativo
                      </option>
                    </select>
                  </label>
                </div>
              </article>
            ))}
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Total ativo: {activeUsers.length} / {users.length}
      </p>
    </section>
  );
}
