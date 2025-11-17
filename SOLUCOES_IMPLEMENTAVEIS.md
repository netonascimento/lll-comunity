# 🔧 SOLUÇÕES IMPLEMENTÁVEIS - Comunidade Virtual

**Versão:** 1.0  
**Data:** 16 de novembro de 2025

---

## 📝 Correções Código-by-Código

---

# 🔴 BUG #1: Missing Loading State (Cursos)

**Arquivo:** `src/App.tsx`  
**Linhas:** ~150-250

### Antes:
```tsx
{activeSection === "courses" && (
  <CourseManagementPanel
    disciplines={data.disciplines}
    courses={courseList}
    onCreateCourse={createCourse}
    onCreateTurma={createTurma}
    onDeleteCourse={deleteCourse}
    currentUserId={user.id}
    loading={loading}
    error={error}
  />
)}
```

### Depois:
```tsx
{activeSection === "courses" && (
  <div>
    {coursesLoading && (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-3xl bg-white/5" />
        ))}
      </div>
    )}
    {!coursesLoading && (
      <CourseManagementPanel
        disciplines={data.disciplines}
        courses={courseList}
        onCreateCourse={createCourse}
        onCreateTurma={createTurma}
        onDeleteCourse={deleteCourse}
        currentUserId={user.id}
        loading={loading}
        error={coursesError}
        updating={coursesUpdating}
      />
    )}
  </div>
)}
```

---

# 🔴 BUG #2: Race Condition no loginWithGoogle

**Arquivo:** `src/hooks/useAuth.tsx`  
**Linhas:** ~200-240

### Completo:
```tsx
export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ... existing code ...

  const loginWithGoogle = useCallback(async () => {
    setError(null);
    try {
      if (!supabase) {
        throw new Error("Serviço de autenticação indisponível");
      }

      const { data, error: googleError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { 
          redirectTo: window.location.origin 
        },
      });

      if (googleError) {
        throw googleError;
      }
    } catch (err) {
      const message = err instanceof Error 
        ? err.message 
        : "Falha ao entrar com Google";
      setError(message);
      console.error("Google login error:", err);
    }
  }, []);

  const signUp = useCallback(
    async (payload: { name: string; email: string; password: string; role: UserRole }) => {
      setError(null);
      try {
        if (!supabase) {
          throw new Error("Serviço de autenticação indisponível");
        }

        // Validação básica
        if (!payload.email?.trim() || !payload.password?.trim()) {
          throw new Error("Email e senha são obrigatórios");
        }

        if (payload.password.length < 6) {
          throw new Error("Senha deve ter no mínimo 6 caracteres");
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email: payload.email,
          password: payload.password,
          options: {
            data: {
              full_name: payload.name,
              role: payload.role,
            },
          },
        });

        if (signUpError) {
          throw signUpError;
        }
      } catch (err) {
        const message = err instanceof Error 
          ? err.message 
          : "Falha ao criar conta";
        setError(message);
        console.error("Sign up error:", err);
      }
    },
    []
  );

  // ... rest of code ...

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        loginWithGoogle,
        signUp,
        logout,
        permissions,
        canEditDiscipline,
        canUpdateStatus,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
```

---

# 🔴 BUG #4: DisciplineCard - Estado Desincronizado

**Arquivo:** `src/components/DisciplineCard.tsx`  
**Linhas:** ~70-95

### Antes:
```tsx
const [expanded, setExpanded] = useState(false);
const [formState, setFormState] = useState({...});

useEffect(() => {
  // Reseta SEMPRE que discipline muda
  setFormState({...});
}, [discipline]);
```

### Depois:
```tsx
const [expanded, setExpanded] = useState(false);
const [formState, setFormState] = useState({
  name: discipline.name,
  description: discipline.description,
  status: discipline.status,
  level: discipline.level,
  tags: discipline.tags.join(", "),
  nextReviewAt: discipline.nextReviewAt.slice(0, 10),
});
const [hasChanges, setHasChanges] = useState(false);

useEffect(() => {
  // Só reseta se o card está fechado
  if (!expanded) {
    setFormState({
      name: discipline.name,
      description: discipline.description,
      status: discipline.status,
      level: discipline.level,
      tags: discipline.tags.join(", "),
      nextReviewAt: discipline.nextReviewAt.slice(0, 10),
    });
    setHasChanges(false);
  }
}, [discipline, expanded]);

const handleInputChange = (field: string, value: string) => {
  setFormState(prev => ({
    ...prev,
    [field]: value
  }));
  setHasChanges(true);
};

const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  try {
    await onUpdate(discipline.id, {
      name: formState.name,
      description: formState.description,
      status: formState.status as DisciplineRecord["status"],
      level: formState.level,
      tags: formState.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      nextReviewAt: formState.nextReviewAt,
    });
    setHasChanges(false);
  } catch (error) {
    console.error("Failed to update discipline:", error);
    // Estado permanece com mudanças para usuário tentar novamente
  }
};

// Adicionar aviso ao sair se há mudanças não salvas
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasChanges) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  if (hasChanges) {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }
}, [hasChanges]);
```

---

# 🔴 BUG #6: Vazamento de Dados Entre Usuários

**Arquivo:** `src/App.tsx`  
**Localização:** Na função logout ou no handleLogout

### Adicionar ao lado do logout:
```tsx
const handleLogout = useCallback(async () => {
  // ✅ IMPORTANTE: Resetar ALL states locais ANTES de fazer logout
  // Isso previne que dados do usuário A apareçam para usuário B
  
  setCreateOpen(false);
  setActiveSection("dashboard");
  setFilters({ search: "", status: "todas" });
  
  // Agora pode fazer logout seguro
  await logout();
}, []);

// Atualizar o JSX para usar handleLogout
<button
  onClick={handleLogout}
  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-white/10"
>
  Sair
</button>
```

---

# 🔴 BUG #8: Proteção contra Duplicatas em Cursos

**Arquivo:** `src/sections/CourseManagementPanel.tsx`  
**Linhas:** ~60-75

### Antes:
```tsx
const handleCourseSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  if (!form.name || form.disciplineIds.length === 0) return;
  setSubmitting(true);
  try {
    await onCreateCourse({...});
  }
};
```

### Depois:
```tsx
const handleCourseSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  
  // Validações
  if (!form.name?.trim()) {
    alert("Nome do curso é obrigatório");
    return;
  }
  
  if (form.disciplineIds.length === 0) {
    alert("Selecione pelo menos uma disciplina");
    return;
  }

  // Verificar duplicata
  const courseNameLower = form.name.toLowerCase();
  if (courses.some(c => c.name.toLowerCase() === courseNameLower)) {
    alert("Já existe um curso com este nome");
    return;
  }

  setSubmitting(true);
  try {
    await onCreateCourse({
      name: form.name,
      description: form.description,
      coverUrl: form.coverUrl || undefined,
      disciplineIds: form.disciplineIds,
      createdBy: currentUserId,
    });
    
    // Só limpar se sucesso
    setForm({ name: "", description: "", coverUrl: "", disciplineIds: [] });
  } catch (error) {
    console.error("Failed to create course:", error);
    // Não limpar form para user tentar novamente
  } finally {
    setSubmitting(false);
  }
};
```

---

# 🔴 BUG #9: Adicionar Debounce em Edições

**Arquivo:** `src/components/DisciplineCard.tsx`

### Criar helper:
```tsx
// No topo do arquivo
import { useRef, useEffect } from "react";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

### Usar em handleSubmit:
```tsx
const debouncedFormState = useDebounce(formState, 500); // 500ms delay

useEffect(() => {
  if (expanded && hasChanges) {
    // Auto-save após debounce
    handleSubmit(new Event('submit') as any);
  }
}, [debouncedFormState]);

// Ou para manual submit:
const handleSubmit = useCallback(
  debounce(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onUpdate(discipline.id, {...});
  }, 500),
  [discipline.id, onUpdate]
);
```

---

# ⚠️ UX #5: Confirmação Antes de Deletar

**Arquivo:** `src/sections/CourseManagementPanel.tsx`

### Adicionar Modal:
```tsx
import { AlertCircle } from "lucide-react";

function DeleteConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
}: {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-3xl bg-slate-900 p-8 shadow-lg">
        <div className="mb-4 flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-red-400" />
          <h2 className="text-xl font-semibold text-white">Confirmar exclusão</h2>
        </div>
        
        <p className="mb-6 text-slate-300">
          Tem certeza que deseja deletar <strong>{title}</strong>? Esta ação não pode ser desfeita.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="rounded-2xl bg-slate-800 px-6 py-2 font-semibold text-white hover:bg-slate-700"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="rounded-2xl bg-red-600 px-6 py-2 font-semibold text-white hover:bg-red-700"
          >
            Deletar
          </button>
        </div>
      </div>
    </div>
  );
}

// Usar no componente:
export function CourseManagementPanel({...}) {
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, courseId?: string, courseName?: string}>({
    isOpen: false,
  });

  const handleDeleteClick = (courseId: string, courseName: string) => {
    setDeleteModal({ isOpen: true, courseId, courseName });
  };

  const handleConfirmDelete = async () => {
    if (deleteModal.courseId) {
      await onDeleteCourse(deleteModal.courseId);
      setDeleteModal({ isOpen: false });
    }
  };

  return (
    <>
      {/* ... rest of component ... */}
      
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.courseName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false })}
      />
    </>
  );
}
```

---

# ⚠️ UX #2: Corrigir Fluxo de Navegação (Trilhas)

**Arquivo:** `src/App.tsx`  
**Linhas:** ~130-240

### Solução 1: Remover item desabilitado
```tsx
const menuItems: { key: SectionKey; label: string; disabled?: boolean }[] = [
  { key: "dashboard", label: "Visão geral" },
  { key: "courses", label: "Cursos" },
  // ❌ REMOVIDO: { key: "tracks", label: "Trilhas" },
  { key: "disciplines", label: "Disciplinas" },
  { key: "tutors", label: "Tutores", disabled: !permissions.canManageUsers },
  { key: "students", label: "Alunos", disabled: !permissions.canManageUsers },
];

// Remover type SectionKey "tracks"
type SectionKey = "dashboard" | "courses" | "disciplines" | "tutors" | "students";

// Se implementar "tracks" depois, pode readicionar
```

---

# 🟡 Performance #3: Virtualizar DisciplineGrid

**Arquivo:** `src/sections/DisciplineGrid.tsx`

### Instalar dependência:
```bash
npm install react-window
```

### Usar virtualização:
```tsx
import { FixedSizeList as List } from 'react-window';
import { DisciplineRecord } from "@/types/dashboard";

type DisciplineGridProps = {
  disciplines: DisciplineRecord[];
  busy?: boolean;
  onUpdate: (id: string, payload: Partial<DisciplineRecord>) => Promise<void> | void;
  onRegisterAction: (...) => Promise<void> | void;
  onAssignTutor: (id: string, tutorId: string) => Promise<void> | void;
  getCardPermissions: (discipline: DisciplineRecord) => DisciplineCardPermissions;
  resolveOwnerName?: (userId: string) => string | undefined;
};

export function DisciplineGrid({
  disciplines,
  busy,
  onUpdate,
  onRegisterAction,
  onAssignTutor,
  getCardPermissions,
  resolveOwnerName,
}: DisciplineGridProps) {
  if (disciplines.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 p-10 text-center text-slate-400">
        Nenhuma disciplina encontrada com os filtros atuais.
      </div>
    );
  }

  // Se poucos items, não virtualizar
  if (disciplines.length <= 10) {
    return (
      <section className="space-y-4">
        {disciplines.map((discipline) => (
          <DisciplineCard
            key={discipline.id}
            discipline={discipline}
            busy={busy}
            onUpdate={onUpdate}
            onRegisterAction={onRegisterAction}
            onAssignTutor={onAssignTutor}
            permissions={getCardPermissions(discipline)}
            ownerLabel={resolveOwnerName?.(discipline.createdBy)}
          />
        ))}
      </section>
    );
  }

  // Para muitos items, usar virtualização
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const discipline = disciplines[index];
    return (
      <div style={style}>
        <DisciplineCard
          discipline={discipline}
          busy={busy}
          onUpdate={onUpdate}
          onRegisterAction={onRegisterAction}
          onAssignTutor={onAssignTutor}
          permissions={getCardPermissions(discipline)}
          ownerLabel={resolveOwnerName?.(discipline.createdBy)}
        />
      </div>
    );
  };

  return (
    <section>
      <List
        height={800}
        itemCount={disciplines.length}
        itemSize={200}
        width="100%"
      >
        {Row}
      </List>
    </section>
  );
}
```

---

# 🟡 Estado #4: Implementar Otimistic Updates

**Arquivo:** `src/components/DisciplineCard.tsx`

### Exemplo:
```tsx
const [optimisticStatus, setOptimisticStatus] = useState(discipline.status);

const handleStatusChange = async (newStatus: DisciplineRecord["status"]) => {
  // 1. Mostrar mudança imediatamente
  setOptimisticStatus(newStatus);

  try {
    // 2. Fazer requisição
    await onUpdate(discipline.id, { status: newStatus });
    // 3. Sucesso! Dado fica como está
  } catch (error) {
    // 4. Erro! Reverter para status antigo
    setOptimisticStatus(discipline.status);
    alert("Falha ao atualizar status. Tente novamente.");
  }
};

// Usar no render:
<StatusBadge status={optimisticStatus} />
```

---

# 🟡 Filtros #4: Persistir em URL

**Arquivo:** `src/App.tsx`

### Usar React Router:
```tsx
import { useSearchParams } from 'react-router-dom';

export default function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Ler filtros da URL
  const filters = useMemo(() => ({
    search: searchParams.get('search') || '',
    status: (searchParams.get('status') || 'todas') as DashboardFilters['status'],
  }), [searchParams]);

  // Salvar filtros na URL
  const handleFilterChange = (newFilters: DashboardFilters) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.status !== 'todas') params.set('status', newFilters.status);
    setSearchParams(params);
  };

  return (
    <>
      {/* ... */}
      <FilterBar filters={filters} onChange={handleFilterChange} />
    </>
  );
}

// URL: /app?search=matematica&status=ativa
```

---

# ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] BUG #1 - Adicionar loading state para cursos
- [ ] BUG #2 - Corrigir loginWithGoogle com tratamento de erro
- [ ] BUG #4 - Corrigir sincronização DisciplineCard
- [ ] BUG #6 - Resetar estado no logout
- [ ] BUG #8 - Proteção contra duplicatas
- [ ] BUG #9 - Adicionar debounce
- [ ] UX #5 - Modal de confirmação delete
- [ ] UX #2 - Remover "Trilhas" ou implementar
- [ ] Performance #3 - Virtualizar grandes listas
- [ ] Estado #4 - Otimistic updates
- [ ] Filtros #4 - Persistir em URL

---

**Próximo:** Implementar fase por fase e testar cada correção.
