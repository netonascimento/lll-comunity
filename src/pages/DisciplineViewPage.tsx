import { useState } from "react";
import { DisciplineRecord, LearningBlock, LearningResource } from "@/types/dashboard";
import { 
  BookOpen, 
  Video, 
  FileText, 
  CheckSquare, 
  MessageCircle,
  Clock,
  Users,
  ArrowLeft,
  PlayCircle,
  Download,
  X
} from "lucide-react";

type DisciplineViewPageProps = {
  discipline: DisciplineRecord;
  onBack: () => void;
};

type VideoWithBlock = LearningResource & { blockTitle: string };
type DocumentWithBlock = LearningResource & { blockTitle: string };

export function DisciplineViewPage({ discipline, onBack }: DisciplineViewPageProps) {
  const [activeTab, setActiveTab] = useState<"blocos" | "videos" | "documentos" | "questionarios" | "forum">("blocos");
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<VideoWithBlock | null>(null);
  const [viewingDocument, setViewingDocument] = useState<DocumentWithBlock | null>(null);

  // Coleta todos os vídeos e documentos de todos os blocos
  const allVideos: VideoWithBlock[] = discipline.learningBlocks.flatMap(block => 
    block.videos.map(video => ({ ...video, blockTitle: block.title }))
  );
  
  const allDocuments = discipline.learningBlocks.flatMap(block => 
    block.documents.map(doc => ({ ...doc, blockTitle: block.title }))
  );

  // Função para extrair ID do YouTube de diferentes formatos de URL
  const getYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/,
      /^([a-zA-Z0-9_-]{11})$/ // ID direto
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Função para renderizar o vídeo
  const handlePlayVideo = (video: VideoWithBlock) => {
    setPlayingVideo(video);
  };

  // Função para abrir documento
  const handleViewDocument = (doc: DocumentWithBlock) => {
    setViewingDocument(doc);
  };

  // Verifica se é PDF
  const isPDF = (url: string): boolean => {
    return url.toLowerCase().endsWith('.pdf') || url.includes('pdf');
  };

  const renderBlocksTab = () => (
    <div className="space-y-4">
      {discipline.learningBlocks.map((block, index) => (
        <div key={block.id} className="glass-panel rounded-2xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/20 text-brand-300">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-display text-xl text-white">{block.title}</h3>
                  <p className="text-sm text-slate-400">{block.description}</p>
                </div>
              </div>
              
              {expandedBlock === block.id && (
                <div className="mt-6 space-y-4">
                  {/* Vídeos do bloco */}
                  {block.videos.length > 0 && (
                    <div>
                      <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-300">
                        <Video className="h-4 w-4" />
                        Vídeos ({block.videos.length})
                      </h4>
                      <div className="space-y-2">
                        {block.videos.map((video) => (
                          <button
                            key={video.id}
                            onClick={() => handlePlayVideo({ ...video, blockTitle: block.title })}
                            className="flex w-full items-center gap-3 rounded-xl bg-black/20 p-3 hover:bg-black/30 transition-colors text-left"
                          >
                            <PlayCircle className="h-5 w-5 text-brand-400 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm text-white">{video.title}</p>
                            </div>
                            <span className="rounded-lg bg-brand-500/20 px-3 py-1 text-xs text-brand-300">
                              Assistir
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Documentos do bloco */}
                  {block.documents.length > 0 && (
                    <div>
                      <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-300">
                        <FileText className="h-4 w-4" />
                        Documentos ({block.documents.length})
                      </h4>
                      <div className="space-y-2">
                        {block.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center gap-3 rounded-xl bg-black/20 p-3 hover:bg-black/30 transition-colors"
                          >
                            <FileText className="h-5 w-5 text-violet-400 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm text-white">{doc.title}</p>
                            </div>
                            <div className="flex gap-2">
                              {isPDF(doc.url) && (
                                <button
                                  onClick={() => handleViewDocument({ ...doc, blockTitle: block.title })}
                                  className="rounded-lg bg-violet-500/20 px-3 py-1 text-xs text-violet-300 hover:bg-violet-500/30"
                                >
                                  Visualizar
                                </button>
                              )}
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg bg-white/10 px-3 py-1 text-xs text-slate-300 hover:bg-white/20"
                              >
                                {isPDF(doc.url) ? 'Abrir fora' : 'Abrir'}
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <button
              onClick={() => setExpandedBlock(expandedBlock === block.id ? null : block.id)}
              className="ml-4 rounded-lg bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
            >
              {expandedBlock === block.id ? "Recolher" : "Ver conteúdo"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderVideosTab = () => (
    <div className="space-y-3">
      {allVideos.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <Video className="mx-auto h-12 w-12 text-slate-600" />
          <p className="mt-4 text-slate-400">Nenhum vídeo disponível</p>
        </div>
      ) : (
        allVideos.map((video) => (
          <button
            key={video.id}
            onClick={() => handlePlayVideo(video)}
            className="glass-panel rounded-xl p-4 w-full text-left hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-brand-500/20">
                <PlayCircle className="h-8 w-8 text-brand-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-white">{video.title}</h4>
                <p className="text-sm text-slate-400">{video.blockTitle}</p>
              </div>
              <span className="rounded-lg bg-brand-500/20 px-4 py-2 text-sm text-brand-300">
                Assistir
              </span>
            </div>
          </button>
        ))
      )}
    </div>
  );

  const renderDocumentsTab = () => (
    <div className="space-y-3">
      {allDocuments.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-600" />
          <p className="mt-4 text-slate-400">Nenhum documento disponível</p>
        </div>
      ) : (
        allDocuments.map((doc) => (
          <div key={doc.id} className="glass-panel rounded-xl p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-violet-500/20">
                <FileText className="h-8 w-8 text-violet-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-white">{doc.title}</h4>
                <p className="text-sm text-slate-400">{doc.blockTitle}</p>
              </div>
              <div className="flex gap-2">
                {isPDF(doc.url) && (
                  <button
                    onClick={() => handleViewDocument(doc)}
                    className="rounded-lg bg-violet-500/20 px-4 py-2 text-sm text-violet-300 hover:bg-violet-500/30"
                  >
                    Visualizar
                  </button>
                )}
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/20 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isPDF(doc.url) ? 'Abrir fora' : 'Abrir'}
                </a>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderQuestionariosTab = () => (
    <div className="glass-panel rounded-2xl p-12 text-center">
      <CheckSquare className="mx-auto h-12 w-12 text-slate-600" />
      <p className="mt-4 text-slate-400">Questionários em desenvolvimento</p>
      <p className="mt-2 text-sm text-slate-500">
        Em breve você poderá criar e responder questionários
      </p>
    </div>
  );

  const renderForumTab = () => (
    <div className="glass-panel rounded-2xl p-12 text-center">
      <MessageCircle className="mx-auto h-12 w-12 text-slate-600" />
      <p className="mt-4 text-slate-400">Fórum em desenvolvimento</p>
      <p className="mt-2 text-sm text-slate-500">
        Em breve você poderá participar de discussões sobre o curso
      </p>
    </div>
  );

  const tabs = [
    { id: "blocos", label: "Blocos de aprendizado", icon: BookOpen },
    { id: "videos", label: "Todos os vídeos", icon: Video },
    { id: "documentos", label: "Documentos", icon: FileText },
    { id: "questionarios", label: "Questionários", icon: CheckSquare },
    { id: "forum", label: "Fórum", icon: MessageCircle },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* PDF Viewer Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-sm p-4">
          <div className="w-full max-w-6xl h-[90vh] flex flex-col">
            {/* Header do viewer */}
            <div className="mb-4 flex items-start justify-between flex-shrink-0">
              <div>
                <h3 className="text-2xl font-display text-white">{viewingDocument.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{viewingDocument.blockTitle}</p>
              </div>
              <div className="flex gap-2">
                <a
                  href={viewingDocument.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-violet-500/20 px-4 py-2 text-sm text-violet-300 hover:bg-violet-500/30 transition-colors flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Abrir fora
                </a>
                <button
                  onClick={() => setViewingDocument(null)}
                  className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            {/* PDF Viewer */}
            <div className="relative flex-1 overflow-hidden rounded-2xl bg-white shadow-2xl shadow-violet-500/20">
              <iframe
                src={`${viewingDocument.url}#toolbar=1&navpanes=1&scrollbar=1`}
                title={viewingDocument.title}
                className="absolute inset-0 h-full w-full"
              />
            </div>

            {/* Informação adicional */}
            <div className="mt-4 rounded-xl bg-white/5 p-4 backdrop-blur-sm flex-shrink-0">
              <p className="text-sm text-slate-300">
                Parte do bloco: <span className="text-violet-300 font-medium">{viewingDocument.blockTitle}</span>
                <span className="mx-2">·</span>
                <span className="text-slate-400">Use os controles do PDF para navegar ou abra em nova aba para melhor experiência</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-sm p-4">
          <div className="w-full max-w-5xl">
            {/* Header do player */}
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-display text-white">{playingVideo.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{playingVideo.blockTitle}</p>
              </div>
              <button
                onClick={() => setPlayingVideo(null)}
                className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Player de vídeo */}
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl shadow-brand-500/20">
              {(() => {
                const youtubeId = getYouTubeId(playingVideo.url);
                if (youtubeId) {
                  return (
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                      title={playingVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full"
                    />
                  );
                }
                
                // Vimeo
                const vimeoMatch = playingVideo.url.match(/vimeo\.com\/(\d+)/);
                if (vimeoMatch) {
                  return (
                    <iframe
                      src={`https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`}
                      title={playingVideo.title}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full"
                    />
                  );
                }
                
                // MP4 ou outros formatos
                if (playingVideo.url.endsWith('.mp4') || playingVideo.url.endsWith('.webm')) {
                  return (
                    <video
                      src={playingVideo.url}
                      controls
                      autoPlay
                      className="absolute inset-0 h-full w-full"
                    >
                      Seu navegador não suporta a reprodução de vídeo.
                    </video>
                  );
                }
                
                // Fallback: iframe genérico
                return (
                  <iframe
                    src={playingVideo.url}
                    title={playingVideo.title}
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                );
              })()}
            </div>

            {/* Informação adicional */}
            <div className="mt-4 rounded-xl bg-white/5 p-4 backdrop-blur-sm">
              <p className="text-sm text-slate-300">
                Parte do bloco: <span className="text-brand-300 font-medium">{playingVideo.blockTitle}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Voltar
          </button>
        </div>

        {/* Disciplina Info */}
        <div className="glass-panel rounded-3xl p-8 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display text-4xl text-white">{discipline.name}</h1>
                <span className="rounded-full bg-brand-500/20 px-3 py-1 text-xs text-brand-300">
                  {discipline.code}
                </span>
              </div>
              <p className="text-lg text-slate-300 mb-4">{discipline.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-300">Nível: {discipline.level || "Não definido"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-300">{discipline.stats.activeStudents} alunos ativos</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-300">{discipline.learningBlocks.length} blocos</span>
                </div>
              </div>

              {discipline.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {discipline.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ementa */}
          {discipline.ementa && (
            <div className="mt-6 border-t border-white/10 pt-6">
              <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-400">
                Ementa
              </h3>
              <p className="text-slate-300 whitespace-pre-wrap">{discipline.ementa}</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="glass-panel rounded-3xl p-6">
          <div className="mb-6 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-all ${
                  activeTab === tab.id
                    ? "bg-brand-500/20 text-brand-300 shadow-lg shadow-brand-500/20"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "blocos" && renderBlocksTab()}
            {activeTab === "videos" && renderVideosTab()}
            {activeTab === "documentos" && renderDocumentsTab()}
            {activeTab === "questionarios" && renderQuestionariosTab()}
            {activeTab === "forum" && renderForumTab()}
          </div>
        </div>
      </div>
    </div>
  );
}
