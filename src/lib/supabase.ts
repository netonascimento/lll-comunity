import { createClient } from "@supabase/supabase-js";
import { FALLBACK_DASHBOARD } from "@/data/fallback";
import {
  DashboardData,
  DashboardTimelineEvent,
  DisciplineRecord,
  DisciplineStatus,
  LearningBlock,
  LearningResource,
  Tutor,
} from "@/types/dashboard";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: true, detectSessionInUrl: true },
      })
    : null;

type SupabaseTutorRow = {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  expertise?: string[] | null;
};

type SupabaseDisciplineStatsRow = {
  active_students: number;
  completion_rate: number;
  satisfaction: number;
  engagements: number[];
  study_time: number;
  updated_at: string;
};

type SupabasePendingActionRow = {
  type: "atualizacao" | "feedback" | "mentoria";
  label: string;
  due_date: string;
};

type SupabaseDisciplineRow = {
  id: string;
  name: string;
  code: string;
  level: string;
  status: DisciplineStatus;
  description: string;
  ementa?: string | null;
  tags?: string[] | null;
  cover_url?: string | null;
  next_review_at?: string | null;
  created_by?: string | null;
  stats?: SupabaseDisciplineStatsRow | SupabaseDisciplineStatsRow[] | null;
  objectives?: { text: string }[] | null;
  pending_actions?: SupabasePendingActionRow[] | null;
  learning_blocks?: SupabaseLearningBlockRow[] | null;
  tutors?: {
    tutor: SupabaseTutorRow | SupabaseTutorRow[] | null;
  }[] | null;
};

type SupabaseLearningResourceRow = {
  id: string;
  title: string;
  url: string;
};

type SupabaseLearningBlockRow = {
  id: string;
  title: string;
  description: string;
  videos?: SupabaseLearningResourceRow[] | null;
  documents?: SupabaseLearningResourceRow[] | null;
};

type SupabaseTimelineRow = {
  id: string;
  discipline_id: string;
  title: string;
  type: "material" | "forum" | "mentoria";
  time_ago: string;
  owner: string;
};

const normalizeTutor = (row: SupabaseTutorRow): Tutor => ({
  id: row.id,
  name: row.name,
  email: row.email,
  avatarUrl: row.avatar_url ?? undefined,
  expertise: row.expertise ?? [],
});

const normalizeDiscipline = (row: SupabaseDisciplineRow): DisciplineRecord => {
  const statsRow = Array.isArray(row.stats) ? row.stats[0] : row.stats;

  return {
    id: row.id,
    name: row.name,
    code: row.code,
    level: row.level,
    status: row.status,
    description: row.description,
    ementa: row.ementa ?? "",
    tags: row.tags ?? [],
    coverUrl: row.cover_url ?? undefined,
    tutors: normalizeTutorRelations(row.tutors),
    stats: {
      activeStudents: statsRow?.active_students ?? 0,
      completionRate: statsRow?.completion_rate ?? 0,
      satisfaction: statsRow?.satisfaction ?? 0,
      engagements: statsRow?.engagements ?? [],
      studyTime: statsRow?.study_time ?? 0,
      updatedAt: statsRow?.updated_at ?? new Date().toISOString(),
    },
    objectives: (row.objectives ?? []).map((obj) => obj.text),
    nextReviewAt: row.next_review_at ?? new Date().toISOString(),
    pendingActions: (row.pending_actions ?? []).map((action) => ({
      type: action.type,
      label: action.label,
      dueDate: action.due_date,
    })),
    learningBlocks: (row.learning_blocks ?? []).map(normalizeLearningBlock),
    createdBy: row.created_by ?? "",
  };
};

const normalizeLearningResource = (
  resource: SupabaseLearningResourceRow
): LearningResource => ({
  id: resource.id,
  title: resource.title,
  url: resource.url,
});

const normalizeLearningBlock = (
  block: SupabaseLearningBlockRow
): LearningBlock => ({
  id: block.id,
  title: block.title,
  description: block.description,
  videos: (block.videos ?? []).map(normalizeLearningResource),
  documents: (block.documents ?? []).map(normalizeLearningResource),
});

const normalizeTutorRelations = (
  relations: SupabaseDisciplineRow["tutors"]
): Tutor[] => {
  if (!relations) return [];

  return relations
    .flatMap((rel) => {
      const data = rel.tutor;
      if (!data) return [];
      if (Array.isArray(data)) {
        return data.map(normalizeTutor);
      }
      return [normalizeTutor(data)];
    })
    .filter(Boolean);
};

const normalizeTimeline = (row: SupabaseTimelineRow): DashboardTimelineEvent => ({
  id: row.id,
  disciplineId: row.discipline_id,
  title: row.title,
  type: row.type,
  timeAgo: row.time_ago,
  owner: row.owner,
});

export async function fetchDashboardData(): Promise<DashboardData> {
  if (!supabase) {
    return FALLBACK_DASHBOARD;
  }

  const [disciplineResponse, timelineResponse] = await Promise.all([
    supabase
      .from("disciplines")
      .select(
        `
        id,
        name,
        code,
        level,
        status,
        description,
        ementa,
        tags,
        cover_url,
        next_review_at,
        created_by,
        stats:discipline_stats (
          active_students,
          completion_rate,
          satisfaction,
          engagements,
          study_time,
          updated_at
        ),
        objectives:discipline_objectives ( text ),
        pending_actions:discipline_actions (
          type,
          label,
          due_date
        ),
        learning_blocks,
        tutors:discipline_tutors (
          tutor:tutors (
            id,
            name,
            email,
            avatar_url,
            expertise
          )
        )
      `
      ),
    supabase
      .from("discipline_events")
      .select("id, discipline_id, title, type, time_ago, owner")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  if (disciplineResponse.error) {
    console.warn("[supabase] disciplinas:", disciplineResponse.error.message);
    return FALLBACK_DASHBOARD;
  }

  if (timelineResponse.error) {
    console.warn("[supabase] timeline:", timelineResponse.error.message);
  }

  const disciplines = (disciplineResponse.data ?? []).map(normalizeDiscipline);

  const summary = disciplines.reduce(
    (acc, disc) => {
      acc.totalDisciplines += 1;
      acc.activeStudents += disc.stats.activeStudents;
      acc.satisfaction += disc.stats.satisfaction;
      acc.completionRate += disc.stats.completionRate;
      return acc;
    },
    {
      totalDisciplines: 0,
      activeStudents: 0,
      satisfaction: 0,
      completionRate: 0,
    }
  );

  if (summary.totalDisciplines > 0) {
    summary.satisfaction = Math.round(
      summary.satisfaction / summary.totalDisciplines
    );
    summary.completionRate = Math.round(
      summary.completionRate / summary.totalDisciplines
    );
  }

  const timeline = (timelineResponse.data ?? []).map(normalizeTimeline);

  return {
    summary,
    disciplines,
    timeline,
  };
}
