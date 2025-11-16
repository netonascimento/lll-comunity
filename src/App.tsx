import { useState } from "react";
import { LayoutShell } from "@/components/LayoutShell";
import { CreateDisciplineDialog } from "@/components/CreateDisciplineDialog";
import { HeroSection } from "@/sections/HeroSection";
import { InsightsSection } from "@/sections/InsightsSection";
import { DisciplineGrid } from "@/sections/DisciplineGrid";
import { ActivityTimeline } from "@/sections/ActivityTimeline";
import { useDisciplineDashboard } from "@/hooks/useDisciplineDashboard";

function LoadingPlaceholder() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="h-32 animate-pulse rounded-3xl bg-white/5"
        />
      ))}
    </div>
  );
}

export default function App() {
  const [createOpen, setCreateOpen] = useState(false);
  const {
    data,
    filteredDisciplines,
    filters,
    setFilters,
    loading,
    error,
    refresh,
    updateDiscipline,
    registerAction,
    assignTutor,
    updating,
    createDiscipline,
  } = useDisciplineDashboard();

  return (
    <LayoutShell>
      <HeroSection
        summary={data.summary}
        filters={filters}
        onFiltersChange={(payload) => setFilters((prev) => ({ ...prev, ...payload }))}
        onRefresh={refresh}
        onNewDiscipline={() => setCreateOpen(true)}
        loading={loading}
        updating={updating}
      />

      <InsightsSection disciplines={data.disciplines} />

      {error && (
        <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingPlaceholder />
      ) : (
        <DisciplineGrid
          disciplines={filteredDisciplines}
          busy={updating}
          onUpdate={updateDiscipline}
          onRegisterAction={registerAction}
          onAssignTutor={assignTutor}
        />
      )}

      <ActivityTimeline events={data.timeline} />

      <CreateDisciplineDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={createDiscipline}
        busy={updating}
      />
    </LayoutShell>
  );
}
