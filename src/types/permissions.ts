import { UserRole } from "./auth";

// Módulos do sistema
export type SystemModule = 
  | "disciplines"
  | "courses"
  | "turmas"
  | "users"
  | "enrollments"
  | "content"
  | "reports"
  | "settings";

// Ações possíveis
export type PermissionAction = 
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "manage";

// Escopo da permissão
export type PermissionScope = 
  | "all"      // Todos os registros
  | "own"      // Apenas os próprios
  | "assigned" // Apenas os atribuídos
  | "none";    // Nenhum

// Permissão individual
export interface Permission {
  module: SystemModule;
  action: PermissionAction;
  scope: PermissionScope;
  description: string;
}

// Conjunto de permissões por role
export interface RolePermissions {
  role: UserRole;
  displayName: string;
  description: string;
  permissions: Permission[];
  priority: number; // Para ordenação (master=1, aluno=4)
}

// Matriz de permissões padrão
export const DEFAULT_PERMISSIONS: Record<UserRole, RolePermissions> = {
  master: {
    role: "master",
    displayName: "Master (Administrador)",
    description: "Acesso total ao sistema - pode gerenciar tudo",
    priority: 1,
    permissions: [
      { module: "disciplines", action: "view", scope: "all", description: "Ver todas as disciplinas" },
      { module: "disciplines", action: "create", scope: "all", description: "Criar disciplinas" },
      { module: "disciplines", action: "edit", scope: "all", description: "Editar qualquer disciplina" },
      { module: "disciplines", action: "delete", scope: "all", description: "Deletar qualquer disciplina" },
      { module: "disciplines", action: "manage", scope: "all", description: "Gerenciar status e tutores" },
      
      { module: "courses", action: "view", scope: "all", description: "Ver todos os cursos" },
      { module: "courses", action: "create", scope: "all", description: "Criar cursos" },
      { module: "courses", action: "edit", scope: "all", description: "Editar qualquer curso" },
      { module: "courses", action: "delete", scope: "all", description: "Deletar qualquer curso" },
      { module: "courses", action: "manage", scope: "all", description: "Gerenciar cursos completos" },
      
      { module: "turmas", action: "view", scope: "all", description: "Ver todas as turmas" },
      { module: "turmas", action: "create", scope: "all", description: "Criar turmas" },
      { module: "turmas", action: "edit", scope: "all", description: "Editar qualquer turma" },
      { module: "turmas", action: "delete", scope: "all", description: "Deletar qualquer turma" },
      { module: "turmas", action: "manage", scope: "all", description: "Gerenciar turmas completas" },
      
      { module: "users", action: "view", scope: "all", description: "Ver todos os usuários" },
      { module: "users", action: "create", scope: "all", description: "Criar usuários" },
      { module: "users", action: "edit", scope: "all", description: "Editar qualquer usuário" },
      { module: "users", action: "delete", scope: "all", description: "Deletar usuários" },
      { module: "users", action: "manage", scope: "all", description: "Gerenciar roles e permissões" },
      
      { module: "enrollments", action: "view", scope: "all", description: "Ver todas as matrículas" },
      { module: "enrollments", action: "create", scope: "all", description: "Matricular alunos" },
      { module: "enrollments", action: "edit", scope: "all", description: "Editar matrículas" },
      { module: "enrollments", action: "delete", scope: "all", description: "Remover matrículas" },
      
      { module: "content", action: "view", scope: "all", description: "Ver todo o conteúdo" },
      { module: "content", action: "create", scope: "all", description: "Criar conteúdo" },
      { module: "content", action: "edit", scope: "all", description: "Editar qualquer conteúdo" },
      { module: "content", action: "delete", scope: "all", description: "Deletar conteúdo" },
      
      { module: "reports", action: "view", scope: "all", description: "Ver todos os relatórios" },
      { module: "reports", action: "manage", scope: "all", description: "Gerar relatórios avançados" },
      
      { module: "settings", action: "view", scope: "all", description: "Ver configurações" },
      { module: "settings", action: "manage", scope: "all", description: "Alterar configurações do sistema" },
    ],
  },
  
  professor: {
    role: "professor",
    displayName: "Professor",
    description: "Pode gerenciar suas disciplinas e criar conteúdo",
    priority: 2,
    permissions: [
      { module: "disciplines", action: "view", scope: "all", description: "Ver todas as disciplinas" },
      { module: "disciplines", action: "create", scope: "all", description: "Criar disciplinas" },
      { module: "disciplines", action: "edit", scope: "own", description: "Editar apenas suas disciplinas" },
      { module: "disciplines", action: "delete", scope: "own", description: "Deletar apenas suas disciplinas" },
      
      { module: "courses", action: "view", scope: "all", description: "Ver todos os cursos" },
      { module: "courses", action: "create", scope: "all", description: "Criar cursos" },
      { module: "courses", action: "edit", scope: "own", description: "Editar apenas seus cursos" },
      { module: "courses", action: "delete", scope: "own", description: "Deletar apenas seus cursos" },
      
      { module: "turmas", action: "view", scope: "assigned", description: "Ver turmas atribuídas" },
      { module: "turmas", action: "create", scope: "own", description: "Criar turmas nos seus cursos" },
      { module: "turmas", action: "edit", scope: "assigned", description: "Editar turmas atribuídas" },
      
      { module: "users", action: "view", scope: "assigned", description: "Ver alunos das suas turmas" },
      
      { module: "enrollments", action: "view", scope: "assigned", description: "Ver matrículas das suas turmas" },
      
      { module: "content", action: "view", scope: "all", description: "Ver todo o conteúdo" },
      { module: "content", action: "create", scope: "own", description: "Criar conteúdo nas suas disciplinas" },
      { module: "content", action: "edit", scope: "own", description: "Editar seu conteúdo" },
      { module: "content", action: "delete", scope: "own", description: "Deletar seu conteúdo" },
      
      { module: "reports", action: "view", scope: "assigned", description: "Ver relatórios das suas turmas" },
    ],
  },
  
  tutor: {
    role: "tutor",
    displayName: "Tutor",
    description: "Pode auxiliar em disciplinas específicas",
    priority: 3,
    permissions: [
      { module: "disciplines", action: "view", scope: "assigned", description: "Ver disciplinas atribuídas" },
      { module: "disciplines", action: "edit", scope: "assigned", description: "Editar disciplinas atribuídas" },
      
      { module: "courses", action: "view", scope: "assigned", description: "Ver cursos relacionados" },
      
      { module: "turmas", action: "view", scope: "assigned", description: "Ver turmas atribuídas" },
      
      { module: "users", action: "view", scope: "assigned", description: "Ver alunos das turmas" },
      
      { module: "enrollments", action: "view", scope: "assigned", description: "Ver matrículas" },
      
      { module: "content", action: "view", scope: "assigned", description: "Ver conteúdo das disciplinas" },
      { module: "content", action: "edit", scope: "assigned", description: "Editar conteúdo atribuído" },
      
      { module: "reports", action: "view", scope: "assigned", description: "Ver relatórios básicos" },
    ],
  },
  
  aluno: {
    role: "aluno",
    displayName: "Aluno",
    description: "Pode acessar cursos e conteúdo matriculado",
    priority: 4,
    permissions: [
      { module: "disciplines", action: "view", scope: "assigned", description: "Ver disciplinas matriculadas" },
      
      { module: "courses", action: "view", scope: "assigned", description: "Ver cursos matriculados" },
      
      { module: "turmas", action: "view", scope: "assigned", description: "Ver suas turmas" },
      
      { module: "users", action: "view", scope: "own", description: "Ver seu próprio perfil" },
      { module: "users", action: "edit", scope: "own", description: "Editar seu próprio perfil" },
      
      { module: "content", action: "view", scope: "assigned", description: "Ver conteúdo das disciplinas" },
      
      { module: "reports", action: "view", scope: "own", description: "Ver seu próprio progresso" },
    ],
  },
};

// Helper para verificar se usuário tem permissão
export function hasPermission(
  userRole: UserRole,
  module: SystemModule,
  action: PermissionAction,
  requiredScope: PermissionScope = "all"
): boolean {
  const rolePerms = DEFAULT_PERMISSIONS[userRole];
  
  const permission = rolePerms.permissions.find(
    (p) => p.module === module && p.action === action
  );
  
  if (!permission) return false;
  
  // Se requer "all" mas usuário tem "own" ou "assigned", não pode
  if (requiredScope === "all" && permission.scope !== "all") return false;
  
  // Se requer "assigned" mas usuário tem "none", não pode
  if (requiredScope === "assigned" && permission.scope === "none") return false;
  
  return true;
}

// Helper para obter todas as permissões de um módulo
export function getModulePermissions(
  userRole: UserRole,
  module: SystemModule
): Permission[] {
  return DEFAULT_PERMISSIONS[userRole].permissions.filter(
    (p) => p.module === module
  );
}

// Helper para comparar hierarquia de roles
export function isHigherRole(role1: UserRole, role2: UserRole): boolean {
  return DEFAULT_PERMISSIONS[role1].priority < DEFAULT_PERMISSIONS[role2].priority;
}
