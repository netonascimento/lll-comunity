import { FormEvent, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth";

export function LoginPage() {
  const { login, loginWithGoogle, signUp, error } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "aluno" as UserRole,
  });
  const [submitting, setSubmitting] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    // Validate inputs
    if (!form.email?.trim()) {
      setLocalError("Por favor, digite seu e-mail");
      return;
    }

    if (!form.password?.trim()) {
      setLocalError("Por favor, digite sua senha");
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setLocalError("Por favor, digite um e-mail válido");
      return;
    }

    setSubmitting(true);
    try {
      await login(form);
    } catch (err) {
      console.error(err);
      setLocalError("Não conseguimos entrar. Verifique e tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    // Validate inputs
    if (!signupForm.name?.trim()) {
      setLocalError("Por favor, digite seu nome");
      return;
    }

    if (!signupForm.email?.trim()) {
      setLocalError("Por favor, digite seu e-mail");
      return;
    }

    if (!signupForm.password?.trim()) {
      setLocalError("Por favor, digite uma senha");
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupForm.email)) {
      setLocalError("Por favor, digite um e-mail válido");
      return;
    }

    if (signupForm.password.length < 6) {
      setLocalError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setSignupLoading(true);
    try {
      await signUp(signupForm);
    } catch (err) {
      console.error(err);
      setLocalError("Falha ao criar usuário. Tente novamente.");
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-5xl grid gap-6 rounded-3xl border border-white/5 bg-white/10 p-8 text-white shadow-card md:grid-cols-2">
        <div>
          <div className="mb-6 text-center md:text-left">
            <p className="text-sm uppercase tracking-[0.4em] text-brand-200">
              Escola Online
            </p>
            <h1 className="mt-2 font-display text-3xl">Painel Seguro</h1>
            <p className="text-sm text-slate-300">
              Entre com seu e-mail institucional ou Google Workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="text-xs text-slate-400">
              E-mail
              <input
                className="mt-1 w-full rounded-2xl bg-black/30 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                }
                required
              />
            </label>

            <label className="text-xs text-slate-400">
              Senha
              <input
                className="mt-1 w-full rounded-2xl bg-black/30 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, password: event.target.value }))
                }
                required
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-brand-500 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:opacity-60"
            >
              {submitting ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <button
            type="button"
            onClick={loginWithGoogle}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/30 py-3 text-sm font-semibold text-white hover:bg-black/40"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-4 w-4" />
            Entrar com Google
          </button>

          {(error || localError) && (
            <p className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-100">
              {localError ?? error}
            </p>
          )}

          {!import.meta.env.VITE_SUPABASE_URL && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-slate-300">
              <p className="font-semibold text-white">Modo demonstração</p>
              <p>Use os logins:</p>
              <ul className="mt-2 space-y-1">
                <li>
                  <strong>master@escolaonline.com</strong> / master123
                </li>
                <li>
                  <strong>tutor@escolaonline.com</strong> / tutor123
                </li>
                <li>
                  <strong>professora@escolaonline.com</strong> / prof123
                </li>
                <li>
                  <strong>aluno@escolaonline.com</strong> / aluno123
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-200">
            Criar acesso
          </p>
          <h2 className="text-2xl font-semibold text-white">Cadastre-se</h2>
          <p className="text-sm text-slate-300">
            Solicite um acesso básico (aluno/professor). Masters liberam permissões avançadas.
          </p>

          <form onSubmit={handleSignUp} className="mt-4 space-y-3 text-xs text-slate-400">
            <label>
              Nome completo
              <input
                className="mt-1 w-full rounded-2xl bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                value={signupForm.name}
                onChange={(event) =>
                  setSignupForm((prev) => ({ ...prev, name: event.target.value }))
                }
                required
              />
            </label>
            <label>
              E-mail
              <input
                className="mt-1 w-full rounded-2xl bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                type="email"
                value={signupForm.email}
                onChange={(event) =>
                  setSignupForm((prev) => ({ ...prev, email: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Senha
              <input
                className="mt-1 w-full rounded-2xl bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                type="password"
                value={signupForm.password}
                onChange={(event) =>
                  setSignupForm((prev) => ({ ...prev, password: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Papel inicial
              <select
                className="mt-1 w-full rounded-2xl bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                value={signupForm.role}
                onChange={(event) =>
                  setSignupForm((prev) => ({
                    ...prev,
                    role: event.target.value as UserRole,
                  }))
                }
              >
                <option value="aluno">Aluno</option>
                <option value="professor">Professor</option>
              </select>
            </label>
            <button
              type="submit"
              disabled={signupLoading}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 py-2 text-sm font-semibold text-white hover:bg-white/20 disabled:opacity-60"
            >
              {signupLoading ? "Registrando..." : "Criar conta"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
