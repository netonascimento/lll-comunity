export type UserRole = "master" | "tutor" | "professor" | "aluno";
export type UserStatus = "active" | "inactive";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
}

export interface PermissionSet {
  canCreateDiscipline: boolean;
  canEditAnyDiscipline: boolean;
  canEditOwnDiscipline: boolean;
  canUpdateAnyStatus: boolean;
  canUpdateOwnStatus: boolean;
  canAssignTutor: boolean;
  canManageUsers: boolean;
}
