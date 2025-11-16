import { FormEvent, useMemo, useState } from "react";
import { LearningBlocksEditor } from "@/components/LearningBlocksEditor";
import { LearningBlock } from "@/types/dashboard";
import { generateId } from "@/lib/id";
import { CreateDisciplinePayload } from "@/hooks/useDisciplineDashboard";
import { X } from "lucide-react";

type CreateDisciplineDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateDisciplinePayload) => Promise<void> | void;
  busy?: boolean;
};

const makeDefaultBlock = (): LearningBlock => ({
  id: generateId("block"),
  title: "Introdução",
  description: "Escreva um panorama rápido do primeiro encontro.",
  videos: [],
  documents: [],
});

const todayIso = () => new Date().toISOString().slice(0, 10);

export function CreateDisciplineDialog({
  open,
  onClose,
  onSubmit,
  busy,
}: CreateDisciplineDialogProps) {
  const [formState, setFormState] = useState({
    name: "",
    code: "",
    level: "",
    status: "planejamento" as CreateDisciplinePayload["status"],
    description: "",
    ementa: "",
    tags: "",
    nextReviewAt: todayIso(),
    coverUrl: "",
  });
  const [blocks, setBlocks] = useState<LearningBlock[]>(() => [makeDefaultBlock()]);

  const isValid = useMemo(
    () =>
      formState.name.trim().length > 3 &&
      formState.code.trim().length > 2 &&
      formState.description.trim().length > 10 &&
      formState.ementa.trim().length > 10 &&
      blocks.length > 0,
    [formState, blocks]
  );

  const resetForm = () => {
    setFormState({
      name: "",
      code: "",
      level: "",
      status: "planejamento",
      description: "",
      ementa: "",
      tags: "",
      nextReviewAt: todayIso(),
      coverUrl: "",
    });
    setBlocks([makeDefaultBlock()]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) return;

    const payload: CreateDisciplinePayload = {
      name: formState.name.trim(),
      code: formState.code.trim(),
      level: formState.level.trim(),
      status: formState.status,
      description: formState.description.trim(),
      ementa: formState.ementa.trim(),
      tags: formState.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      nextReviewAt: formState.nextReviewAt,
      learningBlocks: blocks,
      coverUrl: formState.coverUrl.trim() || undefined,
    };

    try {
      await onSubmit(payload);
      resetForm();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/70 px-4 py-8 backdrop-blur">
      <div className="glass-panel relative w-full max-w-3xl rounded-3xl p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-200">
              Nova disciplina
            </p>
            <h2 className="mt-1 font-display text-3xl text-white">
              Estruture e publique trilhas completas
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-xs text-slate-400">
              Nome
              <input
                className="mt-1 w-full rounded-2xl bg-black/20 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                value={formState.name}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, name: event.target.value }))
                }
                required
              />
            </label>
            <label className="text-xs text-slate-400">
              Código
              <input
                className="mt-1 w-full rounded-2xl bg-black/20 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                value={formState.code}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, code: event.target.value }))
                }
                required
              />
            </label>
            <label className="text-xs text-slate-400">
              Nível
              <input
                className="mt-1 w-full rounded-2xl bg-black/20 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                value={formState.level}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, level: event.target.value }))
                }
              />
            </label>
            <label className="text-xs text-slate-400">
              Status inicial
              <select
                className="mt-1 w-full rounded-2xl bg-black/20 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                value={formState.status}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    status: event.target.value as CreateDisciplinePayload["status"],
                  }))
                }
              >
                <option value="planejamento">Planejamento</option>
                <option value="ativa">Ativa</option>
                <option value="pausada">Pausada</option>
              </select>
            </label>
          </div>

          <label className="text-xs text-slate-400">
            Descrição curta
            <textarea
              className="mt-1 min-h-[80px] w-full rounded-2xl bg-black/20 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
              value={formState.description}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
            />
          </label>

          <label className="text-xs text-slate-400">
            Ementa detalhada
            <textarea
              className="mt-1 min-h-[120px] w-full rounded-2xl bg-black/20 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
              value={formState.ementa}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  ementa: event.target.value,
                }))
              }
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-xs text-slate-400">
              Tags
              <input
                className="mt-1 w-full rounded-2xl bg-black/20 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                placeholder="IA, Mentorias, STEAM"
                value={formState.tags}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, tags: event.target.value }))
                }
              />
            </label>
            <label className="text-xs text-slate-400">
              Próxima revisão
              <input
                type="date"
                className="mt-1 w-full rounded-2xl bg-black/20 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
                value={formState.nextReviewAt}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    nextReviewAt: event.target.value,
                  }))
                }
              />
            </label>
          </div>

          <label className="text-xs text-slate-400">
            Imagem de capa (opcional)
            <input
              className="mt-1 w-full rounded-2xl bg-black/20 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="https://…"
              value={formState.coverUrl}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  coverUrl: event.target.value,
                }))
              }
            />
          </label>

          <LearningBlocksEditor
            value={blocks}
            onChange={setBlocks}
            title="Blocos da nova disciplina"
          />

          <div className="flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Cada bloco aceita múltiplos vídeos e PDFs. Você pode editar depois.
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!isValid || busy}
                className="inline-flex items-center justify-center rounded-2xl bg-brand-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:opacity-50"
              >
                Criar disciplina
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
