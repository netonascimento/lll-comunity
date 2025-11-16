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

- `disciplines`: `id`, `name`, `code`, `level`, `description`, `status`, `tags[]`, `cover_url`, `next_review_at`.
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

Atualize os `foreign tables`/views no Supabase Studio para permitir `select` nesses relacionamentos (ex.: `tutors:discipline_tutors(tutor: t_tutors (...))`).

> Dica: enquanto o Supabase não for conectado, o app renderiza os dados de `src/data/fallback.ts`, permitindo validar o design mobile first imediatamente.

### Adaptações recomendadas

1. Substituir o campo `time_ago` em `discipline_events` por um `timestamp` e calcular o relativo via SQL ou no client.
2. Criar policies RLS que limitem `update/insert` às funções de tutor/admin.
3. Conectar notificações em tempo real usando `supabase.channel('discipline_events')` para que novos comentários apareçam instantaneamente.

---

Qualquer ajuste extra (novos filtros, exportação de relatórios) pode ser adicionado reutilizando as estruturas pronta em `src/hooks/useDisciplineDashboard.ts` e os componentes em `src/sections`.
