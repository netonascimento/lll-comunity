import { DashboardFilters } from "@/hooks/useDisciplineDashboard";
import { DashboardSummary } from "@/types/dashboard";
import { RefreshCcw } from "lucide-react";

type HeroSectionProps = {
  summary: DashboardSummary;
  filters: DashboardFilters;
  onFiltersChange: (value: Partial<DashboardFilters>) => void;
  onRefresh: () => void;
  onNewDiscipline: () => void;
  loading: boolean;
  updating: boolean;
};

const statusOptions = [
  { value: "todas", label: "Todas" },
  { value: "ativa", label: "Ativas" },
  { value: "planejamento", label: "Em planejamento" },
  { value: "pausada", label: "Pausadas" },
];

export function HeroSection({
  summary,
  filters,
  onFiltersChange,
  onRefresh,
  onNewDiscipline,
  loading,
  updating,
}: HeroSectionProps) {
  return (
    <header className="glass-panel rounded-3xl p-6 sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-brand-300">
            Gestão avançada
          </p>
          <h1 className="mt-2 font-display text-3xl leading-tight text-white sm:text-4xl">
            Disciplinas e comunidades conectadas
          </h1>
          <p className="mt-2 max-w-2xl text-base text-slate-300">
            Acompanhe indicadores em tempo real, personalize trilhas e distribua
            tutores de forma inteligente. Tudo mobile first, pronto para Supabase.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onNewDiscipline}
            className="inline-flex items-center justify-center rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-400"
          >
            Nova disciplina
          </button>
          <button
            onClick={onRefresh}
            disabled={loading || updating}
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Atualizar
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 md:flex-row">
        <label className="flex-1">
          <span className="sr-only">Buscar disciplinas</span>
          <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 focus-within:border-brand-400 focus-within:bg-white/10">
            <svg
              className="h-4 w-4 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
              placeholder="Busque por código, disciplina ou tutor..."
              value={filters.search}
              onChange={(event) =>
                onFiltersChange({ search: event.target.value })
              }
            />
          </div>
        </label>

        <label className="md:w-56">
          <span className="sr-only">Filtrar por status</span>
          <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white">
            <select
              className="w-full bg-transparent text-sm text-white outline-none"
              value={filters.status}
              onChange={(event) =>
                onFiltersChange({
                  status: event.target.value as DashboardFilters["status"],
                })
              }
            >
              {statusOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="bg-slate-900 text-white"
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </label>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <dt className="text-sm text-slate-400">Disciplinas monitoradas</dt>
          <dd className="mt-2 text-2xl font-semibold text-white">
            {summary.totalDisciplines}
          </dd>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <dt className="text-sm text-slate-400">Alunos ativos</dt>
          <dd className="mt-2 text-2xl font-semibold text-white">
            {summary.activeStudents}
          </dd>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <dt className="text-sm text-slate-400">Satisfação média</dt>
          <dd className="mt-2 text-2xl font-semibold text-brand-200">
            {summary.satisfaction}%
          </dd>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <dt className="text-sm text-slate-400">Taxa de conclusão</dt>
          <dd className="mt-2 text-2xl font-semibold text-brand-200">
            {summary.completionRate}%
          </dd>
        </div>
      </dl>
    </header>
  );
}
