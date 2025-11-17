import { CourseRecord } from "@/types/course";
import { BookOpen } from "lucide-react";

type StudentCoursesSectionProps = {
  courses: CourseRecord[];
};

export function StudentCoursesSection({ courses }: StudentCoursesSectionProps) {
  if (courses.length === 0) {
    return (
      <section className="rounded-3xl border border-white/10 bg-black/20 p-6 text-sm text-slate-300">
        Ainda não há cursos liberados para você. Quando um tutor te adicionar em uma turma,
        os acessos aparecerão aqui.
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {courses.map((course) => (
        <article
          key={course.id}
          className="glass-panel rounded-3xl border border-white/5 p-5 text-white"
        >
          <div className="flex gap-4">
            <div className="hidden h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/20 text-brand-200 sm:flex">
              <BookOpen className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.3em] text-brand-200">
                Meu curso
              </p>
              <h3 className="text-2xl font-semibold">{course.name}</h3>
              <p className="text-sm text-slate-300">{course.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {course.disciplines.map((disc) => (
                  <span
                    key={disc.id}
                    className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-200"
                  >
                    {disc.name}
                  </span>
                ))}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {course.turmas.slice(0, 2).map((turma) => (
                  <div
                    key={turma.id}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-slate-200"
                  >
                    <p className="text-sm font-semibold text-white">{turma.name}</p>
                    <p>
                      {turma.period} · mentor {turma.mentor ?? "—"} · {turma.students} alunos
                    </p>
                    <p>
                      {new Date(turma.startsAt).toLocaleDateString("pt-BR")} -{" "}
                      {new Date(turma.endsAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
