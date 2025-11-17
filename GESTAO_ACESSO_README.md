# 🔐 Sistema de Gestão de Acesso

## Visão Geral

Sistema completo de permissões baseado em **RBAC (Role-Based Access Control)** com 4 papéis (roles) e controle granular de acesso a 8 módulos do sistema.

---

## 📋 Estrutura

### 1. **Papéis (Roles)**

| Role | Prioridade | Descrição | Acesso |
|------|------------|-----------|--------|
| **Master** | 1 | Administrador total | Acesso completo a tudo |
| **Professor** | 2 | Criador de conteúdo | Gerencia suas disciplinas e cursos |
| **Tutor** | 3 | Auxiliar pedagógico | Suporta disciplinas atribuídas |
| **Aluno** | 4 | Estudante | Acesso apenas ao conteúdo matriculado |

### 2. **Módulos do Sistema**

1. **Disciplines** - Gerenciamento de disciplinas
2. **Courses** - Cursos compostos por disciplinas
3. **Turmas** - Turmas específicas de cursos
4. **Users** - Gestão de usuários
5. **Enrollments** - Matrículas de alunos
6. **Content** - Conteúdo pedagógico (aulas, materiais)
7. **Reports** - Relatórios e analytics
8. **Settings** - Configurações do sistema

### 3. **Ações Possíveis**

- `view` - Visualizar registros
- `create` - Criar novos registros
- `edit` - Editar registros existentes
- `delete` - Deletar registros
- `manage` - Gestão completa (inclui todas as ações)

### 4. **Escopos de Acesso**

- `all` 🟢 - Acesso a **todos** os registros
- `own` 🔵 - Acesso apenas aos **próprios** registros
- `assigned` 🟡 - Acesso aos registros **atribuídos**
- `none` ⚫ - **Sem acesso**

---

## 🎯 Matriz de Permissões

### Master (Administrador)
```
✅ TUDO - Acesso completo a todos os módulos
```

### Professor
```
Disciplines: view(all), create(all), edit(own), delete(own)
Courses:     view(all), create(all), edit(own), delete(own)
Turmas:      view(assigned), create(own), edit(assigned)
Users:       view(assigned)
Content:     view(all), create(own), edit(own), delete(own)
Reports:     view(assigned)
```

### Tutor
```
Disciplines: view(assigned), edit(assigned)
Courses:     view(assigned)
Turmas:      view(assigned)
Users:       view(assigned)
Content:     view(assigned), edit(assigned)
Reports:     view(assigned)
```

### Aluno
```
Disciplines: view(assigned)
Courses:     view(assigned)
Turmas:      view(assigned)
Users:       view(own), edit(own)
Content:     view(assigned)
Reports:     view(own)
```

---

## 💻 Como Usar

### 1. **No Componente (Hook usePermissions)**

```tsx
import { usePermissions } from "@/hooks/usePermissions";

function MyComponent() {
  const { user } = useAuth();
  const perms = usePermissions(user.role);
  
  // Verificações simples
  if (perms.disciplines.canCreate) {
    // Mostrar botão "Criar Disciplina"
  }
  
  // Verificações com escopo
  if (perms.can("courses", "edit", "all")) {
    // Pode editar qualquer curso
  }
  
  // Shortcuts úteis
  if (perms.isMaster) {
    // Lógica exclusiva de admin
  }
  
  if (perms.canTeach) {
    // Master, Professor ou Tutor
  }
  
  return (
    <div>
      {perms.courses.canCreate && (
        <button>Criar Curso</button>
      )}
    </div>
  );
}
```

### 2. **Verificação Direta (Helper Functions)**

```tsx
import { hasPermission, isHigherRole } from "@/types/permissions";

// Verificar permissão
const canEdit = hasPermission("professor", "disciplines", "edit", "own");

// Comparar hierarquia
const isBoss = isHigherRole("master", "aluno"); // true
```

### 3. **Painel de Gestão de Acesso**

Acesse pelo menu principal (apenas Masters):

```tsx
<AccessManagementPanel currentUserRole={user.role} />
```

**Funcionalidades:**
- ✅ Visualização em **Matriz** (tabela compacta)
- ✅ Visualização **Detalhada** (lista com descrições)
- ✅ **Comparação rápida** entre roles
- ✅ **Legenda** de escopos com cores

---

## 🔧 Customização

### Adicionar Nova Permissão

**1. Atualizar tipo em `src/types/permissions.ts`:**

```typescript
export type SystemModule = 
  | "disciplines"
  | "my_new_module"; // ✅ Adicionar aqui
```

**2. Adicionar permissões em `DEFAULT_PERMISSIONS`:**

```typescript
master: {
  permissions: [
    // ... outras permissões
    { 
      module: "my_new_module", 
      action: "view", 
      scope: "all", 
      description: "Ver todos os registros" 
    },
  ],
}
```

**3. Adicionar ícone e label no painel:**

```typescript
// Em AccessManagementPanel.tsx
const MODULE_ICONS: Record<SystemModule, any> = {
  my_new_module: MyIcon, // ✅ Adicionar ícone
};

const MODULE_LABELS: Record<SystemModule, string> = {
  my_new_module: "Meu Módulo", // ✅ Adicionar label
};
```

### Criar Nova Role

```typescript
export type UserRole = 
  | "master" 
  | "my_new_role"; // ✅ Adicionar

export const DEFAULT_PERMISSIONS: Record<UserRole, RolePermissions> = {
  my_new_role: {
    role: "my_new_role",
    displayName: "Minha Nova Role",
    description: "Descrição da role",
    priority: 3,
    permissions: [
      // Adicionar permissões específicas
    ],
  },
};
```

---

## 📊 Exemplos de Uso

### Exemplo 1: Botão Condicional

```tsx
const perms = usePermissions(user.role);

<button disabled={!perms.disciplines.canCreate}>
  {perms.disciplines.canCreate 
    ? "Criar Disciplina" 
    : "Sem permissão"}
</button>
```

### Exemplo 2: Roteamento Protegido

```tsx
if (activeSection === "access" && !perms.isMaster) {
  return <AccessDenied />;
}
```

### Exemplo 3: Edição Condicional

```tsx
const canEditThis = 
  perms.courses.canEditAll || 
  (perms.courses.canEditOwn && course.createdBy === user.id);

{canEditThis && <EditButton />}
```

### Exemplo 4: UI Adaptativa

```tsx
{perms.isMaster && <AdminPanel />}
{perms.canTeach && <TeacherTools />}
{perms.isAluno && <StudentDashboard />}
```

---

## 🎨 Interface do Painel

### Visualização Matriz
```
┌────────────────┬──────┬────────┬──────┬────────┬─────────┐
│ Módulo         │ View │ Create │ Edit │ Delete │ Manage  │
├────────────────┼──────┼────────┼──────┼────────┼─────────┤
│ Disciplinas    │ ✅🟢 │  ✅🟢  │ ✅🟢 │  ✅🟢  │   ✅🟢  │
│ Cursos         │ ✅🟢 │  ✅🟢  │ ✅🔵 │  ✅🔵  │   ❌    │
│ Turmas         │ ✅🟡 │  ✅🔵  │ ✅🟡 │  ❌    │   ❌    │
└────────────────┴──────┴────────┴──────┴────────┴─────────┘

🟢 Todos  🔵 Próprios  🟡 Atribuídos  ⚫ Nenhum
```

### Visualização Detalhada
```
📚 Disciplinas (4 permissões)
  ├─ Visualizar - Todos
  ├─ Criar - Todos
  ├─ Editar - Próprios
  └─ Deletar - Próprios
```

---

## 🔐 Segurança

### Validação no Back-end

**IMPORTANTE:** As permissões no front-end são apenas para UX. **SEMPRE** valide no back-end:

```typescript
// ❌ ERRADO - Confiar apenas no front
if (userRole === "master") {
  await deleteUser(userId);
}

// ✅ CORRETO - Validar no servidor
const canDelete = await validatePermission(
  req.user.id, 
  "users", 
  "delete"
);

if (!canDelete) {
  throw new UnauthorizedError();
}
```

### Políticas RLS no Supabase

```sql
-- Exemplo: Apenas criador pode editar
CREATE POLICY "Users can edit own courses"
ON courses
FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());
```

---

## 📚 Referências

- **Arquivos criados:**
  - `src/types/permissions.ts` - Tipos e matriz de permissões
  - `src/hooks/usePermissions.ts` - Hook utilitário
  - `src/sections/AccessManagementPanel.tsx` - Painel visual

- **Arquivos modificados:**
  - `src/App.tsx` - Integração do painel

---

## ✅ Checklist de Implementação

- [x] Tipos de permissões definidos
- [x] Matriz completa de 4 roles
- [x] 8 módulos mapeados
- [x] Hook `usePermissions` criado
- [x] Painel visual com 2 modos de visualização
- [x] Integração no menu principal
- [x] Comparação entre roles
- [x] Legenda de escopos
- [x] Zero erros de compilação

---

## 🚀 Próximos Passos

1. [ ] Implementar validação no back-end
2. [ ] Criar políticas RLS no Supabase
3. [ ] Adicionar logs de auditoria
4. [ ] Implementar permissões dinâmicas (banco)
5. [ ] Criar testes automatizados
