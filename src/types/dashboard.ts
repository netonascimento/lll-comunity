export type DisciplineStatus = "ativa" | "planejamento" | "pausada";

export interface Tutor {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  expertise: string[];
}

export interface LearningResource {
  id: string;
  title: string;
  url: string;
}

export interface LearningBlock {
  id: string;
  title: string;
  description: string;
  videos: LearningResource[];
  documents: LearningResource[];
}

export interface DisciplineStats {
  activeStudents: number;
  completionRate: number;
  satisfaction: number;
  engagements: number[];
  studyTime: number;
  updatedAt: string;
}

export interface DisciplineRecord {
  id: string;
  name: string;
  code: string;
  level: string;
  status: DisciplineStatus;
  description: string;
  ementa: string;
  tags: string[];
  coverUrl?: string;
  tutors: Tutor[];
  stats: DisciplineStats;
  objectives: string[];
  nextReviewAt: string;
  pendingActions: {
    type: "atualizacao" | "feedback" | "mentoria";
    label: string;
    dueDate: string;
  }[];
  learningBlocks: LearningBlock[];
  createdBy: string;
}

export interface DashboardSummary {
  totalDisciplines: number;
  activeStudents: number;
  satisfaction: number;
  completionRate: number;
}

export interface DashboardTimelineEvent {
  id: string;
  disciplineId: string;
  title: string;
  type: "material" | "forum" | "mentoria";
  timeAgo: string;
  owner: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  disciplines: DisciplineRecord[];
  timeline: DashboardTimelineEvent[];
}
