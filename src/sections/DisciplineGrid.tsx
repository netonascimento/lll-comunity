import { DisciplineRecord } from "@/types/dashboard";
import { DisciplineCard } from "@/components/DisciplineCard";

type DisciplineGridProps = {
  disciplines: DisciplineRecord[];
  busy?: boolean;
  onUpdate: (id: string, payload: Partial<DisciplineRecord>) => Promise<void> | void;
  onRegisterAction: (
    id: string,
    label: string,
    type: DisciplineRecord["pendingActions"][number]["type"],
    dueDate: string
  ) => Promise<void> | void;
  onAssignTutor: (id: string, tutorId: string) => Promise<void> | void;
};

export function DisciplineGrid({
  disciplines,
  busy,
  onUpdate,
  onRegisterAction,
  onAssignTutor,
}: DisciplineGridProps) {
  if (disciplines.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 p-10 text-center text-slate-400">
        Nenhuma disciplina encontrada com os filtros atuais.
      </div>
    );
  }

  return (
    <section className="space-y-4">
      {disciplines.map((discipline) => (
        <DisciplineCard
          key={discipline.id}
          discipline={discipline}
          busy={busy}
          onUpdate={onUpdate}
          onRegisterAction={onRegisterAction}
          onAssignTutor={onAssignTutor}
        />
      ))}
    </section>
  );
}
