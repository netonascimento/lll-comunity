import { FormEvent, useEffect, useMemo, useState, type JSX } from "react";
import {
  CheckCircle,
  Clock3,
  MessageSquare,
  Target,
  Users,
} from "lucide-react";
import { DisciplineRecord } from "@/types/dashboard";
import { StatusBadge } from "./StatusBadge";
import { TutorAvatar } from "./TutorAvatar";
import { LearningBlocksEditor } from "./LearningBlocksEditor";

type DisciplineCardProps = {
  discipline: DisciplineRecord;
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

const pendingLabels: Record<
  DisciplineRecord["pendingActions"][number]["type"],
  { icon: JSX.Element; bg: string }
> = {
  atualizacao: {
    icon: <CheckCircle className="h-4 w-4" />,
    bg: "bg-sky-500/15 text-sky-200",
  },
  feedback: {
    icon: <MessageSquare className="h-4 w-4" />,
    bg: "bg-violet-500/15 text-violet-200",
  },
  mentoria: {
    icon: <Users className="h-4 w-4" />,
    bg: "bg-emerald-500/15 text-emerald-200",
  },
};

export function DisciplineCard({
  discipline,
  busy,
  onUpdate,
  onRegisterAction,
  onAssignTutor,
}: DisciplineCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [formState, setFormState] = useState({
    name: discipline.name,
    description: discipline.description,
    status: discipline.status,
    level: discipline.level,
    tags: discipline.tags.join(", "),
    nextReviewAt: discipline.nextReviewAt.slice(0, 10),
  });
  const [ementa, setEmenta] = useState(discipline.ementa);
  const [blocks, setBlocks] = useState(discipline.learningBlocks);
  const [actionForm, setActionForm] = useState({
    label: "",
    type: "atualizacao" as DisciplineRecord["pendingActions"][number]["type"],
    dueDate: "",
  });
  const [tutorId, setTutorId] = useState("");

  useEffect(() => {
    setFormState({
      name: discipline.name,
      description: discipline.description,
      status: discipline.status,
      level: discipline.level,
      tags: discipline.tags.join(", "),
      nextReviewAt: discipline.nextReviewAt.slice(0, 10),
    });
    setEmenta(discipline.ementa);
    setBlocks(discipline.learningBlocks);
  }, [discipline]);

  const completionColor = useMemo(() => {
    if (discipline.stats.completionRate >= 80) return "text-emerald-300";
    if (discipline.stats.completionRate >= 60) return "text-amber-300";
    return "text-rose-300";
  }, [discipline.stats.completionRate]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onUpdate(discipline.id, {
      name: formState.name,
      description: formState.description,
      status: formState.status as DisciplineRecord["status"],
      level: formState.level,
      tags: formState.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      nextReviewAt: formState.nextReviewAt,
    });
  };

  const handleActionSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!actionForm.label || !actionForm.dueDate) return;

    onRegisterAction(
      discipline.id,
      actionForm.label,
      actionForm.type,
      actionForm.dueDate
    );

    setActionForm({
      label: "",
      type: "atualizacao",
      dueDate: "",
    });
  };

  const handleCurriculumSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onUpdate(discipline.id, {
      ementa,
      learningBlocks: blocks,
    });
  };

  return (
    <article className="glass-panel flex flex-col rounded-3xl p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={discipline.status} />
            <span className="text-xs uppercase tracking-wide text-slate-400">
              {discipline.code}
            </span>
            <span className="text-xs text-slate-500">
              Última atualização{" "}
              {new Date(discipline.stats.updatedAt).toLocaleDateString("pt-BR")}
            </span>
          </div>

          <h3 className="font-display text-2xl text-white">
            {discipline.name}
          </h3>
          <p className="max-w-2xl text-sm text-slate-300">
            {discipline.description}
          </p>
          <p className="text-xs text-slate-400">
            <span className="font-semibold text-slate-200">Ementa:</span>{" "}
            {discipline.ementa}
          </p>

          <div className="flex flex-wrap gap-2 text-xs">
            {discipline.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/5 px-3 py-1 text-slate-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
        >
          {expanded ? "Fechar painel" : "Abrir painel"}
        </button>
      </div>

      <div className="mt-6 grid gap-4 text-sm text-slate-200 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-xs uppercase text-slate-400">
            <Users className="h-4 w-4 text-brand-300" />
            Alunos ativos
          </div>
          <p className="mt-2 text-2xl font-semibold text-white">
            {discipline.stats.activeStudents}
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-xs uppercase text-slate-400">
            <Target className="h-4 w-4 text-brand-300" />
            Conclusão
          </div>
          <p className={`mt-2 text-2xl font-semibold ${completionColor}`}>
            {discipline.stats.completionRate}%
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-xs uppercase text-slate-400">
            <Clock3 className="h-4 w-4 text-brand-300" />
            Próxima revisão
          </div>
          <p className="mt-2 text-lg text-white">
            {new Date(discipline.nextReviewAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
            })}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Tutores conectados
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {discipline.tutors.map((tutor) => (
              <div key={tutor.id} className="flex items-center gap-3">
                <TutorAvatar tutor={tutor} />
                <div>
                  <p className="text-sm text-white">{tutor.name}</p>
                  <span className="text-xs text-slate-400">
                    {tutor.expertise.join(" · ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Pendências inteligentes
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {discipline.pendingActions.map((item) => (
              <div
                key={`${item.type}-${item.label}`}
                className="flex items-center justify-between rounded-2xl px-3 py-2 text-xs"
              >
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${pendingLabels[item.type].bg}`}
                >
                  {pendingLabels[item.type].icon}
                  {item.label}
                </span>
                <span className="text-slate-300">
                  até {new Date(item.dueDate).toLocaleDateString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="mt-6 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-white/5 bg-white/5 p-4"
            >
              <p className="text-sm font-semibold text-white">
                Editar disciplina
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <label className="text-xs text-slate-400">
                  Nome
                  <input
                    className="mt-1 w-full rounded-xl bg-black/20 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                    value={formState.name}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label className="text-xs text-slate-400">
                  Descrição
                  <textarea
                    className="mt-1 min-h-[90px] w-full rounded-xl bg-black/20 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                    value={formState.description}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                  />
                </label>
                <div className="grid gap-3 md:grid-cols-2">
                <label className="text-xs text-slate-400">
                  Status
                  <select
                    className="mt-1 w-full rounded-xl bg-black/20 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                    value={formState.status}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        status: event.target.value as DisciplineRecord["status"],
                      }))
                    }
                  >
                    <option value="ativa">Ativa</option>
                    <option value="planejamento">Planejamento</option>
                      <option value="pausada">Pausada</option>
                    </select>
                  </label>
                  <label className="text-xs text-slate-400">
                    Nível
                    <input
                      className="mt-1 w-full rounded-xl bg-black/20 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                      value={formState.level}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          level: event.target.value,
                        }))
                      }
                    />
                  </label>
                </div>
                <label className="text-xs text-slate-400">
                  Tags (separadas por vírgula)
                  <input
                    className="mt-1 w-full rounded-xl bg-black/20 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                    value={formState.tags}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        tags: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="text-xs text-slate-400">
                  Revisão
                  <input
                    type="date"
                    className="mt-1 w-full rounded-xl bg-black/20 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                    value={formState.nextReviewAt}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        nextReviewAt: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={busy}
                className="mt-4 inline-flex items-center justify-center rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:opacity-60"
              >
                Salvar alterações
              </button>
            </form>

            <div className="space-y-4">
              <form
                onSubmit={handleActionSubmit}
                className="rounded-2xl border border-white/5 bg-white/5 p-4"
              >
                <p className="text-sm font-semibold text-white">
                  Registrar ação
                </p>
                <div className="mt-4 grid gap-3">
                  <label className="text-xs text-slate-400">
                    Descrição
                    <input
                      className="mt-1 w-full rounded-xl bg-black/20 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                      value={actionForm.label}
                      onChange={(event) =>
                        setActionForm((prev) => ({
                          ...prev,
                          label: event.target.value,
                        }))
                      }
                      placeholder="Ex.: Revisar plano de aula"
                    />
                  </label>
                  <label className="text-xs text-slate-400">
                    Tipo
                    <select
                      className="mt-1 w-full rounded-xl bg-black/20 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                      value={actionForm.type}
                      onChange={(event) =>
                        setActionForm((prev) => ({
                          ...prev,
                          type: event.target.value as DisciplineRecord["pendingActions"][number]["type"],
                        }))
                      }
                    >
                      <option value="atualizacao">Atualização</option>
                      <option value="feedback">Feedback</option>
                      <option value="mentoria">Mentoria</option>
                    </select>
                  </label>
                  <label className="text-xs text-slate-400">
                    Prazo
                    <input
                      type="date"
                      className="mt-1 w-full rounded-xl bg-black/20 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                      value={actionForm.dueDate}
                      onChange={(event) =>
                        setActionForm((prev) => ({
                          ...prev,
                          dueDate: event.target.value,
                        }))
                      }
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="mt-4 inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
                >
                  Adicionar à trilha
                </button>
              </form>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!tutorId) return;
                  onAssignTutor(discipline.id, tutorId);
                  setTutorId("");
                }}
                className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-4"
              >
                <p className="text-sm font-semibold text-white">
                  Vincular novo tutor
                </p>
                <label className="mt-3 block text-xs text-slate-400">
                  ID ou e-mail do tutor
                  <input
                    className="mt-1 w-full rounded-xl bg-transparent px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                    placeholder="tutor_123 ou ana@escolaonline.com"
                    value={tutorId}
                    onChange={(event) => setTutorId(event.target.value)}
                  />
                </label>
                <button
                  type="submit"
                  disabled={busy}
                  className="mt-4 inline-flex items-center justify-center rounded-2xl bg-brand-500/80 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
                >
                  Convidar tutor
                </button>
              </form>
            </div>
          </div>

          <form
            onSubmit={handleCurriculumSubmit}
            className="rounded-2xl border border-white/5 bg-white/5 p-4"
          >
            <p className="text-sm font-semibold text-white">
              Ementa e blocos
            </p>
            <div className="mt-4 space-y-4">
              <label className="text-xs text-slate-400">
                Ementa (visão geral)
                <textarea
                  className="mt-1 min-h-[120px] w-full rounded-2xl bg-black/20 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                  value={ementa}
                  onChange={(event) => setEmenta(event.target.value)}
                  placeholder="Descreva os objetivos gerais e metodologia…"
                />
              </label>
              <LearningBlocksEditor value={blocks} onChange={setBlocks} />
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center justify-center rounded-2xl bg-brand-500/90 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
              >
                Salvar ementa & blocos
              </button>
            </div>
          </form>
        </div>
      )}
    </article>
  );
}
