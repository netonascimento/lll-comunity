import { FormEvent, useMemo, useState } from "react";
import { DisciplineRecord } from "@/types/dashboard";
import {
  CourseRecord,
  CreateCoursePayload,
  CreateTurmaPayload,
} from "@/types/course";

type CourseManagementPanelProps = {
  disciplines: DisciplineRecord[];
  courses: CourseRecord[];
  onCreateCourse: (payload: CreateCoursePayload) => Promise<void> | void;
  onCreateTurma: (payload: CreateTurmaPayload) => Promise<void> | void;
  onDeleteCourse: (courseId: string) => Promise<void> | void;
  currentUserId: string;
  loading?: boolean;
  error?: string | null;
  updating?: boolean;
};

export function CourseManagementPanel({
  disciplines,
  courses,
  onCreateCourse,
  onCreateTurma,
  onDeleteCourse,
  currentUserId,
  loading,
  error,
  updating,
}: CourseManagementPanelProps) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    coverUrl: "",
    disciplineIds: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [turmaForms, setTurmaForms] = useState<Record<
    string,
    { name: string; period: string; startsAt: string; endsAt: string; mentor: string }
  >>({});

  // Helper to get or initialize turma form
  const getTurmaForm = (courseId: string) => {
    return turmaForms[courseId] || { name: "", period: "", startsAt: "", endsAt: "", mentor: "" };
  };

  const orderedDisciplines = useMemo(
    () =>
      [...disciplines].sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" })),
    [disciplines]
  );

  const handleCourseSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Validate inputs
    if (!form.name?.trim()) {
      alert("Nome do curso é obrigatório");
      return;
    }

    if (form.disciplineIds.length === 0) {
      alert("Selecione pelo menos uma disciplina");
      return;
    }

    // Check for duplicates (case-insensitive)
    const courseNameLower = form.name.toLowerCase();
    if (courses.some((c) => c.name.toLowerCase() === courseNameLower)) {
      alert("Já existe um curso com este nome");
      return;
    }

    setSubmitting(true);
    try {
      await onCreateCourse({
        name: form.name,
        description: form.description,
        coverUrl: form.coverUrl || undefined,
        disciplineIds: form.disciplineIds,
        createdBy: currentUserId,
      });
      // Only clear form if creation was successful
      setForm({ name: "", description: "", coverUrl: "", disciplineIds: [] });
    } catch (submitError) {
      console.error("Failed to create course:", submitError);
      alert(`Erro ao criar curso: ${submitError instanceof Error ? submitError.message : "Tente novamente"}`);
      // Keep form data so user can try again
    } finally {
      setSubmitting(false);
    }
  };

  const handleCoursePick = (id: string) => {
    setForm((prev) => {
      if (prev.disciplineIds.includes(id)) {
        return {
          ...prev,
          disciplineIds: prev.disciplineIds.filter((item) => item !== id),
        };
      }
      return {
        ...prev,
        disciplineIds: [...prev.disciplineIds, id],
      };
    });
  };

  const handleTurmaSubmit = async (courseId: string) => {
    const values = turmaForms[courseId];
    
    // Validate required fields
    if (!values?.name?.trim()) {
      alert("Nome da turma é obrigatório");
      return;
    }
    
    if (!values?.period?.trim()) {
      alert("Período é obrigatório");
      return;
    }
    
    if (!values?.startsAt?.trim()) {
      alert("Data de início é obrigatória");
      return;
    }
    
    try {
      await onCreateTurma({
        courseId,
        name: values.name,
        period: values.period,
        startsAt: values.startsAt,
        endsAt: values.endsAt?.trim() || undefined,
        mentor: values.mentor?.trim() || undefined,
      });
      
      // Clear form only if successful
      setTurmaForms((prev) => ({
        ...prev,
        [courseId]: { name: "", period: "", startsAt: "", endsAt: "", mentor: "" },
      }));
    } catch (error) {
      console.error("Failed to create turma:", error);
      alert(`Erro ao criar turma: ${error instanceof Error ? error.message : "Tente novamente"}`);
    }
  };

  return (
    <section className="glass-panel rounded-3xl p-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-200">
          Cursos e trilhas
        </p>
        <h2 className="text-2xl font-semibold text-white">
          Organize cursos e turmas
        </h2>
        <p className="text-sm text-slate-300">
          Construa cursos usando disciplinas existentes e publique turmas específicas para
          escolas parceiras.
        </p>
      </div>

      {error && (
        <p className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-100">
          {error}
        </p>
      )}

      <form onSubmit={handleCourseSubmit} className="mt-6 space-y-4 rounded-2xl border border-white/5 bg-white/5 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-xs text-slate-400">
            Nome do curso
            <input
              className="mt-1 w-full rounded-2xl bg-black/20 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </label>
          <label className="text-xs text-slate-400">
            Imagem (opcional)
            <input
              className="mt-1 w-full rounded-2xl bg-black/20 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
              value={form.coverUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, coverUrl: event.target.value }))}
              placeholder="https://..."
            />
          </label>
        </div>
        <label className="text-xs text-slate-400">
          Descrição
          <textarea
            className="mt-1 min-h-[80px] w-full rounded-2xl bg-black/20 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, description: event.target.value }))
            }
          />
        </label>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Disciplinas no curso
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {orderedDisciplines.map((discipline) => {
              const selected = form.disciplineIds.includes(discipline.id);
              return (
                <label
                  key={discipline.id}
                  className={`cursor-pointer rounded-2xl border px-4 py-3 text-sm ${
                    selected
                      ? "border-brand-400 bg-brand-500/10 text-white"
                      : "border-white/10 bg-black/10 text-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mr-2 rounded border-white/10 bg-black/40"
                    checked={selected}
                    onChange={() => handleCoursePick(discipline.id)}
                  />
                  {discipline.name}
                </label>
              );
            })}
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting || updating || form.disciplineIds.length === 0}
          className="inline-flex items-center justify-center rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:opacity-50"
        >
          Registrar curso
        </button>
      </form>

      <div className="mt-8 space-y-4">
        {loading
          ? Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-32 animate-pulse rounded-2xl bg-white/5" />
            ))
          : courses.map((course) => (
              <article
                key={course.id}
                className="rounded-2xl border border-white/5 bg-white/5 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      Curso
                    </p>
                    <h3 className="text-xl font-semibold text-white">{course.name}</h3>
                    <p className="text-sm text-slate-300">{course.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-xs text-slate-400">
                    <span>
                      {course.disciplines.length} disciplinas · {course.turmas.length} turmas
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Deseja remover o curso "${course.name}" e todas as suas turmas?`
                          )
                        ) {
                          onDeleteCourse(course.id);
                        }
                      }}
                      disabled={updating}
                      className="rounded-2xl border border-white/10 bg-black/20 px-3 py-1 text-xs text-rose-200 hover:bg-rose-500/10 disabled:opacity-40"
                    >
                      Remover curso
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {course.disciplines.map((discipline) => (
                    <span
                      key={discipline.id}
                      className="rounded-full bg-black/20 px-3 py-1 text-xs text-slate-200"
                    >
                      {discipline.name}
                    </span>
                  ))}
                </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Turmas ativas
                  </p>
                  <div className="mt-2 space-y-2">
                    {course.turmas.length === 0 && (
                      <p className="text-xs text-slate-500">Sem turmas criadas ainda.</p>
                    )}
                    {course.turmas.map((turma) => (
                      <div
                        key={turma.id}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200"
                      >
                        <p className="font-semibold text-white">{turma.name}</p>
                        <p>
                          {turma.period} · {turma.students} alunos · mentor{" "}
                          {turma.mentor ?? "—"}
                        </p>
                        {(turma.startsAt || turma.endsAt) && (
                          <p>
                            {turma.startsAt ? new Date(turma.startsAt).toLocaleDateString("pt-BR") : "—"} -{" "}
                            {turma.endsAt ? new Date(turma.endsAt).toLocaleDateString("pt-BR") : "—"}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <form
                  className="rounded-2xl border border-white/10 bg-black/20 p-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleTurmaSubmit(course.id);
                  }}
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Nova turma
                  </p>
                  <div className="mt-3 space-y-2 text-xs text-slate-400">
                    <input
                      className="w-full rounded-xl bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                      placeholder="Nome da turma"
                      value={getTurmaForm(course.id).name}
                      onChange={(event) =>
                        setTurmaForms((prev) => ({
                          ...prev,
                          [course.id]: {
                            ...getTurmaForm(course.id),
                            name: event.target.value,
                          },
                        }))
                      }
                    />
                    <input
                      className="w-full rounded-xl bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                      placeholder="Período (ex.: 2024.2)"
                      value={getTurmaForm(course.id).period}
                      onChange={(event) =>
                        setTurmaForms((prev) => ({
                          ...prev,
                          [course.id]: {
                            ...getTurmaForm(course.id),
                            period: event.target.value,
                          },
                        }))
                      }
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-[11px]">
                        Início <span className="text-rose-400">*</span>
                        <input
                          type="date"
                          required
                          className="w-full rounded-xl bg-white/5 px-2 py-1 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                          value={getTurmaForm(course.id).startsAt}
                          onChange={(event) =>
                            setTurmaForms((prev) => ({
                              ...prev,
                              [course.id]: {
                                ...getTurmaForm(course.id),
                                startsAt: event.target.value,
                              },
                            }))
                          }
                        />
                      </label>
                      <label className="text-[11px]">
                        Fim (opcional)
                        <input
                          type="date"
                          className="w-full rounded-xl bg-white/5 px-2 py-1 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                          value={getTurmaForm(course.id).endsAt}
                          onChange={(event) =>
                            setTurmaForms((prev) => ({
                              ...prev,
                              [course.id]: {
                                ...getTurmaForm(course.id),
                                endsAt: event.target.value,
                              },
                            }))
                          }
                        />
                      </label>
                    </div>
                    <input
                      className="w-full rounded-xl bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                      placeholder="Mentor responsável"
                      value={getTurmaForm(course.id).mentor}
                      onChange={(event) =>
                        setTurmaForms((prev) => ({
                          ...prev,
                          [course.id]: {
                            ...getTurmaForm(course.id),
                            mentor: event.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={updating}
                    className="mt-3 inline-flex w-full items-center justify-center rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-400"
                  >
                    Registrar turma
                  </button>
                </form>
              </div>
            </article>
          ))}
      </div>
    </section>
  );
}
