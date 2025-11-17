# 🏗️ RECOMENDAÇÕES DE ARQUITETURA - Comunidade Virtual

**Data:** 16 de novembro de 2025  
**Nível:** Senior / Lead Engineer

---

## 📐 Problemas Arquiteturais

### 1. Falta de Separação de Concerns

**Problema:**
```tsx
// App.tsx tem responsabilidade de:
// 1. Autenticação (useAuth)
// 2. Disciplinas (useDisciplineDashboard)
// 3. Cursos (useCourseManager)
// 4. Usuários (useUserDirectory)
// 5. Roteamento de seções
// 6. Renderização de UI
// 7. Passagem de props para 20+ componentes

// Resultado: 302 linhas em um arquivo
// Re-render em cascata quando ANY estado muda
```

**Solução: Usar Context + Page Components**

```tsx
// Estrutura nova:
src/
├── context/
│   ├── DisciplinesContext.tsx      // useDisciplineDashboard
│   ├── CoursesContext.tsx          // useCourseManager
│   ├── UsersContext.tsx            // useUserDirectory
│   └── NavigationContext.tsx       // activeSection, filters
│
├── pages/
│   ├── DashboardPage.tsx           // Dashboard
│   ├── CoursesPage.tsx             // Courses
│   ├── DisciplinesPage.tsx         // Disciplines
│   ├── UsersPage.tsx               // Tutors + Students
│   └── TracksPage.tsx              // Tracks
│
└── App.tsx (20 linhas)
    └── Só roteamento
```

---

### 2. Falta de Type Safety em Chamadas de API

**Problema:**
```typescript
// Em useDisciplineDashboard.ts
const { data, error } = await supabase
  .from("disciplines")
  .select(`
    id,
    name,
    code,
    ...
  `)
  .data as DisciplineRecord[];

// ❌ Casting com `as` sem validação
// ❌ Se schema muda, type fica errado
// ❌ Sem validação de dados
```

**Solução: Usar Zod para validação**

```bash
npm install zod
```

```typescript
import { z } from 'zod';

// Define schema
const DisciplineSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  level: z.string(),
  status: z.enum(["ativa", "planejamento", "pausada"]),
  description: z.string(),
  ementa: z.string(),
  tags: z.array(z.string()),
  cover_url: z.string().optional(),
  created_by: z.string(),
  // ... mais fields
});

type DisciplineRecord = z.infer<typeof DisciplineSchema>;

// Em useDisciplineDashboard.ts
const { data, error } = await supabase
  .from("disciplines")
  .select("*");

if (error) throw error;

// ✅ Valida dados
const disciplines = z.array(DisciplineSchema).parse(data);

// TypeScript garante segurança
```

---

### 3. Sem Cache Strategy

**Problema:**
```typescript
// Cada reload = requisição inteira ao servidor
// Se usuário volta para Dashboard, recarrega tudo novamente
// Sem cache, sem stale-while-revalidate
```

**Solução: Implementar React Query (TanStack Query)**

```bash
npm install @tanstack/react-query
```

```typescript
import { useQuery } from '@tanstack/react-query';

export function useDisciplines() {
  return useQuery({
    queryKey: ['disciplines'],
    queryFn: async () => {
      const { data } = await supabase
        .from('disciplines')
        .select('*');
      return z.array(DisciplineSchema).parse(data);
    },
    // ✅ Cache por 5 minutos
    staleTime: 5 * 60 * 1000,
    // ✅ Background revalidation
    refetchOnWindowFocus: true,
    // ✅ Retry automático
    retry: 3,
  });
}

// No componente:
const { data: disciplines, isLoading, error } = useDisciplines();

// Se usuário volta para aba, dados vêm do cache imediatamente
// Em background, React Query revalida
```

---

### 4. Sem Invalidação de Cache

**Problema:**
```typescript
// Criar disciplina:
1. await createDiscipline(payload)
2. await loadData()  // Recarrega TUDO

// Melhor seria:
1. await createDiscipline(payload)
2. queryClient.invalidateQueries(['disciplines'])
// React Query recarrega de forma inteligente
```

**Solução: Usar queryClient.invalidateQueries()**

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateDiscipline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateDisciplinePayload) => {
      const { data, error } = await supabase
        .from('disciplines')
        .insert(payload)
        .select()
        .single();
      
      if (error) throw error;
      return DisciplineSchema.parse(data);
    },
    onSuccess: () => {
      // ✅ Invalida apenas disciplinas, não tudo
      queryClient.invalidateQueries({ queryKey: ['disciplines'] });
    },
    onError: (error) => {
      console.error('Failed to create discipline:', error);
    },
  });
}
```

---

### 5. Sem Error Boundary

**Problema:**
```typescript
// Se qualquer componente lança erro, APP QUEBRA
// Sem salvação
```

**Solução: Adicionar Error Boundary**

```tsx
// src/components/ErrorBoundary.tsx
import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Pode enviar para serviço de logging
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
          <div className="rounded-3xl bg-red-900/20 p-8 text-center">
            <h1 className="text-2xl font-bold text-red-400">Oops!</h1>
            <p className="mt-2 text-slate-300">
              Algo deu errado. Por favor, recarregue a página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-2xl bg-red-600 px-6 py-2 font-semibold text-white hover:bg-red-700"
            >
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
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
```

---

### 6. Sem Logging Estruturado

**Problema:**
```typescript
// console.error() sem contexto
// Difícil debugar em produção
```

**Solução: Usar Winston ou Pino**

```bash
npm install winston
```

```typescript
// src/lib/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Usar em hooks:
export function useDisciplines() {
  return useQuery({
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('disciplines')
          .select('*');
        
        if (error) throw error;
        
        logger.info('Disciplines loaded', { count: data.length });
        return data;
      } catch (error) {
        logger.error('Failed to load disciplines', { error });
        throw error;
      }
    },
  });
}
```

---

### 7. Sem Rate Limiting no Cliente

**Problema:**
```typescript
// Usuário pode enviar 1000 requisições por segundo
// Sem proteção
```

**Solução: Debounce + Throttle**

```typescript
// src/lib/async-utils.ts
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Usar em DisciplineCard:
const debouncedUpdate = useMemo(
  () => debounce((payload: Partial<DisciplineRecord>) => {
    onUpdate(discipline.id, payload);
  }, 500),
  [discipline.id, onUpdate]
);

// Ao editar:
const handleNameChange = (name: string) => {
  setFormState(prev => ({ ...prev, name }));
  debouncedUpdate({ name });
};
```

---

### 8. Falta de Monitoria de Performance

**Problema:**
```typescript
// Não sabemos quais componentes são lentos
// Sem Web Vitals monitoring
```

**Solução: Usar web-vitals**

```bash
npm install web-vitals
```

```typescript
// src/lib/web-vitals.ts
import {
  getCLS,
  getFID,
  getFCP,
  getLCP,
  getTTFB,
} from 'web-vitals';

export function initWebVitals() {
  getCLS(console.log);
  getFID(console.log);
  getFCP(console.log);
  getLCP(console.log);
  getTTFB(console.log);
}

// Em main.tsx:
initWebVitals();
```

---

## 🔄 ARQUITETURA RECOMENDADA

### Estrutura Completa:
```
src/
├── lib/
│   ├── supabase.ts              (client + types)
│   ├── logger.ts                (Winston)
│   ├── async-utils.ts           (debounce, throttle)
│   ├── api-client.ts            (queries com Zod)
│   └── web-vitals.ts            (monitoring)
│
├── types/
│   ├── auth.ts                  (UserRole, UserProfile)
│   ├── course.ts                (Course, CourseTurma)
│   ├── dashboard.ts             (Discipline, Stats)
│   └── api.ts                   (API responses)
│
├── schemas/                     (✨ Novo)
│   ├── discipline.ts            (Zod schemas)
│   ├── course.ts
│   ├── user.ts
│   └── api.ts
│
├── hooks/
│   ├── useAuth.tsx              (existente)
│   ├── useDisciplines.ts        (✨ Com React Query)
│   ├── useCourses.ts            (✨ Com React Query)
│   ├── useUsers.ts              (✨ Com React Query)
│   └── useDebounce.ts           (✨ Novo)
│
├── context/
│   ├── DisciplinesContext.tsx   (✨ Novo)
│   ├── CoursesContext.tsx       (✨ Novo)
│   └── UsersContext.tsx         (✨ Novo)
│
├── pages/
│   ├── DashboardPage.tsx        (✨ Novo)
│   ├── CoursesPage.tsx          (✨ Novo)
│   ├── DisciplinesPage.tsx      (✨ Novo)
│   ├── UsersPage.tsx            (✨ Novo)
│   └── TracksPage.tsx           (✨ Novo)
│
├── sections/
│   └── (existentes + refatorados)
│
├── components/
│   ├── ErrorBoundary.tsx        (✨ Novo)
│   ├── LoadingSpinner.tsx       (✨ Novo)
│   └── (existentes + refatorados)
│
├── styles/
│   └── index.css
│
├── App.tsx                      (refatorado: 20 linhas)
├── main.tsx                     (com ErrorBoundary + React Query)
└── pages/
    └── LoginPage.tsx
```

---

## 📦 Dependências para Adicionar

```bash
# React Query (caching + invalidation)
npm install @tanstack/react-query

# Validação de schemas
npm install zod

# Logging estruturado
npm install winston

# Web Vitals
npm install web-vitals

# Virtualização (grandes listas)
npm install react-window

# Roteamento melhorado (opcional)
npm install react-router-dom

# Total: ~5 pacotes novos
```

---

## 🚀 Mapa de Implementação

### Fase 1: Fundação (1-2 semanas)
- [ ] Instalar dependências
- [ ] Criar schemas Zod
- [ ] Implementar React Query
- [ ] Adicionar Error Boundary
- [ ] Refatorar main.tsx

### Fase 2: Refatoração (2-3 semanas)
- [ ] Criar contexts (Disciplines, Courses, Users)
- [ ] Criar pages (Dashboard, Courses, Disciplines, Users)
- [ ] Refatorar App.tsx
- [ ] Atualizar hooks com React Query
- [ ] Adicionar logging

### Fase 3: Otimização (1-2 semanas)
- [ ] Virtualizar listas grandes
- [ ] Implementar debounce/throttle
- [ ] Web Vitals monitoring
- [ ] Performance audit

---

## 📋 Checklist de Arquitetura

- [ ] Separação de concerns (Context + Pages)
- [ ] Type safety (Zod validation)
- [ ] Cache strategy (React Query)
- [ ] Error handling (Error Boundary)
- [ ] Logging estruturado (Winston)
- [ ] Rate limiting (Debounce/Throttle)
- [ ] Performance monitoring (Web Vitals)
- [ ] Tests unitários
- [ ] Tests de integração
- [ ] Documentação de API

---

**Próximo:** Começar com Fase 1.
