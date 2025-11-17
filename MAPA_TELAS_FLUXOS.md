# 📱 MAPA DE TELAS E FLUXOS - Comunidade Virtual

**Data:** 16 de novembro de 2025

---

## 🗺️ Arquitetura de Navegação

```
APP.tsx (Entrypoint)
├── IsLoading?
│   └─ Mostrar "Carregando..."
├── IsAuthenticated?
│   ├─ Não → LoginPage
│   │   ├─ Login com Email/Senha
│   │   ├─ Login com Google
│   │   └─ SignUp
│   └─ Sim → LayoutShell
│       └─ MainMenu (6 abas)
│           ├─ Dashboard (Visão Geral)
│           ├─ Courses (Cursos)
│           ├─ Tracks (❌ NÃO IMPLEMENTADO!)
│           ├─ Disciplines (Disciplinas)
│           ├─ Tutors (Admin only)
│           └─ Students (Admin only)
```

---

## 📄 TELAS E SUAS RESPONSABILIDADES

### 1️⃣ **LoginPage** (`src/pages/LoginPage.tsx`)

**Rota:** `/`  
**Usuários:** Todos (não autenticados)  
**Componentes filhos:** Nenhum

#### Funcionalidades:
- ✅ Login com email/senha
- ✅ Login com Google
- ✅ Sign up (criar conta)
- ⚠️ Sem validação de email
- ⚠️ Sem recuperação de senha

#### Fluxo de Dados:
```
LoginPage (estado local: form, submitting, error)
    ↓ (useAuth hook)
useAuth.login() → Supabase
    ↓
Sucesso → App.tsx renderiza Dashboard
Erro → Mostrar localError
```

#### Problemas Encontrados:
```
🔴 Sem validação de input
🔴 Sem confirmação visual
⚠️ Mensagens de erro genéricas
⚠️ Sem "Esqueci a senha"
```

---

### 2️⃣ **Dashboard** (`src/App.tsx` - activeSection === "dashboard")

**Rota:** `/`  
**Usuários:** Todos (autenticados)  
**Componentes:**
- HeroSection
- InsightsSection
- DisciplineGrid
- ActivityTimeline

#### Funcionalidades:
- ✅ Visualizar resumo (total disciplinas, alunos, satisfação)
- ✅ Visualizar disciplinas em grid
- ✅ Filtrar por nome/código/status
- ✅ Ver timeline de atividades
- ⚠️ Filtros não persistem
- ⚠️ Sem paginação

#### Fluxo de Dados:
```
useDisciplineDashboard() (hook)
    ├─ Carrega FALLBACK_DASHBOARD
    ├─ Se Supabase: Faz query completa
    └─ Retorna: data, filteredDisciplines, loading, error
        ↓
App.tsx
    ├─ Renderiza HeroSection (com summary)
    ├─ Renderiza InsightsSection
    ├─ Renderiza DisciplineGrid (filtra por search/status)
    └─ Renderiza ActivityTimeline
```

#### Dados de Entrada:
```typescript
{
  summary: {
    totalDisciplines: 8,
    activeStudents: 620,
    satisfaction: 92,
    completionRate: 78,
  },
  disciplines: [...],
  timeline: [...]
}
```

#### Problemas Encontrados:
```
🔴 Sem loading state quando recarrega
⚠️ Filtros se perdem ao mudar de aba
⚠️ Sem indicador "últimas 24h" para timeline
🟡 Re-render de 100 disciplinas é lento
```

---

### 3️⃣ **Courses** (`src/App.tsx` - activeSection === "courses")

**Rota:** `/`  
**Usuários:** Mestres (master, tutor)  
**Componentes:**
- CourseManagementPanel

#### Funcionalidades:
- ✅ Listar cursos
- ✅ Criar novo curso (nome + disciplinas)
- ✅ Criar turma dentro de curso
- ✅ Deletar curso
- ⚠️ Sem proteção contra duplicatas
- ⚠️ Sem confirmação de delete

#### Fluxo de Dados:
```
useCourseManager(disciplinePool, userId)
    ├─ Carrega FALLBACK_COURSES
    ├─ Se Supabase: Query courses + course_disciplines + courses_turmas
    ├─ Filtra student_courses para usuário
    └─ Retorna: courses, studentCourses, loading, error
        ↓
CourseManagementPanel
    ├─ Renderiza lista de cursos
    ├─ Formulário para criar curso
    │   └─ Select múltiplo de disciplinas
    ├─ Para cada curso:
    │   ├─ Listar turmas
    │   └─ Formulário para criar turma
    └─ Botão delete para cada curso
```

#### Problemas Encontrados:
```
🔴 Sem validação de entrada
🔴 Sem proteção contra duplicatas
🔴 Sem confirmação de delete
⚠️ Submit rápido cria 2 cursos
🟡 Sem feedback visual durante criação
```

---

### 4️⃣ **Tracks** (`src/App.tsx` - activeSection === "tracks")

**Rota:** `/`  
**Status:** ❌ **NÃO IMPLEMENTADO**  
**Usuários:** Mestres

#### O que falta:
```
- Nenhum hook useTrackManager
- Nenhum componente TrackManagementPanel
- Nenhuma data de fallback para trilhas
- Nenhum tipo Track/CourseTrack
```

#### Impacto:
```
Menu mostra "Trilhas" mas não funciona
Usuário clica, nada acontece
Interface quebrada
```

#### Solução Recomendada:
```
Opção A: Remover menu item "Trilhas"
Opção B: Implementar completo (Type, Hook, Component, Fallback)
```

---

### 5️⃣ **Disciplines** (`src/App.tsx` - activeSection === "disciplines")

**Rota:** `/`  
**Usuários:** Mestres  
**Componentes:**
- DisciplineGrid
- DisciplineCard
- CreateDisciplineDialog

#### Funcionalidades:
- ✅ Listar disciplinas
- ✅ Filtrar por nome/código/status
- ✅ Expandir card para editar
- ✅ Editar nome, descrição, status, tags, ementa
- ✅ Editar learning blocks
- ✅ Adicionar ações pendentes
- ✅ Atribuir tutores
- ⚠️ Sem debounce em edições
- ⚠️ Estado local diverge de props

#### Fluxo de Dados:
```
useDisciplineDashboard()
    ├─ Carrega FALLBACK_DASHBOARD
    ├─ Se Supabase: Query disciplines + tutors + stats
    └─ updateDiscipline(id, payload) → PUT request
        ↓
DisciplineGrid
    ├─ Para cada discipline:
    │   └─ DisciplineCard
    │       ├─ Mostrar status/código/stats/tutores
    │       ├─ Se expanded:
    │       │   ├─ Formulário de edição (nome, desc, status, etc)
    │       │   ├─ Learning blocks editor
    │       │   └─ Adicionar ações pendentes
    │       └─ Botões: atribuir tutor, editar
    └─ Atualizar ao submeter formulário
```

#### Problemas Encontrados:
```
🔴 Sem debounce = múltiplas requisições por segundo
🔴 useEffect reseta form durante edição
⚠️ Sem feedback durante salvamento
🟡 Re-render de 100 cards é muito lento
```

---

### 6️⃣ **Tutors** (`src/App.tsx` - activeSection === "tutors")

**Rota:** `/`  
**Usuários:** Admin only (master)  
**Componentes:**
- UserManagementPanel (modo manage)

#### Funcionalidades:
- ✅ Listar usuários com role = tutor
- ✅ Mudar role (master/tutor/professor/aluno)
- ✅ Mudar status (active/inactive)
- ⚠️ Sem confirmação de mudança
- ⚠️ Sem feedback visual

#### Fluxo de Dados:
```
useUserDirectory("manage", canManageUsers)
    ├─ Carrega MOCK_USERS
    ├─ Se Supabase: Query de profiles
    └─ updateRole(userId, newRole) → PUT request
        └─ updateStatus(userId, newStatus) → PUT request
```

#### Problemas Encontrados:
```
⚠️ Sem confirmação antes de mudar role
🟡 Sem reload automático
🟡 Sem indicador visual de sucesso
```

---

### 7️⃣ **Students** (`src/App.tsx` - activeSection === "students")

**Rota:** `/`  
**Usuários:** Admin only (master)  
**Componentes:**
- UserManagementPanel (modo manage)

#### Funcionalidades:
- ✅ Listar usuários com role = aluno
- ✅ Mudar role
- ✅ Mudar status
- ⚠️ Sem confirmação
- ⚠️ Sem feedback

#### Mesmo que Tutors

---

## 🔄 FLUXOS DE DADOS CRÍTICOS

### Fluxo 1: Autenticação
```
1. Usuário clica "Entrar"
   ↓
2. LoginPage.handleSubmit()
   ├─ Valida form ❌ (não valida)
   ↓
3. useAuth.login(email, password)
   ├─ Se supabase: Supabase.auth.signInWithPassword()
   ├─ Se erro: setError()
   ├─ Se sucesso: setUser() + loadProfile()
   ↓
4. AuthProvider context atualiza
   ↓
5. App.tsx vê user !== null
   ├─ Renderiza Dashboard ao invés de LoginPage
   ↓
6. Hooks começam a carregar dados (useDisciplineDashboard, useCourseManager)
```

**Problema:** Se logout, states locais NÃO são resetados!

### Fluxo 2: Criar Disciplina
```
1. Usuário clica "Criar Disciplina"
   ↓
2. CreateDisciplineDialog abre
   ↓
3. Usuário preenche form
   ↓
4. Clica "Criar"
   ├─ App.tsx.createDiscipline(payload)
   ├─ useDisciplineDashboard.createDiscipline()
   ├─ Se supabase: INSERT em "disciplines"
   ├─ Se sucesso: loadData() → recarrega TUDO
   └─ Se erro: setError()
```

**Problema:** Recarrega TODAS as disciplinas ao invés de apenas adicionar uma

### Fluxo 3: Editar Disciplina
```
1. Usuário clica expand em DisciplineCard
   ├─ setExpanded(true)
   ↓
2. Renderiza formulário com formState
   ├─ formState = estado local
   ├─ discipline = prop recebida
   ↓
3. Usuário edita nome
   ├─ setFormState({...}) atualiza local
   ↓
4. Clica "Salvar"
   ├─ onUpdate(disciplineId, payload)
   ├─ Se supabase: UPDATE em "disciplines"
   ├─ Se sucesso: Atualiza state local + fetcha do servidor
   └─ Se erro: Estado local fica com valor antigo ❌ confuso!
```

**Problema:** useEffect(() => {...}, [discipline]) reseta form durante a edição!

### Fluxo 4: Criar Curso
```
1. Usuário clica "Novo Curso"
   ↓
2. CourseManagementPanel renderiza form
   ↓
3. Usuário preenche e seleciona disciplinas
   ↓
4. Clica "Criar"
   ├─ Sem validação ❌
   ├─ onCreateCourse(payload)
   ├─ useCourseManager.createCourse()
   ├─ Se supabase: INSERT em "courses" + "course_disciplines"
   └─ Se sucesso: loadCourses() → recarrega tudo
```

**Problema:** 
- Sem validação (permite nome vazio)
- Sem proteção contra duplicatas
- Se clicado 2x rápido, cria 2 cursos

### Fluxo 5: Deletar Curso
```
1. Usuário clica delete em curso
   ├─ ❌ SEM CONFIRMAÇÃO!
   ↓
2. onDeleteCourse(courseId)
   ├─ useCourseManager.deleteCourse()
   ├─ Se supabase: DELETE de "courses"
   └─ Se sucesso: loadCourses()
```

**Problema:** Sem confirmação, usuário deleta por acidente!

---

## 📊 ANÁLISE DE ESTADO

### Estado Global (Context - useAuth)
```typescript
{
  user: UserProfile | null,
  loading: boolean,
  error: string | null,
  permissions: PermissionSet,
}
```
✅ Bom, bem estruturado

### Estado Local (App.tsx)
```typescript
{
  createOpen: boolean,              // Controla CreateDisciplineDialog
  activeSection: SectionKey,        // Aba ativa (dashboard, courses, etc)
  filters: DashboardFilters,        // Filtros de busca
}
```
❌ Problemas:
- Não reseta no logout (vazamento de dados!)
- Não persiste em URL

### Estado de Hooks (Múltiplos)
```typescript
// useDisciplineDashboard
{
  data: DashboardData,
  filteredDisciplines: DisciplineRecord[],
  filters: DashboardFilters,
  loading: boolean,
  error: string | null,
  updating: boolean,
}

// useCourseManager
{
  courses: CourseRecord[],
  studentCourses: CourseRecord[],
  loading: boolean,
  error: string | null,
  updating: boolean,
}

// useUserDirectory
{
  users: UserProfile[],
  loading: boolean,
  error: string | null,
}
```
⚠️ Problemas:
- Sem sincronização entre hooks
- Se discipline muda, course não sabe
- Sem cache strategy

### Estado Local em Componentes
```typescript
// DisciplineCard
{
  expanded: boolean,
  formState: {...},
  ementa: string,
  blocks: LearningBlock[],
  actionForm: {...},
  tutorId: string,
}

// LoginPage
{
  form: {email, password},
  signupForm: {name, email, password, role},
  submitting: boolean,
  signupLoading: boolean,
  localError: string | null,
}
```
⚠️ Problemas:
- formState pode divergir de discipline prop
- Sem debounce
- Sem otimistic updates

---

## 🎯 MATRIZ DE PERMISSÕES

```typescript
type UserRole = "master" | "tutor" | "professor" | "aluno";

const roleMatrix: Record<UserRole, PermissionSet> = {
  master: {
    canCreateDiscipline: ✅ true,
    canEditAnyDiscipline: ✅ true,
    canEditOwnDiscipline: ✅ true,
    canUpdateAnyStatus: ✅ true,
    canUpdateOwnStatus: ✅ true,
    canAssignTutor: ✅ true,
    canManageUsers: ✅ true,
  },
  tutor: {
    canCreateDiscipline: ✅ true,
    canEditAnyDiscipline: ❌ false,
    canEditOwnDiscipline: ✅ true,
    canUpdateAnyStatus: ❌ false,
    canUpdateOwnStatus: ✅ true,
    canAssignTutor: ❌ false,
    canManageUsers: ❌ false,
  },
  professor: {
    canCreateDiscipline: ❌ false,
    canEditAnyDiscipline: ❌ false,
    canEditOwnDiscipline: ✅ true,
    canUpdateAnyStatus: ❌ false,
    canUpdateOwnStatus: ❌ false,
    canAssignTutor: ❌ false,
    canManageUsers: ❌ false,
  },
  aluno: {
    canCreateDiscipline: ❌ false,
    canEditAnyDiscipline: ❌ false,
    canEditOwnDiscipline: ❌ false,
    canUpdateAnyStatus: ❌ false,
    canUpdateOwnStatus: ❌ false,
    canAssignTutor: ❌ false,
    canManageUsers: ❌ false,
  },
};
```

✅ Bem estruturado

---

## 🚨 PONTOS DE FALHA CRÍTICOS

| # | Localização | Problema | Severidade | Impacto |
|---|---|---|---|---|
| 1 | App.tsx logout | Não reseta state local | 🔴 CRÍTICA | Vazamento de dados |
| 2 | DisciplineCard | useEffect reseta form | 🔴 CRÍTICA | Perda de dados |
| 3 | CourseManagementPanel | Sem validação | 🔴 CRÍTICA | Dados inválidos |
| 4 | LoginPage | Sem validação | 🟡 ALTA | Erros confusos |
| 5 | DisciplineCard | Sem debounce | 🟡 ALTA | Sobrecarga servidor |
| 6 | CourseManagementPanel | Sem proteção delete | 🟡 ALTA | Perda acidental |
| 7 | App.tsx | Trilhas não implementadas | 🟡 ALTA | Interface quebrada |
| 8 | DisciplineGrid | 100+ items sem virtualização | 🟡 ALTA | Performance ruim |
| 9 | Múltiplos | Sem loading states | 🟡 ALTA | UX confusa |
| 10 | Múltiplos | Sem error boundaries | 🟡 ALTA | App quebra |

---

**Próximo:** Implementar correções usando SOLUCOES_IMPLEMENTAVEIS.md
