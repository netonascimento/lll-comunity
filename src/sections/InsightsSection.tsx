import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DisciplineRecord } from "@/types/dashboard";

type InsightsSectionProps = {
  disciplines: DisciplineRecord[];
};

const chartLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export function InsightsSection({ disciplines }: InsightsSectionProps) {
  const chartData = chartLabels.map((label, index) => {
    const sum = disciplines.reduce(
      (acc, disc) => acc + (disc.stats.engagements[index] ?? 0),
      0
    );
    const avg = disciplines.length > 0 ? sum / disciplines.length : 0;

    return {
      name: label,
      engagement: Number(avg.toFixed(1)),
    };
  });

  const statusCount = disciplines.reduce(
    (acc, disc) => {
      acc[disc.status] += 1;
      return acc;
    },
    {
      ativa: 0,
      planejamento: 0,
      pausada: 0,
    }
  );

  return (
    <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <article className="glass-panel rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Engajamento semanal
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Ritmo médio por disciplina
            </h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            Atualizado diariamente
          </span>
        </div>
        <div className="mt-8 h-64 w-full">
          <ResponsiveContainer>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="10%" stopColor="#1788ff" stopOpacity={0.7} />
                  <stop offset="90%" stopColor="#0f172a" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(15,23,42,0.9)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 16,
                  color: "white",
                }}
              />
              <Area
                type="monotone"
                dataKey="engagement"
                stroke="#3fa1ff"
                fillOpacity={1}
                fill="url(#colorEngagement)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="glass-panel rounded-3xl p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
          Status das disciplinas
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Distribuição rápida
        </h2>
        <ul className="mt-6 space-y-4">
          {(
            [
              ["ativa", "Ativas", "bg-emerald-500"],
              ["planejamento", "Planejamento", "bg-amber-400"],
              ["pausada", "Pausadas", "bg-rose-500"],
            ] as const
          ).map(([key, label, colorClass]) => (
            <li key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${colorClass}`} />
                <span className="text-slate-200">{label}</span>
              </div>
              <span className="text-lg font-semibold text-white">
                {statusCount[key]}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-6 rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-slate-400">
          Observação: mantenha pelo menos 2 semanas de antecedência para
          disciplinas em planejamento para garantir a publicação de materiais e
          tutores.
        </div>
      </article>
    </section>
  );
}
