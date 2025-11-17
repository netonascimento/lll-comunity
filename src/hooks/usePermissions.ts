import { useMemo } from "react";
import { UserRole } from "@/types/auth";
import {
  SystemModule,
  PermissionAction,
  PermissionScope,
  hasPermission,
  getModulePermissions,
  isHigherRole,
  DEFAULT_PERMISSIONS,
} from "@/types/permissions";

export function usePermissions(userRole: UserRole) {
  const permissions = useMemo(() => {
    const roleData = DEFAULT_PERMISSIONS[userRole];
    
    return {
      // Dados básicos da role
      role: userRole,
      displayName: roleData.displayName,
      description: roleData.description,
      allPermissions: roleData.permissions,
      
      // Helpers de verificação
      can: (
        module: SystemModule,
        action: PermissionAction,
        scope: PermissionScope = "all"
      ) => hasPermission(userRole, module, action, scope),
      
      canManage: (module: SystemModule) => 
        hasPermission(userRole, module, "manage", "all"),
      
      canView: (module: SystemModule, scope: PermissionScope = "all") =>
        hasPermission(userRole, module, "view", scope),
      
      canCreate: (module: SystemModule) =>
        hasPermission(userRole, module, "create"),
      
      canEdit: (module: SystemModule, scope: PermissionScope = "all") =>
        hasPermission(userRole, module, "edit", scope),
      
      canDelete: (module: SystemModule, scope: PermissionScope = "all") =>
        hasPermission(userRole, module, "delete", scope),
      
      getModulePerms: (module: SystemModule) =>
        getModulePermissions(userRole, module),
      
      isHigherThan: (otherRole: UserRole) =>
        isHigherRole(userRole, otherRole),
      
      // Shortcuts para módulos comuns
      disciplines: {
        canView: hasPermission(userRole, "disciplines", "view"),
        canCreate: hasPermission(userRole, "disciplines", "create"),
        canEdit: hasPermission(userRole, "disciplines", "edit"),
        canEditOwn: hasPermission(userRole, "disciplines", "edit", "own"),
        canEditAll: hasPermission(userRole, "disciplines", "edit", "all"),
        canDelete: hasPermission(userRole, "disciplines", "delete"),
        canManage: hasPermission(userRole, "disciplines", "manage"),
      },
      
      courses: {
        canView: hasPermission(userRole, "courses", "view"),
        canCreate: hasPermission(userRole, "courses", "create"),
        canEdit: hasPermission(userRole, "courses", "edit"),
        canEditOwn: hasPermission(userRole, "courses", "edit", "own"),
        canEditAll: hasPermission(userRole, "courses", "edit", "all"),
        canDelete: hasPermission(userRole, "courses", "delete"),
        canManage: hasPermission(userRole, "courses", "manage"),
      },
      
      turmas: {
        canView: hasPermission(userRole, "turmas", "view"),
        canCreate: hasPermission(userRole, "turmas", "create"),
        canEdit: hasPermission(userRole, "turmas", "edit"),
        canDelete: hasPermission(userRole, "turmas", "delete"),
        canManage: hasPermission(userRole, "turmas", "manage"),
      },
      
      users: {
        canView: hasPermission(userRole, "users", "view"),
        canCreate: hasPermission(userRole, "users", "create"),
        canEdit: hasPermission(userRole, "users", "edit"),
        canEditOwn: hasPermission(userRole, "users", "edit", "own"),
        canDelete: hasPermission(userRole, "users", "delete"),
        canManage: hasPermission(userRole, "users", "manage"),
      },
      
      content: {
        canView: hasPermission(userRole, "content", "view"),
        canCreate: hasPermission(userRole, "content", "create"),
        canEdit: hasPermission(userRole, "content", "edit"),
        canEditOwn: hasPermission(userRole, "content", "edit", "own"),
        canDelete: hasPermission(userRole, "content", "delete"),
      },
      
      reports: {
        canView: hasPermission(userRole, "reports", "view"),
        canViewOwn: hasPermission(userRole, "reports", "view", "own"),
        canViewAll: hasPermission(userRole, "reports", "view", "all"),
        canManage: hasPermission(userRole, "reports", "manage"),
      },
      
      settings: {
        canView: hasPermission(userRole, "settings", "view"),
        canManage: hasPermission(userRole, "settings", "manage"),
      },
      
      // Flags de papel
      isMaster: userRole === "master",
      isProfessor: userRole === "professor",
      isTutor: userRole === "tutor",
      isAluno: userRole === "aluno",
      
      // Flags de capacidade
      isAdmin: userRole === "master",
      canTeach: userRole === "master" || userRole === "professor" || userRole === "tutor",
      canOnlyView: userRole === "aluno",
    };
  }, [userRole]);
  
  return permissions;
}
