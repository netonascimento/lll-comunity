import { useState, type JSX } from "react";
import { LearningBlock, LearningResource } from "@/types/dashboard";
import { generateId } from "@/lib/id";
import { Link2, Plus, Trash2, Video } from "lucide-react";

type LearningBlocksEditorProps = {
  value: LearningBlock[];
  onChange: (blocks: LearningBlock[]) => void;
  title?: string;
};

export function LearningBlocksEditor({
  value,
  onChange,
  title = "Blocos de aprendizado",
}: LearningBlocksEditorProps) {
  const handleAddBlock = () => {
    const newBlock: LearningBlock = {
      id: generateId("block"),
      title: `Novo bloco ${value.length + 1}`,
      description: "",
      videos: [],
      documents: [],
    };
    onChange([...value, newBlock]);
  };

  const handleUpdateBlock = (
    blockId: string,
    partial: Partial<LearningBlock>
  ) => {
    onChange(
      value.map((block) =>
        block.id === blockId ? { ...block, ...partial } : block
      )
    );
  };

  const handleRemoveBlock = (blockId: string) => {
    onChange(value.filter((block) => block.id !== blockId));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            {title}
          </p>
          <p className="text-base text-slate-300">
            Organize trilhas com vídeos e PDFs
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddBlock}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
        >
          <Plus className="h-4 w-4" />
          Bloco
        </button>
      </div>

      {value.length === 0 && (
        <p className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-400">
          Nenhum bloco criado ainda. Adicione o primeiro para começar o roteiro.
        </p>
      )}

      <div className="space-y-4">
        {value.map((block) => (
          <BlockEditor
            key={block.id}
            block={block}
            onUpdate={(partial) => handleUpdateBlock(block.id, partial)}
            onRemove={() => handleRemoveBlock(block.id)}
          />
        ))}
      </div>
    </div>
  );
}

type BlockEditorProps = {
  block: LearningBlock;
  onUpdate: (partial: Partial<LearningBlock>) => void;
  onRemove: () => void;
};

function BlockEditor({ block, onUpdate, onRemove }: BlockEditorProps) {
  const [newVideo, setNewVideo] = useState({ title: "", url: "" });
  const [newDoc, setNewDoc] = useState({ title: "", url: "" });

  const appendResource = (
    type: "videos" | "documents",
    resource: LearningResource
  ) => {
    onUpdate({
      [type]: [...block[type], resource],
    });
  };

  const handleAddVideo = () => {
    if (!newVideo.title || !newVideo.url) return;
    appendResource("videos", {
      id: generateId("vid"),
      title: newVideo.title,
      url: newVideo.url,
    });
    setNewVideo({ title: "", url: "" });
  };

  const handleAddDocument = () => {
    if (!newDoc.title || !newDoc.url) return;
    appendResource("documents", {
      id: generateId("doc"),
      title: newDoc.title,
      url: newDoc.url,
    });
    setNewDoc({ title: "", url: "" });
  };

  const removeResource = (type: "videos" | "documents", id: string) => {
    onUpdate({
      [type]: block[type].filter((item) => item.id !== id),
    });
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <input
            className="w-full rounded-xl bg-black/20 px-3 py-2 text-sm font-semibold text-white outline-none focus:ring-2 focus:ring-brand-400"
            value={block.title}
            onChange={(event) =>
              onUpdate({
                title: event.target.value,
              })
            }
            placeholder="Nome do bloco"
          />
          <textarea
            className="min-h-[60px] w-full rounded-xl bg-black/20 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
            value={block.description}
            onChange={(event) =>
              onUpdate({
                description: event.target.value,
              })
            }
            placeholder="Resumo do que será trabalhado…"
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-rose-500/10 hover:text-rose-200"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <ResourceColumn
          icon={<Video className="h-4 w-4" />}
          label="Vídeos"
          items={block.videos}
          onRemove={(id) => removeResource("videos", id)}
        />
        <ResourceColumn
          icon={<Link2 className="h-4 w-4" />}
          label="PDFs / Documentos"
          items={block.documents}
          onRemove={(id) => removeResource("documents", id)}
        />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <ResourceForm
          placeholder="Título do vídeo"
          urlPlaceholder="https://youtube.com/…"
          value={newVideo}
          onChange={setNewVideo}
          onSubmit={handleAddVideo}
          cta="Adicionar vídeo"
        />
        <ResourceForm
          placeholder="Nome do documento"
          urlPlaceholder="https://…pdf"
          value={newDoc}
          onChange={setNewDoc}
          onSubmit={handleAddDocument}
          cta="Adicionar PDF"
        />
      </div>
    </div>
  );
}

type ResourceColumnProps = {
  icon: JSX.Element;
  label: string;
  items: LearningResource[];
  onRemove: (id: string) => void;
};

function ResourceColumn({ icon, label, items, onRemove }: ResourceColumnProps) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/20 p-3 text-sm">
      <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
        {icon}
        {label}
      </p>
      {items.length === 0 && (
        <p className="text-xs text-slate-500">Nenhum link adicionado.</p>
      )}
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs text-slate-100"
          >
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="truncate underline-offset-2 hover:text-brand-200 hover:underline"
            >
              {item.title}
            </a>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="text-slate-400 transition hover:text-rose-300"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

type ResourceFormProps = {
  placeholder: string;
  urlPlaceholder: string;
  value: { title: string; url: string };
  onChange: (value: { title: string; url: string }) => void;
  onSubmit: () => void;
  cta: string;
};

function ResourceForm({
  placeholder,
  urlPlaceholder,
  value,
  onChange,
  onSubmit,
  cta,
}: ResourceFormProps) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-black/10 p-3 text-xs text-slate-400">
      <input
        className="w-full rounded-xl bg-transparent px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
        placeholder={placeholder}
        value={value.title}
        onChange={(event) => onChange({ ...value, title: event.target.value })}
      />
      <input
        className="mt-2 w-full rounded-xl bg-transparent px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-400"
        placeholder={urlPlaceholder}
        value={value.url}
        onChange={(event) => onChange({ ...value, url: event.target.value })}
      />
      <button
        type="button"
        onClick={onSubmit}
        className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"
      >
        {cta}
      </button>
    </div>
  );
}
