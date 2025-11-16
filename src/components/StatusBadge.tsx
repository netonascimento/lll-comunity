import { clsx } from "clsx";
import { DisciplineStatus } from "@/types/dashboard";

const statusTokens: Record<
  DisciplineStatus,
  { label: string; className: string }
> = {
  ativa: { label: "Ativa", className: "bg-emerald-500/15 text-emerald-300" },
  planejamento: {
    label: "Planejamento",
    className: "bg-amber-500/15 text-amber-200",
  },
  pausada: { label: "Pausada", className: "bg-rose-500/15 text-rose-200" },
};

type StatusBadgeProps = {
  status: DisciplineStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const descriptor = statusTokens[status];
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        descriptor.className
      )}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {descriptor.label}
    </span>
  );
}
