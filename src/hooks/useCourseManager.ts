import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FALLBACK_COURSES, FALLBACK_ENROLLMENTS } from "@/data/fallback";
import {
  CourseRecord,
  CourseTurma,
  CreateCoursePayload,
  CreateTurmaPayload,
} from "@/types/course";
import { DisciplineRecord } from "@/types/dashboard";

type CourseState = {
  courses: CourseRecord[];
  studentCourses: CourseRecord[];
};

const buildCoursesFromFallback = (disciplines: DisciplineRecord[]): CourseRecord[] => {
  return FALLBACK_COURSES.map((course) => ({
    id: course.id,
    name: course.name,
    description: course.description,
    coverUrl: course.coverUrl,
    createdBy: course.createdBy,
    disciplines: disciplines.filter((disc) => course.disciplineIds.includes(disc.id)),
    turmas: course.turmas,
  }));
};

const filterStudentCourses = (
  courses: CourseRecord[],
  currentUserId?: string
): CourseRecord[] => {
  if (!currentUserId) return [];
  const access = FALLBACK_ENROLLMENTS.filter((item) => item.userId === currentUserId);
  return courses.filter((course) =>
    access.some((item) => item.courseId === course.id)
  );
};

export function useCourseManager(
  disciplinePool: DisciplineRecord[],
  currentUserId?: string
) {
  const [state, setState] = useState<CourseState>({
    courses: buildCoursesFromFallback(disciplinePool),
    studentCourses: filterStudentCourses(
      buildCoursesFromFallback(disciplinePool),
      currentUserId
    ),
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!supabase) {
      const fallbackCourses = buildCoursesFromFallback(disciplinePool);
      setState({
        courses: fallbackCourses,
        studentCourses: filterStudentCourses(fallbackCourses, currentUserId),
      });
      setLoading(false);
      return;
    }

    const { data, error: selectError } = await supabase
      .from("courses")
      .select(
        `
        id,
        name,
        description,
        cover_url,
        created_by,
        course_disciplines (
          discipline:disciplines (*)
        ),
        turmas:courses_turmas (
          id,
          name,
          period,
          starts_at,
          ends_at,
          mentor
        )
      `
      );

    if (selectError) {
      console.error("Error loading courses:", selectError);
      setError(selectError.message ?? "Não foi possível carregar os cursos.");
      setLoading(false);
      return;
    }
    
    console.log("Courses loaded:", data);

    const courses: CourseRecord[] =
      data?.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        coverUrl: row.cover_url ?? undefined,
        createdBy: row.created_by ?? "",
        disciplines: (row.course_disciplines ?? [])
          .map((item: any) => item?.discipline as DisciplineRecord | null)
          .filter(
            (disc: DisciplineRecord | null): disc is DisciplineRecord => Boolean(disc)
          ),
        turmas: (row.turmas ?? []).map((turma: any) => {
          console.log("Mapping turma:", turma);
          return {
            id: turma.id,
            name: turma.name,
            period: turma.period,
            startsAt: turma.starts_at ?? undefined,
            endsAt: turma.ends_at ?? undefined,
            mentor: turma.mentor ?? undefined,
            students: 0, // TODO: implementar contagem de alunos
          };
        }),
      })) ?? [];

    let studentCourses: CourseRecord[] = [];
    if (currentUserId) {
      const { data: enrollmentData } = await supabase
        .from("course_enrollments")
        .select("course_id")
        .eq("student_id", currentUserId);
      const accessibleIds = enrollmentData?.map((item) => item.course_id) ?? [];
      studentCourses = courses.filter((course) => accessibleIds.includes(course.id));
    }

    setState({
      courses,
      studentCourses,
    });
    setLoading(false);
  }, [currentUserId, disciplinePool]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const createCourse = useCallback(
    async (payload: CreateCoursePayload) => {
      setUpdating(true);
      setError(null);
      try {
        if (supabase) {
          const { data, error: insertError } = await supabase
            .from("courses")
            .insert({
              name: payload.name,
              description: payload.description,
              cover_url: payload.coverUrl,
              created_by: payload.createdBy,
            })
            .select("id")
            .single();

          if (insertError || !data) {
            const errorMessage = insertError?.message ?? "Falha ao criar curso.";
            throw new Error(errorMessage);
          }

          if (payload.disciplineIds.length > 0) {
            const rows = payload.disciplineIds.map((disciplineId, index) => ({
              course_id: data.id,
              discipline_id: disciplineId,
              order_index: index,
            }));
            const { error: relError } = await supabase
              .from("course_disciplines")
              .insert(rows);
            if (relError) throw new Error(relError.message);
          }
          
          // Otimistic update - adiciona o novo curso imediatamente
          const disciplines = disciplinePool.filter((disc: DisciplineRecord) =>
            payload.disciplineIds.includes(disc.id)
          );
          const newCourse: CourseRecord = {
            id: data.id,
            name: payload.name,
            description: payload.description,
            coverUrl: payload.coverUrl,
            createdBy: payload.createdBy,
            disciplines,
            turmas: [],
          };
          
          setState((prev) => ({
            ...prev,
            courses: [newCourse, ...prev.courses],
          }));
          
          // Depois recarrega para garantir sincronização
          await loadCourses();
        } else {
          const disciplines = disciplinePool.filter((disc: DisciplineRecord) =>
            payload.disciplineIds.includes(disc.id)
          );
          setState((prev) => ({
            ...prev,
            courses: [
              {
                id: `course-${Date.now()}`,
                name: payload.name,
                description: payload.description,
                coverUrl: payload.coverUrl,
                createdBy: payload.createdBy,
                disciplines,
                turmas: [],
              },
              ...prev.courses,
            ],
          }));
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Não conseguimos criar este curso.");
        // Recarrega para descartar qualquer estado inconsistente
        await loadCourses();
      } finally {
        setUpdating(false);
      }
    },
    [loadCourses, disciplinePool]
  );

  const createTurma = useCallback(
    async (payload: CreateTurmaPayload) => {
      setUpdating(true);
      setError(null);
      try {
        if (supabase) {
          const { data, error: insertError } = await supabase
            .from("courses_turmas")
            .insert({
              course_id: payload.courseId,
              name: payload.name,
              period: payload.period,
              starts_at: payload.startsAt,
              ends_at: payload.endsAt || null,
              mentor: payload.mentor || null,
            })
            .select("id")
            .single();
          
          if (insertError || !data) {
            throw new Error(insertError?.message || "Falha ao criar turma");
          }
          
          // Otimistic update - adiciona turma imediatamente
          const newTurma: CourseTurma = {
            id: data.id,
            name: payload.name,
            period: payload.period,
            startsAt: payload.startsAt,
            endsAt: payload.endsAt,
            mentor: payload.mentor,
            students: 0,
          };
          
          setState((prev) => ({
            ...prev,
            courses: prev.courses.map((course) =>
              course.id === payload.courseId
                ? {
                    ...course,
                    turmas: [...course.turmas, newTurma],
                  }
                : course
            ),
          }));
          
          // Depois recarrega para garantir sincronização
          await loadCourses();
        } else {
          setState((prev) => ({
            ...prev,
            courses: prev.courses.map((course) =>
              course.id === payload.courseId
                ? {
                    ...course,
                    turmas: [
                      ...course.turmas,
                      {
                        id: `turma-${Date.now()}`,
                        name: payload.name,
                        period: payload.period,
                        startsAt: payload.startsAt,
                        endsAt: payload.endsAt,
                        mentor: payload.mentor,
                        students: 0,
                      },
                    ],
                  }
                : course
            ),
          }));
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Falha ao criar turma.");
        // Recarrega em caso de erro para garantir consistência
        await loadCourses();
      } finally {
        setUpdating(false);
      }
    },
    [loadCourses]
  );

  const deleteCourse = useCallback(
    async (courseId: string) => {
      setUpdating(true);
      setError(null);
      try {
        if (supabase) {
          const { error: deleteError } = await supabase
            .from("courses")
            .delete()
            .eq("id", courseId);
          if (deleteError) {
            throw new Error(deleteError.message);
          }
          await loadCourses();
        } else {
          setState((prev) => ({
            ...prev,
            courses: prev.courses.filter((course) => course.id !== courseId),
            studentCourses: prev.studentCourses.filter((course) => course.id !== courseId),
          }));
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Falha ao remover o curso.");
      } finally {
        setUpdating(false);
      }
    },
    [loadCourses]
  );

  const courses = state.courses;
  const studentCourses = state.studentCourses;

  return {
    courses,
    studentCourses,
    loading,
    error,
    updating,
    createCourse,
    createTurma,
    deleteCourse,
    reload: loadCourses,
  };
}
