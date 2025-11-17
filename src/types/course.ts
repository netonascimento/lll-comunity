import { DisciplineRecord } from "./dashboard";

export interface CourseRecord {
  id: string;
  name: string;
  description: string;
  coverUrl?: string;
  createdBy: string;
  disciplines: DisciplineRecord[];
  turmas: CourseTurma[];
}

export interface CourseTurma {
  id: string;
  name: string;
  period: string;
  startsAt?: string;
  endsAt?: string;
  mentor?: string;
  students: number;
}

export interface StudentCourseAccess {
  courseId: string;
  turmaId?: string;
  progress: number;
}

export interface CourseManagerData {
  courses: CourseRecord[];
  studentCourses: CourseRecord[];
}

export interface CreateCoursePayload {
  name: string;
  description: string;
  coverUrl?: string;
  disciplineIds: string[];
  createdBy: string;
}

export interface CreateTurmaPayload {
  courseId: string;
  name: string;
  period: string;
  startsAt: string;
  endsAt?: string;
  mentor?: string;
}
