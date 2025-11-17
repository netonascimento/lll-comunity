# 🚀 QUICK REFERENCE - Bugs e Soluções

## TOP 5 BUGS A CORRIGIR HOJE

### 1️⃣ BUG #6 - Vazamento de Dados ⚠️ CRÍTICO

**Arquivo:** `src/App.tsx`  
**Problema:** Estados não são resetados ao fazer logout → dados do usuário A aparecem para usuário B  
**Solução:** Adicionar reset de estados na função logout

```tsx
// ANTES (ERRADO):
const handleLogout = async () => {
  await logout();
};

// DEPOIS (CORRETO):
const handleLogout = async () => {
  setCreateOpen(false);
  setActiveSection("dashboard");
  setFilters({ search: "", status: "todas" });
  await logout();
};
```

**Tempo:** 2 minutos | **Severidade:** 🔴 CRÍTICA

---

### 2️⃣ BUG #2 - Race Condition Login Google

**Arquivo:** `src/hooks/useAuth.tsx`  
**Problema:** Sem tratamento de erro em loginWithGoogle → pode falhar silenciosamente  
**Solução:** Adicionar try/catch

```tsx
// ANTES (ERRADO):
const loginWithGoogle = useCallback(async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({...});
}, []);

// DEPOIS (CORRETO):
const loginWithGoogle = useCallback(async () => {
  setError(null);
  try {
    if (!supabase) throw new Error("Serviço indisponível");
    const { data, error } = await supabase.auth.signInWithOAuth({...});
    if (error) throw error;
  } catch (err) {
    setError(err instanceof Error ? err.message : "Erro ao entrar");
  }
}, []);
```

**Tempo:** 5 minutos | **Severidade:** 🔴 CRÍTICA

---

### 3️⃣ ERROR BOUNDARY - Sem Proteção

**Arquivo:** Criar `src/components/ErrorBoundary.tsx`  
**Problema:** App quebra se qualquer componente lança erro  
**Solução:** Implementar Error Boundary

```tsx
// Criar novo arquivo ErrorBoundary.tsx
import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-slate-950">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold">Oops!</h1>
            <button onClick={() => window.location.reload()}>
              Recarregar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Em main.tsx:
<ErrorBoundary>
  <AuthProvider>
    <App />
  </AuthProvider>
</ErrorBoundary>
```

**Tempo:** 10 minutos | **Severidade:** 🔴 CRÍTICA

---

### 4️⃣ UX #5 - Sem Confirmação Delete

**Arquivo:** `src/sections/CourseManagementPanel.tsx`  
**Problema:** Usuário deleta curso sem confirmação → sem volta  
**Solução:** Adicionar modal de confirmação

```tsx
// Adicionar estado:
const [deleteConfirm, setDeleteConfirm] = useState<{
  isOpen: boolean;
  courseId?: string;
  courseName?: string;
}>({ isOpen: false });

// Ao clicar delete:
const handleDeleteClick = (courseId, courseName) => {
  setDeleteConfirm({ isOpen: true, courseId, courseName });
};

// Confirmar:
const handleConfirmDelete = async () => {
  if (deleteConfirm.courseId) {
    await onDeleteCourse(deleteConfirm.courseId);
    setDeleteConfirm({ isOpen: false });
  }
};

// Renderizar modal:
{deleteConfirm.isOpen && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
    <div className="bg-slate-900 p-8 rounded-3xl">
      <p>Deletar "{deleteConfirm.courseName}"?</p>
      <button onClick={handleConfirmDelete}>Deletar</button>
      <button onClick={() => setDeleteConfirm({ isOpen: false })}>Cancelar</button>
    </div>
  </div>
)}
```

**Tempo:** 15 minutos | **Severidade:** ⚠️ ALTA

---

### 5️⃣ UX #2 - Trilhas Não Implementadas

**Arquivo:** `src/App.tsx`  
**Problema:** Menu mostra "Trilhas" mas não funciona  
**Solução:** Remover menu item OU implementar completo

#### Opção A: REMOVER (2 minutos)
```tsx
// Antes:
const menuItems = [
  { key: "dashboard", label: "Visão geral" },
  { key: "courses", label: "Cursos" },
  { key: "tracks", label: "Trilhas" },  // ❌ Remover esta linha
  { key: "disciplines", label: "Disciplinas" },
];

// Depois:
const menuItems = [
  { key: "dashboard", label: "Visão geral" },
  { key: "courses", label: "Cursos" },
  // ✅ "Trilhas" removido
  { key: "disciplines", label: "Disciplinas" },
];
```

#### Opção B: IMPLEMENTAR (2-4 horas)
Criar: Hook + Component + Fallback data + Types

**Tempo:** 2 min (remover) ou 2-4h (implementar) | **Severidade:** ⚠️ ALTA

---

## 🔍 OUTROS BUGS RÁPIDOS

### BUG #8 - Duplicatas em Cursos
**Local:** `CourseManagementPanel.tsx`  
**Fix:** Adicionar validação antes de criar
```tsx
if (courses.some(c => c.name.toLowerCase() === form.name.toLowerCase())) {
  alert("Curso já existe");
  return;
}
```
**Tempo:** 3 minutos

### BUG #9 - Debounce Edições
**Local:** `DisciplineCard.tsx`  
**Fix:** Adicionar debounce de 500ms
```tsx
const debouncedUpdate = useMemo(
  () => debounce((payload) => onUpdate(discipline.id, payload), 500),
  [discipline.id, onUpdate]
);
```
**Tempo:** 5 minutos

### BUG #4 - Sincronização DisciplineCard
**Local:** `DisciplineCard.tsx`  
**Fix:** Usar useEffect com expanded dependência
```tsx
useEffect(() => {
  if (!expanded) {
    setFormState({...discipline...});
  }
}, [discipline, expanded]);
```
**Tempo:** 10 minutos

---

## 📊 CRONÔMETRO DE IMPLEMENTAÇÃO

```
⏱️ 2 minutos  - Bug #6 (logout reset)
⏱️ 5 minutos  - Bug #2 (try/catch Google)
⏱️ 10 minutos - Error Boundary
⏱️ 2 minutos  - Bug #8 (duplicatas check)
⏱️ 5 minutos  - Bug #9 (debounce)
⏱️ 10 minutos - Bug #4 (useEffect fix)
⏱️ 2 minutos  - Remover Trilhas
⏱️ 15 minutos - Delete confirmation modal
────────────────────────────────────
⏱️ ~50 minutos TOTAL para 8 bugs!
```

---

## ✅ CHECKLIST RÁPIDO

```
SPRINT 1 - Hoje/Amanhã (1-2 horas)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ ] Adicionar handleLogout com reset (2 min)
[ ] Corrigir loginWithGoogle com try/catch (5 min)
[ ] Criar ErrorBoundary (10 min)
[ ] Remover Trilhas ou implementar (2-240 min)
[ ] Adicionar validação de email (3 min)
[ ] Adicionar delete confirmation (15 min)
[ ] Testar cada mudança (15 min)
┌─────────────────────────────────────────────────
│ TOTAL: ~1-2 horas para máximo impacto! 🚀
└─────────────────────────────────────────────────

SPRINT 2 - Esta semana (3-4 horas)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ ] Corrigir DisciplineCard useEffect (10 min)
[ ] Adicionar debounce em edições (5 min)
[ ] Adicionar validações em formulários (15 min)
[ ] Feedback visual em operações (20 min)
[ ] Corrigir duplicatas (3 min)
[ ] Code review + testes (30 min)
┌─────────────────────────────────────────────────
│ TOTAL: ~1.5 horas
└─────────────────────────────────────────────────

SPRINT 3 - Próximas 2 semanas (8-10 horas)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ ] React Query setup (2-3 horas)
[ ] Refatorar App.tsx (2-3 horas)
[ ] Virtualizar listas (2-3 horas)
[ ] Testes + Code review (1-2 horas)
```

---

## 🎯 RESUMO POR PRIORIDADE

### 🔴 CRÍTICA (3 primeiros)
1. Bug #6 - Logout reset (2 min)
2. Bug #2 - Google login (5 min)  
3. Error Boundary (10 min)

### ⚠️ ALTA (próximos 5)
4. Delete confirmation (15 min)
5. Remover Trilhas (2 min)
6. Bug #8 - Duplicatas (3 min)
7. Bug #9 - Debounce (5 min)
8. Bug #4 - Sync (10 min)

### 🟡 MÉDIA (depois)
9. Validações (15 min)
10. Feedback visual (20 min)
11. Performance (4-8 horas)
12. React Query (4-6 horas)

---

## 📚 DOCUMENTAÇÃO COMPLETA

Para mais detalhes:
- **REVISAO_COMPLETA.md** - Análise completa
- **SOLUCOES_IMPLEMENTAVEIS.md** - Código com exemplos
- **MAPA_TELAS_FLUXOS.md** - Arquitetura
- **ARQUITETURA_RECOMENDADA.md** - Refatoração

---

## 💡 PRO TIPS

✅ **Dica 1:** Corrigir na ordem proposta para máximo impacto  
✅ **Dica 2:** Fazer um commit por bug para fácil revert  
✅ **Dica 3:** Testar cada mudança antes de próxima  
✅ **Dica 4:** Usar branches feature (feat/bug-fix-X)  
✅ **Dica 5:** Fazer PR review antes de merge

---

```
╔════════════════════════════════════════════════════════════════╗
║  50 MINUTOS PARA MÁXIMO IMPACTO                              ║
║  Comece agora! 🚀                                            ║
╚════════════════════════════════════════════════════════════════╝
```
