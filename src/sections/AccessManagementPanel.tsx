import { useState } from "react";
import { UserRole } from "@/types/auth";
import {
  DEFAULT_PERMISSIONS,
  SystemModule,
  PermissionAction,
  PermissionScope,
  RolePermissions,
} from "@/types/permissions";
import { Shield, Users, BookOpen, GraduationCap, Settings, BarChart3, FileText, UserCog, Check, X } from "lucide-react";

const MODULE_ICONS: Record<SystemModule, any> = {
  disciplines: BookOpen,
  courses: GraduationCap,
  turmas: Users,
  users: UserCog,
  enrollments: FileText,
  content: FileText,
  reports: BarChart3,
  settings: Settings,
};

const MODULE_LABELS: Record<SystemModule, string> = {
  disciplines: "Disciplinas",
  courses: "Cursos",
  turmas: "Turmas",
  users: "Usuários",
  enrollments: "Matrículas",
  content: "Conteúdo",
  reports: "Relatórios",
  settings: "Configurações",
};

const ACTION_LABELS: Record<PermissionAction, string> = {
  view: "Visualizar",
  create: "Criar",
  edit: "Editar",
  delete: "Deletar",
  manage: "Gerenciar",
};

const SCOPE_LABELS: Record<PermissionScope, string> = {
  all: "Todos",
  own: "Próprios",
  assigned: "Atribuídos",
  none: "Nenhum",
};

const SCOPE_COLORS: Record<PermissionScope, string> = {
  all: "bg-green-500/20 text-green-300 border-green-500/30",
  own: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  assigned: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  none: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

type AccessManagementPanelProps = {
  currentUserRole: UserRole;
  onPermissionChange?: (
    role: UserRole, 
    module: SystemModule, 
    action: PermissionAction, 
    newScope: PermissionScope
  ) => Promise<void> | void;
  onSaveChanges?: (updatedPermissions: Record<UserRole, RolePermissions>) => Promise<void> | void;
};

export function AccessManagementPanel({
  currentUserRole,
  onPermissionChange,
  onSaveChanges,
}: AccessManagementPanelProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>("master");
  const [viewMode, setViewMode] = useState<"matrix" | "detailed">("matrix");
  const [editMode, setEditMode] = useState(false);
  const [localPermissions, setLocalPermissions] = useState(DEFAULT_PERMISSIONS);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const roles = Object.values(DEFAULT_PERMISSIONS).sort((a, b) => a.priority - b.priority);
  const selectedRoleData = editMode ? localPermissions[selectedRole] : DEFAULT_PERMISSIONS[selectedRole];
  
  // Agrupar permissões por módulo
  const permissionsByModule = selectedRoleData.permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<SystemModule, typeof selectedRoleData.permissions>);

  const modules = Object.keys(permissionsByModule) as SystemModule[];

  // Verificar se usuário atual pode gerenciar permissões
  const canManage = currentUserRole === "master";

  // Handler para mudar escopo de uma permissão
  const handleScopeChange = (
    module: SystemModule,
    action: PermissionAction,
    newScope: PermissionScope
  ) => {
    setLocalPermissions((prev) => {
      const updated = { ...prev };
      const rolePerms = { ...updated[selectedRole] };
      
      rolePerms.permissions = rolePerms.permissions.map((perm) => {
        if (perm.module === module && perm.action === action) {
          return { ...perm, scope: newScope };
        }
        return perm;
      });
      
      updated[selectedRole] = rolePerms;
      return updated;
    });
    
    setHasChanges(true);
    
    if (onPermissionChange) {
      onPermissionChange(selectedRole, module, action, newScope);
    }
  };

  // Handler para adicionar nova permissão
  const handleAddPermission = (module: SystemModule, action: PermissionAction) => {
    setLocalPermissions((prev) => {
      const updated = { ...prev };
      const rolePerms = { ...updated[selectedRole] };
      
      const exists = rolePerms.permissions.some(
        (p) => p.module === module && p.action === action
      );
      
      if (!exists) {
        rolePerms.permissions.push({
          module,
          action,
          scope: "none",
          description: `${ACTION_LABELS[action]} ${MODULE_LABELS[module]}`,
        });
      }
      
      updated[selectedRole] = rolePerms;
      return updated;
    });
    
    setHasChanges(true);
  };

  // Handler para remover permissão
  const handleRemovePermission = (module: SystemModule, action: PermissionAction) => {
    setLocalPermissions((prev) => {
      const updated = { ...prev };
      const rolePerms = { ...updated[selectedRole] };
      
      rolePerms.permissions = rolePerms.permissions.filter(
        (p) => !(p.module === module && p.action === action)
      );
      
      updated[selectedRole] = rolePerms;
      return updated;
    });
    
    setHasChanges(true);
  };

  // Salvar mudanças
  const handleSave = async () => {
    if (!onSaveChanges) {
      // Se não houver callback, apenas atualizar localStorage
      localStorage.setItem("custom_permissions", JSON.stringify(localPermissions));
      setHasChanges(false);
      setEditMode(false);
      alert("Permissões salvas localmente! Recarregue a página para aplicar.");
      return;
    }
    
    setSaving(true);
    try {
      await onSaveChanges(localPermissions);
      setHasChanges(false);
      setEditMode(false);
      alert("Permissões salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar permissões:", error);
      alert("Erro ao salvar permissões. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  // Cancelar edição
  const handleCancel = () => {
    setLocalPermissions(DEFAULT_PERMISSIONS);
    setHasChanges(false);
    setEditMode(false);
  };

  // Resetar para padrão
  const handleReset = () => {
    if (confirm("Deseja resetar todas as permissões para o padrão do sistema?")) {
      setLocalPermissions(DEFAULT_PERMISSIONS);
      setHasChanges(true);
    }
  };

  return (
    <section className="glass-panel rounded-3xl p-6">
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-brand-400" />
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Gestão de Acesso
            </h2>
            <p className="text-sm text-slate-300">
              Configure permissões por papel (role) e controle o acesso aos módulos do sistema
            </p>
          </div>
        </div>
      </div>

      {!canManage && (
        <div className="mb-4 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
          ⚠️ Você está visualizando o painel em modo somente leitura. Apenas Masters podem modificar permissões.
        </div>
      )}

      {canManage && editMode && hasChanges && (
        <div className="mb-4 rounded-2xl border border-brand-500/30 bg-brand-500/10 px-4 py-3 text-sm text-brand-200">
          ✏️ Você tem alterações não salvas. Clique em "Salvar Alterações" para aplicar.
        </div>
      )}

      {/* Barra de Ações */}
      {canManage && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-wrap items-center gap-2">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-400"
              >
                ✏️ Editar Permissões
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-400 disabled:opacity-50"
                >
                  {saving ? "Salvando..." : "💾 Salvar Alterações"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="rounded-xl bg-slate-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-500 disabled:opacity-50"
                >
                  ❌ Cancelar
                </button>
                <button
                  onClick={handleReset}
                  disabled={saving}
                  className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20 disabled:opacity-50"
                >
                  🔄 Resetar Padrão
                </button>
              </>
            )}
          </div>
          {editMode && (
            <span className="text-xs text-slate-400">
              {hasChanges ? `${Object.keys(localPermissions).length} roles editadas` : "Nenhuma alteração"}
            </span>
          )}
        </div>
      )}

      {/* Seletor de Role */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-3">
          Selecione o Papel
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role) => {
            const isSelected = role.role === selectedRole;
            const Icon = role.role === "master" ? Shield : 
                        role.role === "professor" ? GraduationCap :
                        role.role === "tutor" ? Users : UserCog;
            
            return (
              <button
                key={role.role}
                onClick={() => setSelectedRole(role.role)}
                className={`rounded-2xl border p-4 text-left transition ${
                  isSelected
                    ? "border-brand-400 bg-brand-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 ${isSelected ? "text-brand-400" : "text-slate-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold ${isSelected ? "text-white" : "text-slate-200"}`}>
                      {role.displayName}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {role.description}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {role.permissions.length} permissões
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toggle de Visualização */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Permissões de {selectedRoleData.displayName}
          </p>
          {editMode && (
            <p className="text-xs text-brand-400 mt-1">
              💡 {viewMode === "matrix" ? "Use os dropdowns para alterar os escopos" : "Clique nos dropdowns para editar ou no 🗑️ para remover"}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("matrix")}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
              viewMode === "matrix"
                ? "bg-brand-500 text-white"
                : "bg-white/5 text-slate-400 hover:bg-white/10"
            }`}
          >
            Matriz
          </button>
          <button
            onClick={() => setViewMode("detailed")}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
              viewMode === "detailed"
                ? "bg-brand-500 text-white"
                : "bg-white/5 text-slate-400 hover:bg-white/10"
            }`}
          >
            Detalhado
          </button>
        </div>
      </div>

      {/* Visualização em Matriz */}
      {viewMode === "matrix" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-400">
                  Módulo
                </th>
                {(["view", "create", "edit", "delete", "manage"] as PermissionAction[]).map((action) => (
                  <th key={action} className="px-4 py-3 text-center text-xs uppercase tracking-wider text-slate-400">
                    {ACTION_LABELS[action]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map((module) => {
                const Icon = MODULE_ICONS[module];
                const perms = permissionsByModule[module];
                
                return (
                  <tr key={module} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-slate-400" />
                        <span className="font-medium text-white">{MODULE_LABELS[module]}</span>
                      </div>
                    </td>
                    {(["view", "create", "edit", "delete", "manage"] as PermissionAction[]).map((action) => {
                      const perm = perms.find((p) => p.action === action);
                      
                      return (
                        <td key={action} className="px-4 py-3 text-center">
                          {editMode && canManage ? (
                            // Modo de edição - dropdown de escopo
                            <select
                              value={perm?.scope || "none"}
                              onChange={(e) => {
                                const newScope = e.target.value as PermissionScope;
                                if (perm) {
                                  handleScopeChange(module, action, newScope);
                                } else if (newScope !== "none") {
                                  handleAddPermission(module, action);
                                  setTimeout(() => handleScopeChange(module, action, newScope), 0);
                                }
                              }}
                              className={`rounded-lg border px-2 py-1 text-xs font-medium ${
                                perm?.scope === "all" ? "border-green-500/30 bg-green-500/10 text-green-300" :
                                perm?.scope === "own" ? "border-blue-500/30 bg-blue-500/10 text-blue-300" :
                                perm?.scope === "assigned" ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300" :
                                "border-slate-500/30 bg-slate-500/10 text-slate-400"
                              }`}
                            >
                              <option value="none">Nenhum</option>
                              <option value="all">Todos</option>
                              <option value="own">Próprios</option>
                              <option value="assigned">Atribuídos</option>
                            </select>
                          ) : (
                            // Modo de visualização
                            perm ? (
                              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${SCOPE_COLORS[perm.scope]}`}>
                                <Check className="h-3 w-3" />
                                {SCOPE_LABELS[perm.scope]}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full border border-slate-500/30 bg-slate-500/10 px-2 py-0.5 text-xs text-slate-500">
                                <X className="h-3 w-3" />
                              </span>
                            )
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Visualização Detalhada */}
      {viewMode === "detailed" && (
        <div className="space-y-4">
          {modules.map((module) => {
            const Icon = MODULE_ICONS[module];
            const perms = permissionsByModule[module];
            
            return (
              <div key={module} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Icon className="h-5 w-5 text-brand-400" />
                  <h3 className="text-lg font-semibold text-white">{MODULE_LABELS[module]}</h3>
                  <span className="ml-auto rounded-full bg-brand-500/20 px-2 py-0.5 text-xs text-brand-300">
                    {perms.length} permissões
                  </span>
                </div>
                <div className="space-y-2">
                  {perms.map((perm, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/20 px-3 py-2"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">
                          {ACTION_LABELS[perm.action]}
                        </p>
                        <p className="text-xs text-slate-400">{perm.description}</p>
                      </div>
                      {editMode && canManage ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={perm.scope}
                            onChange={(e) => handleScopeChange(module, perm.action, e.target.value as PermissionScope)}
                            className={`rounded-lg border px-2 py-1 text-xs font-medium ${SCOPE_COLORS[perm.scope]}`}
                          >
                            <option value="all">Todos</option>
                            <option value="own">Próprios</option>
                            <option value="assigned">Atribuídos</option>
                            <option value="none">Nenhum</option>
                          </select>
                          <button
                            onClick={() => handleRemovePermission(module, perm.action)}
                            className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/20"
                            title="Remover permissão"
                          >
                            🗑️
                          </button>
                        </div>
                      ) : (
                        <span className={`rounded-full border px-3 py-1 text-xs font-medium ${SCOPE_COLORS[perm.scope]}`}>
                          {SCOPE_LABELS[perm.scope]}
                        </span>
                      )}
                    </div>
                  ))}
                  
                  {editMode && canManage && (
                    <div className="mt-3 rounded-xl border border-dashed border-white/20 bg-white/5 px-3 py-2">
                      <p className="text-xs text-slate-400 mb-2">Adicionar nova ação:</p>
                      <div className="flex flex-wrap gap-2">
                        {(["view", "create", "edit", "delete", "manage"] as PermissionAction[]).map((action) => {
                          const exists = perms.some((p) => p.action === action);
                          if (exists) return null;
                          
                          return (
                            <button
                              key={action}
                              onClick={() => handleAddPermission(module, action)}
                              className="rounded-lg border border-brand-500/30 bg-brand-500/10 px-2 py-1 text-xs text-brand-300 hover:bg-brand-500/20"
                            >
                              + {ACTION_LABELS[action]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legenda */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-3">
          Legenda dos Escopos
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
            <div>
              <p className="text-sm font-medium text-white">Todos</p>
              <p className="text-xs text-slate-400">Acesso a todos os registros</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-blue-500" />
            <div>
              <p className="text-sm font-medium text-white">Próprios</p>
              <p className="text-xs text-slate-400">Apenas registros criados por ele</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-yellow-500" />
            <div>
              <p className="text-sm font-medium text-white">Atribuídos</p>
              <p className="text-xs text-slate-400">Apenas registros atribuídos a ele</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-slate-500" />
            <div>
              <p className="text-sm font-medium text-white">Nenhum</p>
              <p className="text-xs text-slate-400">Sem permissão</p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparação de Roles */}
      <div className="mt-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-3">
          Comparação Rápida
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-3 py-2 text-left text-slate-400">Funcionalidade</th>
                {roles.map((role) => (
                  <th key={role.role} className="px-3 py-2 text-center text-slate-400">
                    {role.role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="px-3 py-2 text-slate-300">Criar Disciplinas</td>
                {roles.map((role) => {
                  const hasPerm = role.permissions.some(
                    (p) => p.module === "disciplines" && p.action === "create"
                  );
                  return (
                    <td key={role.role} className="px-3 py-2 text-center">
                      {hasPerm ? (
                        <Check className="inline h-4 w-4 text-green-400" />
                      ) : (
                        <X className="inline h-4 w-4 text-slate-600" />
                      )}
                    </td>
                  );
                })}
              </tr>
              <tr className="border-b border-white/5">
                <td className="px-3 py-2 text-slate-300">Gerenciar Usuários</td>
                {roles.map((role) => {
                  const hasPerm = role.permissions.some(
                    (p) => p.module === "users" && p.action === "manage"
                  );
                  return (
                    <td key={role.role} className="px-3 py-2 text-center">
                      {hasPerm ? (
                        <Check className="inline h-4 w-4 text-green-400" />
                      ) : (
                        <X className="inline h-4 w-4 text-slate-600" />
                      )}
                    </td>
                  );
                })}
              </tr>
              <tr className="border-b border-white/5">
                <td className="px-3 py-2 text-slate-300">Criar Conteúdo</td>
                {roles.map((role) => {
                  const hasPerm = role.permissions.some(
                    (p) => p.module === "content" && p.action === "create"
                  );
                  return (
                    <td key={role.role} className="px-3 py-2 text-center">
                      {hasPerm ? (
                        <Check className="inline h-4 w-4 text-green-400" />
                      ) : (
                        <X className="inline h-4 w-4 text-slate-600" />
                      )}
                    </td>
                  );
                })}
              </tr>
              <tr className="border-b border-white/5">
                <td className="px-3 py-2 text-slate-300">Ver Relatórios</td>
                {roles.map((role) => {
                  const perm = role.permissions.find(
                    (p) => p.module === "reports" && p.action === "view"
                  );
                  return (
                    <td key={role.role} className="px-3 py-2 text-center">
                      {perm ? (
                        <span className="text-xs text-slate-400">{SCOPE_LABELS[perm.scope]}</span>
                      ) : (
                        <X className="inline h-4 w-4 text-slate-600" />
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
