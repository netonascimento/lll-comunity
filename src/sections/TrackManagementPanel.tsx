import { useState } from "react";
import { DisciplineRecord } from "@/types/dashboard";
import { generateId } from "@/lib/id";

type TrackManagementPanelProps = {
  disciplines: DisciplineRecord[];
  onUpdate: (id: string, payload: Partial<DisciplineRecord>) => Promise<void> | void;
  busy?: boolean;
  readOnly?: boolean;
};

type TrackFormState = Record<
  string,
  { title: string; description: string; video?: string; document?: string }
>;

export function TrackManagementPanel({
  disciplines,
  onUpdate,
  busy,
  readOnly,
}: TrackManagementPanelProps) {
  const [forms, setForms] = useState<TrackFormState>({});

  const handleAddTrack = async (discipline: DisciplineRecord) => {
    if (readOnly) return;

    const values = forms[discipline.id];
    if (!values?.title) return;

    const newBlock = {
      id: generateId("block"),
      title: values.title,
      description: values.description,
      videos: values.video
        ? [
            {
              id: generateId("vid"),
              title: values.title,
              url: values.video,
            },
          ]
        : [],
      documents: values.document
        ? [
            {
              id: generateId("doc"),
              title: values.title,
              url: values.document,
            },
          ]
        : [],
    };

    await onUpdate(discipline.id, {
      learningBlocks: [...discipline.learningBlocks, newBlock],
    });

    setForms((prev) => ({
      ...prev,
      [discipline.id]: { title: "", description: "", video: "", document: "" },
    }));
  };

  const handleRemoveBlock = async (discipline: DisciplineRecord, blockId: string) => {
    if (readOnly) return;
    await onUpdate(discipline.id, {
      learningBlocks: discipline.learningBlocks.filter((block) => block.id !== blockId),
    });
  };

  return (
    <section className="space-y-4">
      {disciplines.map((discipline) => (
        <article
          key={discipline.id}
          className="rounded-3xl border border-white/5 bg-white/5 p-4 text-white"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Trilha
              </p>
              <h3 className="text-2xl font-semibold">{discipline.name}</h3>
              <p className="text-sm text-slate-300">{discipline.description}</p>
            </div>
            <span className="text-xs text-slate-400">
              {discipline.learningBlocks.length} blocos
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {discipline.learningBlocks.map((block) => (
              <div
                key={block.id}
                className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{block.title}</p>
                    <p className="text-slate-300">{block.description}</p>
                  </div>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBlock(discipline, block.id)}
                      className="text-xs text-rose-300 hover:text-rose-200"
                    >
                      Remover
                    </button>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                  {block.videos.map((video) => (
                    <a
                      key={video.id}
                      href={video.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-white/5 px-3 py-1 text-brand-200 underline"
                    >
                      Vídeo
                    </a>
                  ))}
                  {block.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-white/5 px-3 py-1 text-slate-200 underline"
                    >
                      PDF
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {!readOnly && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleAddTrack(discipline);
              }}
              className="mt-4 grid gap-2 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs text-slate-300"
            >
              <input
                className="w-full rounded-2xl bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                placeholder="Nome do bloco"
                value={forms[discipline.id]?.title ?? ""}
                onChange={(event) =>
                  setForms((prev) => ({
                    ...prev,
                    [discipline.id]: {
                      ...prev[discipline.id],
                      title: event.target.value,
                    },
                  }))
                }
              />
              <textarea
                className="w-full rounded-2xl bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                placeholder="Descrição"
                value={forms[discipline.id]?.description ?? ""}
                onChange={(event) =>
                  setForms((prev) => ({
                    ...prev,
                    [discipline.id]: {
                      ...prev[discipline.id],
                      description: event.target.value,
                    },
                  }))
                }
              />
              <input
                className="w-full rounded-2xl bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                placeholder="Link de vídeo (opcional)"
                value={forms[discipline.id]?.video ?? ""}
                onChange={(event) =>
                  setForms((prev) => ({
                    ...prev,
                    [discipline.id]: {
                      ...prev[discipline.id],
                      video: event.target.value,
                    },
                  }))
                }
              />
              <input
                className="w-full rounded-2xl bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                placeholder="Link de PDF (opcional)"
                value={forms[discipline.id]?.document ?? ""}
                onChange={(event) =>
                  setForms((prev) => ({
                    ...prev,
                    [discipline.id]: {
                      ...prev[discipline.id],
                      document: event.target.value,
                    },
                  }))
                }
              />
              <button
                type="submit"
                disabled={busy}
                className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:opacity-60"
              >
                Adicionar bloco
              </button>
            </form>
          )}
        </article>
      ))}
    </section>
  );
}
