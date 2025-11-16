import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchDashboardData, supabase } from "@/lib/supabase";
import { DashboardData, DisciplineRecord, LearningBlock } from "@/types/dashboard";
import { FALLBACK_DASHBOARD } from "@/data/fallback";

export type DashboardFilters = {
  search: string;
  status: "todas" | "ativa" | "planejamento" | "pausada";
};

export type CreateDisciplinePayload = {
  name: string;
  code: string;
  level: string;
  status: DisciplineRecord["status"];
  description: string;
  ementa: string;
  tags: string[];
  nextReviewAt: string;
  learningBlocks: LearningBlock[];
  coverUrl?: string;
};

const defaultFilters: DashboardFilters = {
  search: "",
  status: "todas",
};

export function useDisciplineDashboard() {
  const [data, setData] = useState<DashboardData>(FALLBACK_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);
  const [updating, setUpdating] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await fetchDashboardData();
      setData(payload);
    } catch (err) {
      console.error(err);
      setError("Não foi possível carregar as disciplinas agora.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredDisciplines = useMemo(() => {
    return data.disciplines.filter((discipline) => {
      const matchesStatus =
        filters.status === "todas" || discipline.status === filters.status;
      const matchesSearch =
        filters.search.length === 0 ||
        discipline.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        discipline.code.toLowerCase().includes(filters.search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [data, filters]);

  const updateDiscipline = useCallback(
    async (disciplineId: string, payload: Partial<DisciplineRecord>) => {
      setUpdating(true);
      try {
        if (supabase) {
          const updates: Record<string, unknown> = {};

          if (payload.name !== undefined) updates.name = payload.name;
          if (payload.description !== undefined)
            updates.description = payload.description;
          if (payload.status !== undefined) updates.status = payload.status;
          if (payload.level !== undefined) updates.level = payload.level;
          if (payload.tags !== undefined) updates.tags = payload.tags;
          if (payload.nextReviewAt !== undefined)
            updates.next_review_at = payload.nextReviewAt;
          if (payload.ementa !== undefined) updates.ementa = payload.ementa;
          if (payload.learningBlocks !== undefined)
            updates.learning_blocks = payload.learningBlocks;

          const { error: updateError } = await supabase
            .from("disciplines")
            .update(updates)
            .eq("id", disciplineId);

          if (updateError) {
            throw updateError;
          }
        }

        setData((previous) => ({
          ...previous,
          disciplines: previous.disciplines.map((disc) =>
            disc.id === disciplineId ? { ...disc, ...payload } : disc
          ),
        }));
      } catch (err) {
        console.error(err);
        setError("Não conseguimos salvar as alterações.");
      } finally {
        setUpdating(false);
      }
    },
    []
  );

  const assignTutor = useCallback(
    async (disciplineId: string, tutorId: string) => {
      setUpdating(true);
      try {
        if (supabase) {
          const { error: assignmentError } = await supabase
            .from("discipline_tutors")
            .insert({ discipline_id: disciplineId, tutor_id: tutorId });

          if (assignmentError) {
            throw assignmentError;
          }
        }
        await loadData();
      } catch (err) {
        console.error(err);
        setError("Falha ao vincular tutor.");
      } finally {
        setUpdating(false);
      }
    },
    [loadData]
  );

  const registerAction = useCallback(
    async (
      disciplineId: string,
      label: string,
      type: DisciplineRecord["pendingActions"][number]["type"],
      dueDate: string
    ) => {
      setUpdating(true);
      try {
        if (supabase) {
          const { error: insertError } = await supabase
            .from("discipline_actions")
            .insert({
              discipline_id: disciplineId,
              label,
              type,
              due_date: dueDate,
            });

          if (insertError) {
            throw insertError;
          }
        }
        await loadData();
      } catch (err) {
        console.error(err);
        setError("Não foi possível registrar a ação.");
      } finally {
        setUpdating(false);
      }
    },
    [loadData]
  );

  const createDiscipline = useCallback(
    async (payload: CreateDisciplinePayload) => {
      setUpdating(true);
      setError(null);
      try {
        if (supabase) {
          const { error: insertError } = await supabase.from("disciplines").insert({
            name: payload.name,
            code: payload.code,
            description: payload.description,
            ementa: payload.ementa,
            tags: payload.tags,
            cover_url: payload.coverUrl,
            level: payload.level,
            status: payload.status,
            next_review_at: payload.nextReviewAt,
            learning_blocks: payload.learningBlocks,
          });

          if (insertError) {
            throw insertError;
          }
          await loadData();
        } else {
          const newRecord: DisciplineRecord = {
            id: `local-${Date.now()}`,
            name: payload.name,
            code: payload.code,
            level: payload.level,
            status: payload.status,
            description: payload.description,
            ementa: payload.ementa,
            tags: payload.tags,
            coverUrl: payload.coverUrl,
            tutors: [],
            stats: {
              activeStudents: 0,
              completionRate: 0,
              satisfaction: 0,
              engagements: [0, 0, 0, 0, 0, 0, 0],
              studyTime: 0,
              updatedAt: new Date().toISOString(),
            },
            objectives: [],
            nextReviewAt: payload.nextReviewAt,
            pendingActions: [],
            learningBlocks: payload.learningBlocks,
          };

          setData((previous) => ({
            ...previous,
            summary: {
              ...previous.summary,
              totalDisciplines: previous.summary.totalDisciplines + 1,
            },
            disciplines: [newRecord, ...previous.disciplines],
          }));
        }
      } catch (err) {
        console.error(err);
        setError("Não foi possível cadastrar a disciplina.");
        throw err;
      } finally {
        setUpdating(false);
      }
    },
    [loadData]
  );

  return {
    data,
    loading,
    error,
    filters,
    setFilters,
    filteredDisciplines,
    refresh: loadData,
    updateDiscipline,
    assignTutor,
    registerAction,
    updating,
    createDiscipline,
  };
}
