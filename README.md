## Gestão Avançada de Disciplinas

Aplicação React + Vite (mobile first) para o painel de administração de disciplinas da Escola Online. O painel conecta no Supabase, organiza tutores, oferece formulários rápidos para edição e mostra notificações do fórum.

### Principais recursos

- Cards analíticos com totais, satisfação média e taxa de conclusão.
- Visão visual de engajamento semanal (Recharts) e distribuição por status.
- Cards detalhados por disciplina com:
  - indicadores (alunos ativos, conclusão, próxima revisão);
  - pendências inteligentes e objetivos;
  - formulários embutidos para editar informações, registrar ações e vincular novos tutores.
- Builder completo de **ementa** e **blocos de aprendizado** por disciplina com anexos de vídeos e PDFs.
- Dialogo para cadastrar novas disciplinas já com ementa/blocos e próxima revisão definida.
- Linha do tempo de notificações de fórum/materiais com foco no requisito de alertas de novas respostas.
- Hook `useDisciplineDashboard` que integra com o Supabase e cai automaticamente em dados de fallback quando as variáveis ainda não estão configuradas.
- Autenticação com Supabase Auth (ou modo demo offline) e painel de autorizações (master/tutor/professor) com bloqueios visíveis na UI.

### Começando

1. Instale as dependências
   ```bash
   npm install
   ```
2. Configure as variáveis no arquivo `.env.local`:
   ```bash
   VITE_SUPABASE_URL="https://<project>.supabase.co"
   VITE_SUPABASE_ANON_KEY="<public-anon-key>"
   ```
3. Rode em desenvolvimento:
   ```bash
   npm run dev
   ```
4. Build de produção:
   ```bash
   npm run build
   npm run preview
   ```

### Estrutura de dados no Supabase

A consulta definida em `src/lib/supabase.ts` espera as seguintes tabelas/relacionamentos (ajuste os nomes se já possuir outro esquema):

- `profiles`: `id uuid primary key references auth.users`, `email text unique`, `display_name text`, `role text check (role in ('master','tutor','professor','aluno'))`, `status text check (status in ('active','inactive'))`, `avatar_url text`. Esta tabela representa o perfil com o papel usado pelo RLS.
- `disciplines`: `id`, `name`, `code`, `level`, `description`, `status`, `tags[]`, `cover_url`, `next_review_at`.
- `disciplines.created_by uuid references public.profiles(id)` e `disciplines.learning_blocks jsonb`.
- `disciplines.ementa` (text) e `disciplines.learning_blocks` (JSONB) armazenando blocos e recursos em um único payload:
  ```json
  [
    {
      "id": "block-uuid",
      "title": "Título do bloco",
      "description": "Resumo",
      "videos": [{ "id": "vid-uuid", "title": "Título", "url": "https://..." }],
      "documents": [{ "id": "doc-uuid", "title": "Material", "url": "https://...pdf" }]
    }
  ]
  ```
- `discipline_stats`: FK `discipline_id`, `active_students`, `completion_rate`, `satisfaction`, `engagements[]` (array numérica com 7 posições), `study_time`, `updated_at`.
- `discipline_objectives`: FK `discipline_id`, `text`.
- `discipline_actions`: FK `discipline_id`, `type` (`atualizacao | feedback | mentoria`), `label`, `due_date`.
- `tutors`: `id`, `name`, `email`, `avatar_url`, `expertise[]`.
- `discipline_tutors`: FK `discipline_id`, `tutor_id` (relaciona com `tutors`).
- `discipline_events`: `id`, `discipline_id`, `title`, `type` (`forum | material | mentoria`), `time_ago`, `owner`, `created_at`.
- `courses`: `id uuid`, `name`, `description`, `cover_url`, `created_by`.
- `course_disciplines`: FK (`course_id`, `discipline_id`) com ordem opcional `order_index`.
- `courses_turmas`: `id uuid`, `course_id`, `name`, `period`, `starts_at date`, `ends_at date`, `mentor text`, `students_count int`.
- `course_enrollments`: `id uuid`, `course_id`, `turma_id`, `student_id references profiles`, `progress numeric default 0`.

Atualize os `foreign tables`/views no Supabase Studio para permitir `select` nesses relacionamentos (ex.: `tutors:discipline_tutors(tutor: t_tutors (...))`).

> Dica: enquanto o Supabase não for conectado, o app renderiza os dados de `src/data/fallback.ts`, permitindo validar o design mobile first imediatamente.

### Adaptações recomendadas

1. Substituir o campo `time_ago` em `discipline_events` por um `timestamp` e calcular o relativo via SQL ou no client.
2. Criar policies RLS que limitem `update/insert` às funções de tutor/admin.
3. Conectar notificações em tempo real usando `supabase.channel('discipline_events')` para que novos comentários apareçam instantaneamente.

### Autenticação & RLS

SQL base para habilitar logins com papéis e proteger os dados:

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  display_name text,
  role text not null default 'aluno' check (role in ('master','tutor','professor','aluno')),
  status text not null default 'active' check (status in ('active','inactive')),
  avatar_url text,
  created_at timestamptz default timezone('utc', now())
);

alter table public.disciplines
  add column created_by uuid references public.profiles(id) on delete set null;

create or replace function auth.role()
returns text language sql stable as $$
  select coalesce(current_setting('request.jwt.claim.role', true), 'anon');
$$;

create or replace function auth.uid()
returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
```

Policies principais (ajuste conforme necessário):

```sql
alter table public.profiles enable row level security;
alter table public.disciplines enable row level security;
-- demais tabelas idem...

create policy "profile self read" on public.profiles
  for select
  using (auth.uid() = id or auth.role() = 'master');

create policy "profile admin update" on public.profiles
  for update using (auth.role() = 'master') with check (auth.role() = 'master');

create policy "discipline read" on public.disciplines
  for select using (auth.uid() is not null);

create policy "discipline insert" on public.disciplines
  for insert with check (
    auth.role() in ('master','tutor')
    and created_by = auth.uid()
  );

create policy "discipline update owner" on public.disciplines
  for update using (
    auth.role() = 'master'
    or created_by = auth.uid()
  )
  with check (
    auth.role() = 'master'
    or created_by = auth.uid()
  );
-- Cursos e turmas
alter table public.courses enable row level security;
alter table public.course_disciplines enable row level security;
alter table public.courses_turmas enable row level security;
alter table public.course_enrollments enable row level security;

create policy "courses read" on public.courses
  for select using (auth.uid() is not null);

create policy "courses insert tutor" on public.courses
  for insert with check (auth.role() in ('master','tutor') and created_by = auth.uid());

create policy "courses update master" on public.courses
  for update using (auth.role() = 'master') with check (auth.role() = 'master');

create policy "course_disciplines manage master"
  on public.course_disciplines
  using (auth.role() = 'master')
  with check (auth.role() = 'master');

create policy "turmas read" on public.courses_turmas
  using (auth.uid() is not null);

create policy "turmas manage master"
  on public.courses_turmas
  using (auth.role() = 'master')
  with check (auth.role() = 'master');

create policy "course enrollments student read"
  on public.course_enrollments
  for select
  using (
    auth.role() in ('master','tutor')
    or student_id = auth.uid()
  );

create policy "course enrollments master manage"
  on public.course_enrollments
  for insert using (auth.role() = 'master')
  with check (auth.role() = 'master');
```

Crie políticas semelhantes para `discipline_actions`, `discipline_tutors`, etc., sempre garantindo que o tutor só altere registros da disciplina na qual está vinculado. Alunos (`role = 'aluno'`) só podem ler registros nas turmas/disciplinas em que estão matriculados. O master mantém `canManageUsers` na interface e consegue mudar papéis/ativar-inativar usuários.

Enquanto o Supabase não estiver configurado, use os logins demo no modal de autenticação:

- `master@escolaonline.com / master123`
- `tutor@escolaonline.com / tutor123`
- `professora@escolaonline.com / prof123`
- `aluno@escolaonline.com / aluno123`

### Login com Google

1. Em **Authentication → Providers** do Supabase habilite Google e informe o Client ID/Secret do seu Workspace.
2. Configure `Site URL` e `Redirect URL` com o domínio/localhost do front (ex.: `http://localhost:5173`).
3. O botão “Entrar com Google” chama `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })`.
4. Para cadastros manuais, use `supabase.auth.signUp` e logo após insira o registro correspondente em `profiles` com o papel inicial (`aluno` ou `professor`). Masters podem promover para tutor pelo painel administrativo.

---

Qualquer ajuste extra (novos filtros, exportação de relatórios) pode ser adicionado reutilizando as estruturas pronta em `src/hooks/useDisciplineDashboard.ts` e os componentes em `src/sections`.
