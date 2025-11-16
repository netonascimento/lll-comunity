import { DashboardTimelineEvent } from "@/types/dashboard";
import { MessageCircle, PlayCircle, Users } from "lucide-react";

type ActivityTimelineProps = {
  events: DashboardTimelineEvent[];
};

const iconMap = {
  forum: MessageCircle,
  material: PlayCircle,
  mentoria: Users,
};

export function ActivityTimeline({ events }: ActivityTimelineProps) {
  return (
    <section className="glass-panel rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Novas interações
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Fórum e materiais
          </h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          Notificações smart
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {events.map((event) => {
          const Icon = iconMap[event.type];
          return (
            <article
              key={event.id}
              className="flex items-start gap-4 rounded-2xl border border-white/5 bg-white/5 p-4"
            >
              <div className="rounded-2xl bg-brand-500/20 p-3 text-brand-200">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">
                  {event.title}
                </p>
                <p className="text-xs text-slate-400">
                  {event.owner} · {event.timeAgo}
                </p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white">
                {event.type}
              </span>
            </article>
          );
        })}
      </div>
    </section>
  );
}
