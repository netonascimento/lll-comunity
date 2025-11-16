import { DashboardData } from "@/types/dashboard";

export const FALLBACK_DASHBOARD: DashboardData = {
  summary: {
    totalDisciplines: 8,
    activeStudents: 620,
    satisfaction: 92,
    completionRate: 78,
  },
  disciplines: [
    {
      id: "disc-01",
      name: "Matemática Aplicada",
      code: "MAT200",
      level: "Intermediário",
      status: "ativa",
      description:
        "Trilha com foco em problemas reais para preparar alunos para olimpíadas internas e competições.",
      ementa:
        "Fundamentos de análise combinatória, probabilidade aplicada e resolução de problemas guiada por IA com simulados semanais.",
      tags: ["Resumos IA", "Simulados", "Mentorias"],
      coverUrl:
        "https://images.unsplash.com/photo-1509226705309-c6aba3e9f461?auto=format&fit=crop&w=900&q=60",
      tutors: [
        {
          id: "tutor-ana",
          name: "Ana Viana",
          email: "ana@escolaonline.com",
          avatarUrl:
            "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=600&q=80",
          expertise: ["Raciocínio lógico", "Competências socioemocionais"],
        },
        {
          id: "tutor-lucas",
          name: "Lucas Amaral",
          email: "lucas@escolaonline.com",
          avatarUrl:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
          expertise: ["Gamificação", "Projetos práticos"],
        },
      ],
      stats: {
        activeStudents: 210,
        completionRate: 83,
        satisfaction: 95,
        engagements: [72, 80, 74, 88, 95, 91, 97],
        studyTime: 4.2,
        updatedAt: "2024-06-07T12:00:00-03:00",
      },
      objectives: [
        "Atualizar banco de simulados com IA",
        "Liberar kit de estudo da unidade 4",
        "Configurar notificações inteligentes",
      ],
      nextReviewAt: "2024-07-02T14:00:00-03:00",
      pendingActions: [
        {
          type: "feedback",
          label: "Responder pesquisa com baixa nota",
          dueDate: "2024-06-15",
        },
      ],
      learningBlocks: [
        {
          id: "mat-bloco-1",
          title: "Modelagem com dados reais",
          description:
            "Desafios com datasets de esportes e logística para treinar estimativas e combinatória.",
          videos: [
            {
              id: "mat-video-1",
              title: "Aplicando modelos probabilísticos na prática",
              url: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
            },
          ],
          documents: [
            {
              id: "mat-doc-1",
              title: "Caderno de exercícios diagnóstico",
              url: "https://www.escolaonline.com/docs/mat-diagnostico.pdf",
            },
          ],
        },
        {
          id: "mat-bloco-2",
          title: "Estratégias de simulado com IA",
          description:
            "Exploração guiada por IA dos principais erros em simulados com planos personalizados.",
          videos: [
            {
              id: "mat-video-2",
              title: "Como interpretar insights gerados por IA",
              url: "https://www.youtube.com/watch?v=J---aiyznGQ",
            },
          ],
          documents: [
            {
              id: "mat-doc-2",
              title: "Template de plano de estudos automático",
              url: "https://www.escolaonline.com/docs/mat-plano-estudos.pdf",
            },
          ],
        },
      ],
    },
    {
      id: "disc-02",
      name: "Linguagens e Multiletramentos",
      code: "LIN150",
      level: "Avançado",
      status: "ativa",
      description:
        "Experiências imersivas com foco em comunicação colaborativa e interpretação de textos multimodais.",
      ementa:
        "Leitura crítica, storytelling transmídia, oficinas de vídeo arte e fóruns mediados por voz e IA para feedback instantâneo.",
      tags: ["Notas de voz", "Roteiros", "Fórum ativo"],
      coverUrl:
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&q=60",
      tutors: [
        {
          id: "tutor-joana",
          name: "Joana Santos",
          email: "joana@escolaonline.com",
          avatarUrl:
            "https://images.unsplash.com/photo-1550525811-e5869dd03032?auto=format&fit=crop&w=600&q=80",
          expertise: ["Storytelling", "Comunicação visual"],
        },
      ],
      stats: {
        activeStudents: 180,
        completionRate: 71,
        satisfaction: 88,
        engagements: [40, 55, 65, 58, 70, 62, 60],
        studyTime: 3.1,
        updatedAt: "2024-06-08T09:00:00-03:00",
      },
      objectives: [
        "Adicionar insights do fórum no painel",
        "Gerar trilha adaptativa para turma B",
      ],
      nextReviewAt: "2024-06-24T10:00:00-03:00",
      pendingActions: [
        {
          type: "mentoria",
          label: "Agendar mentoria com tutora Joana",
          dueDate: "2024-06-12",
        },
        {
          type: "atualizacao",
          label: "Revisar materiais com IA",
          dueDate: "2024-06-18",
        },
      ],
      learningBlocks: [
        {
          id: "lin-bloco-1",
          title: "Roteiro multimídia",
          description:
            "Construção de narrativas que combinam texto, áudio e vídeo com foco em autorregulação.",
          videos: [
            {
              id: "lin-video-1",
              title: "Tutorial de storytelling visual",
              url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
            },
          ],
          documents: [
            {
              id: "lin-doc-1",
              title: "Checklist de revisão de roteiro colaborativo",
              url: "https://www.escolaonline.com/docs/lin-checklist.pdf",
            },
          ],
        },
        {
          id: "lin-bloco-2",
          title: "Fórum guiado por voz",
          description:
            "Práticas de escuta ativa e síntese usando notas de voz e resumos automáticos.",
          videos: [
            {
              id: "lin-video-2",
              title: "Oficina: notas de voz com impacto",
              url: "https://www.youtube.com/watch?v=2vjPBrBU-TM",
            },
          ],
          documents: [
            {
              id: "lin-doc-2",
              title: "Roteiro para feedback em áudio",
              url: "https://www.escolaonline.com/docs/lin-feedback-audio.pdf",
            },
          ],
        },
      ],
    },
    {
      id: "disc-03",
      name: "Projetos Integradores",
      code: "PRO330",
      level: "Inovação",
      status: "planejamento",
      description:
        "Hub para desafios multidisciplinares com foco em comunidade e desenvolvimento socioemocional.",
      ementa:
        "Integração de STEAM com impactos sociais, ciclos rápidos de prototipagem e acompanhamento socioemocional.",
      tags: ["Em validação", "Novos tutores", "IA assistiva"],
      coverUrl:
        "https://images.unsplash.com/photo-1454165205744-3b78555e5572?auto=format&fit=crop&w=900&q=60",
      tutors: [
        {
          id: "tutor-camila",
          name: "Camila Dias",
          email: "camila@escolaonline.com",
          avatarUrl:
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
          expertise: ["Aprendizagem por projetos"],
        },
      ],
      stats: {
        activeStudents: 45,
        completionRate: 0,
        satisfaction: 0,
        engagements: [10, 12, 8, 15, 18, 17, 20],
        studyTime: 0,
        updatedAt: "2024-06-05T17:00:00-03:00",
      },
      objectives: [
        "Definir KPIs com coordenação",
        "Configurar equipe de tutores",
        "Validar plano de acompanhamento",
      ],
      nextReviewAt: "2024-06-20T09:30:00-03:00",
      pendingActions: [
        {
          type: "atualizacao",
          label: "Subir materiais iniciais",
          dueDate: "2024-06-13",
        },
      ],
      learningBlocks: [
        {
          id: "pro-bloco-1",
          title: "Imersão em problemas reais",
          description:
            "Mapeamento de dores da comunidade, entrevistas rápidas e definição de desafios com ferramentas IA.",
          videos: [
            {
              id: "pro-video-1",
              title: "Como conduzir entrevistas rápidas",
              url: "https://www.youtube.com/watch?v=oHg5SJYRHA0",
            },
          ],
          documents: [
            {
              id: "pro-doc-1",
              title: "Canvas de investigação local",
              url: "https://www.escolaonline.com/docs/pro-investigacao.pdf",
            },
          ],
        },
      ],
    },
  ],
  timeline: [
    {
      id: "event-01",
      disciplineId: "disc-02",
      title: "Novo feedback no fórum",
      type: "forum",
      timeAgo: "10 min",
      owner: "Marcela Lopes",
    },
    {
      id: "event-02",
      disciplineId: "disc-01",
      title: "IA sugeriu 3 trechos para revisão",
      type: "material",
      timeAgo: "45 min",
      owner: "Assistente IA",
    },
    {
      id: "event-03",
      disciplineId: "disc-03",
      title: "Tutor Camila revisou cronograma",
      type: "mentoria",
      timeAgo: "2 h",
      owner: "Camila Dias",
    },
  ],
};
