import { useCallback, useMemo, useState } from "react";
import { LayoutShell } from "@/components/LayoutShell";
import { CreateDisciplineDialog } from "@/components/CreateDisciplineDialog";
import { HeroSection } from "@/sections/HeroSection";
import { InsightsSection } from "@/sections/InsightsSection";
import { DisciplineGrid } from "@/sections/DisciplineGrid";
import { ActivityTimeline } from "@/sections/ActivityTimeline";
import { useDisciplineDashboard } from "@/hooks/useDisciplineDashboard";
import { useAuth } from "@/hooks/useAuth";
import { LoginPage } from "@/pages/LoginPage";
import { DisciplineViewPage } from "@/pages/DisciplineViewPage";
import { useUserDirectory } from "@/hooks/useUserDirectory";
import { DisciplineRecord } from "@/types/dashboard";
import { useCourseManager } from "@/hooks/useCourseManager";
import { CourseManagementPanel } from "@/sections/CourseManagementPanel";
import { StudentCoursesSection } from "@/sections/StudentCoursesSection";
import { MainMenu } from "@/components/MainMenu";
import { TrackManagementPanel } from "@/sections/TrackManagementPanel";
import { UserRolePanel } from "@/sections/UserRolePanel";
import { AccessManagementPanel } from "@/sections/AccessManagementPanel";

function LoadingPlaceholder() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="h-32 animate-pulse rounded-3xl bg-white/5" />
      ))}
    </div>
  );
}

type SectionKey =
  | "dashboard"
  | "courses"
  | "tracks"
  | "disciplines"
  | "tutors"
  | "students"
  | "access";

export default function App() {
  const [createOpen, setCreateOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionKey>("dashboard");
  const [viewingDiscipline, setViewingDiscipline] = useState<DisciplineRecord | null>(null);
  const {
    user,
    loading: authLoading,
    permissions,
    logout,
    canEditDiscipline,
    canUpdateStatus,
  } = useAuth();
  const { users: directory } = useUserDirectory("readonly", Boolean(user));
  const {
    users: managedUsers,
    loading: managedLoading,
    error: managedError,
    updateRole,
    updateStatus,
    reload,
  } = useUserDirectory("manage", permissions.canManageUsers);
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
  const {
    courses: courseList,
    studentCourses,
    loading: coursesLoading,
    error: coursesError,
    updating: coursesUpdating,
    createCourse,
    createTurma,
    deleteCourse,
  } = useCourseManager(data.disciplines, user?.id);

  const ownerNameMap = useMemo(() => {
    const map = new Map<string, string>();
    directory.forEach((profile) => map.set(profile.id, profile.name));
    return map;
  }, [directory]);

  const resolveOwnerName = useCallback(
    (id: string) => {
      if (!id) return undefined;
      if (user && user.id === id) return "você";
      return ownerNameMap.get(id);
    },
    [ownerNameMap, user]
  );

  const getCardPermissions = useCallback(
    (discipline: DisciplineRecord) => ({
      canEdit: canEditDiscipline(discipline),
      canUpdateStatus: canUpdateStatus(discipline),
      canAssignTutor: permissions.canAssignTutor,
    }),
    [canEditDiscipline, canUpdateStatus, permissions.canAssignTutor]
  );

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Carregando...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  // Se estiver visualizando uma disciplina, mostra a página de visualização
  if (viewingDiscipline) {
    return (
      <DisciplineViewPage
        discipline={viewingDiscipline}
        onBack={() => setViewingDiscipline(null)}
      />
    );
  }

  const handleLogout = async () => {
    console.log("handleLogout chamado");
    // Reset all local state before logout to prevent data leakage between users
    setCreateOpen(false);
    setActiveSection("dashboard");
    setFilters({ search: "", status: "todas" });
    console.log("Chamando função logout...");
    await logout();
    console.log("Logout finalizado");
  };

  const canCreate = permissions.canCreateDiscipline;
  const menuItems: { key: SectionKey; label: string; disabled?: boolean }[] = [
    { key: "dashboard", label: "Visão geral" },
    { key: "courses", label: "Cursos" },
    { key: "disciplines", label: "Disciplinas" },
    { key: "tutors", label: "Tutores", disabled: !permissions.canManageUsers },
    { key: "students", label: "Alunos", disabled: !permissions.canManageUsers },
    { key: "access", label: "Gestão de Acesso", disabled: user.role !== "master" },
  ];

  return (
    <LayoutShell>
      <div className="flex flex-col justify-between gap-2 rounded-3xl border border-white/5 bg-black/20 px-4 py-3 text-sm text-white sm:flex-row sm:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-brand-200">
            Usuário autenticado
          </p>
          <p className="text-base font-semibold">
            {user.name} · {user.role}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-white/10"
        >
          Sair
        </button>
      </div>

      <MainMenu
        items={menuItems}
        activeKey={activeSection}
        onSelect={(key) => setActiveSection(key)}
      />

      {activeSection === "dashboard" && (
        <>
          <HeroSection
            summary={data.summary}
            filters={filters}
            onFiltersChange={(payload) => setFilters((prev) => ({ ...prev, ...payload }))}
            onRefresh={refresh}
            onNewDiscipline={() => canCreate && setCreateOpen(true)}
            canCreateDiscipline={canCreate}
            createDisabledReason={
              canCreate ? undefined : "Seu papel atual não permite abrir novas disciplinas."
            }
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
              getCardPermissions={getCardPermissions}
              resolveOwnerName={resolveOwnerName}
              onViewDiscipline={(discipline) => setViewingDiscipline(discipline)}
            />
          )}

          <ActivityTimeline events={data.timeline} />
        </>
      )}

      {activeSection === "courses" && (
        <>
          {user.role === "aluno" ? (
            <StudentCoursesSection courses={studentCourses} />
          ) : (
            <CourseManagementPanel
              disciplines={data.disciplines}
              courses={courseList}
              onCreateCourse={createCourse}
              onCreateTurma={createTurma}
              onDeleteCourse={deleteCourse}
              currentUserId={user.id}
              loading={coursesLoading}
              error={coursesError}
              updating={coursesUpdating}
            />
          )}
        </>
      )}

      {activeSection === "tracks" && (
        <TrackManagementPanel
          disciplines={data.disciplines}
          onUpdate={updateDiscipline}
          busy={updating}
          readOnly={user.role === "aluno"}
        />
      )}

      {activeSection === "disciplines" && (
        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-brand-200">Disciplinas</p>
              <h2 className="text-2xl font-semibold text-white">
                Biblioteca de disciplinas
              </h2>
              <p className="text-sm text-slate-300">
                Gerencie conteúdos, tutores e materiais em todas as trilhas.
              </p>
            </div>
            {canCreate && (
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-400"
              >
                Nova disciplina
              </button>
            )}
          </div>

          {loading ? (
            <LoadingPlaceholder />
          ) : (
            <DisciplineGrid
              disciplines={filteredDisciplines}
              busy={updating}
              onUpdate={updateDiscipline}
              onRegisterAction={registerAction}
              onAssignTutor={assignTutor}
              getCardPermissions={getCardPermissions}
              resolveOwnerName={resolveOwnerName}
              onViewDiscipline={(discipline: DisciplineRecord) => setViewingDiscipline(discipline)}
            />
          )}
        </section>
      )}

      {activeSection === "tutors" && permissions.canManageUsers && (
        <UserRolePanel
          title="Equipe"
          role="tutor"
          users={managedUsers}
          loading={managedLoading}
          error={managedError}
          onRefresh={reload}
          onUpdateRole={updateRole}
          onUpdateStatus={updateStatus}
          canManage={permissions.canManageUsers}
        />
      )}

      {activeSection === "students" && permissions.canManageUsers && (
        <UserRolePanel
          title="Alunos"
          role="aluno"
          users={managedUsers}
          loading={managedLoading}
          error={managedError}
          onRefresh={reload}
          onUpdateRole={updateRole}
          onUpdateStatus={updateStatus}
          canManage={permissions.canManageUsers}
        />
      )}

      {activeSection === "access" && user.role === "master" && (
        <AccessManagementPanel currentUserRole={user.role} />
      )}

      <CreateDisciplineDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={createDiscipline}
        busy={updating}
        currentUserId={user.id}
      />
    </LayoutShell>
  );
}
