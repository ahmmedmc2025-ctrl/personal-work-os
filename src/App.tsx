import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useWorkOSData } from './hooks/useWorkOSData';
import { ViewMode } from './types';

// Layout
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { Header } from './components/layout/Header';
import { AuthScreen } from './components/auth/AuthScreen';

// Modals
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { QuickAddModal } from './components/modals/QuickAddModal';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { TasksView } from './components/tasks/TasksView';
import { ProjectsView } from './components/projects/ProjectsView';
import { CalendarView } from './components/calendar/CalendarView';
import { IdeasView } from './components/ideas/IdeasView';
import { InboxView } from './components/inbox/InboxView';
import { NotesView } from './components/notes/NotesView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { ArchiveView } from './components/archive/ArchiveView';
import { SettingsView } from './components/settings/SettingsView';

function AuthenticatedWorkspace() {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Main Data Hook (Executes ONLY when user is authenticated)
  const {
    projects,
    tasks,
    subtasks,
    ideas,
    inboxItems,
    notes,
    activityLogs,
    loading: dataLoading,
    syncStatus,
    toastMessage,
    // Operations
    createProject,
    updateProject,
    deleteProject,
    archiveProject,
    createTask,
    updateTask,
    toggleTaskComplete,
    moveTaskStatus,
    deleteTask,
    createSubtask,
    toggleSubtask,
    deleteSubtask,
    createIdea,
    updateIdea,
    deleteIdea,
    convertIdeaToProject,
    convertIdeaToTask,
    createInboxItem,
    deleteInboxItem,
    convertInboxToTask,
    convertInboxToIdea,
    convertInboxToProject,
    createNote,
    updateNote,
    deleteNote,
    exportDataAsJSON,
    importDataFromJSON,
    seedDataReset,
    refreshData,
  } = useWorkOSData();

  if (dataLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark text-gray-500 space-y-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold uppercase tracking-wider">Syncing Workspace Data...</p>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(t => t.due_date && t.due_date < todayStr && t.status !== 'done');
  const dueTodayTasks = tasks.filter(t => t.due_date === todayStr && t.status !== 'done');
  const upcomingProjects = projects.filter(p => p.deadline && p.deadline >= todayStr && p.status === 'active');

  return (
    <div className="min-h-screen flex bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 selection:bg-primary selection:text-white">
      {/* DESKTOP SIDEBAR */}
      <Sidebar
        currentView={currentView}
        onNavigate={view => setCurrentView(view)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        inboxCount={inboxItems.length}
        todayCount={dueTodayTasks.length}
      />

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* MOBILE NAVIGATION */}
        <MobileNav
          currentView={currentView}
          onNavigate={view => setCurrentView(view)}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          inboxCount={inboxItems.length}
          todayCount={dueTodayTasks.length}
        />

        {/* HEADER */}
        <Header
          currentView={currentView}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          syncStatus={syncStatus}
          onRefreshData={refreshData}
          overdueTasks={overdueTasks}
          dueTodayTasks={dueTodayTasks}
          upcomingProjects={upcomingProjects}
          onNavigate={view => setCurrentView(view)}
        />

        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              projects={projects}
              tasks={tasks}
              ideas={ideas}
              activityLogs={activityLogs}
              onNavigate={view => setCurrentView(view)}
              onToggleTaskComplete={toggleTaskComplete}
              onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            />
          )}

          {currentView === 'tasks' && (
            <TasksView
              tasks={tasks}
              projects={projects}
              subtasks={subtasks}
              onCreateTask={createTask}
              onUpdateTask={updateTask}
              onToggleTaskComplete={toggleTaskComplete}
              onMoveTaskStatus={moveTaskStatus}
              onDeleteTask={deleteTask}
              onCreateSubtask={createSubtask}
              onToggleSubtask={toggleSubtask}
              onDeleteSubtask={deleteSubtask}
            />
          )}

          {currentView === 'projects' && (
            <ProjectsView
              projects={projects}
              tasks={tasks}
              notes={notes}
              activityLogs={activityLogs}
              onCreateProject={createProject}
              onUpdateProject={updateProject}
              onDeleteProject={deleteProject}
              onArchiveProject={archiveProject}
              onCreateTask={createTask}
              onToggleTaskComplete={toggleTaskComplete}
              onCreateNote={createNote}
            />
          )}

          {currentView === 'calendar' && (
            <CalendarView
              tasks={tasks}
              projects={projects}
              onCreateTask={createTask}
            />
          )}

          {currentView === 'ideas' && (
            <IdeasView
              ideas={ideas}
              projects={projects}
              onCreateIdea={createIdea}
              onUpdateIdea={updateIdea}
              onDeleteIdea={deleteIdea}
              onConvertIdeaToProject={convertIdeaToProject}
              onConvertIdeaToTask={convertIdeaToTask}
            />
          )}

          {currentView === 'inbox' && (
            <InboxView
              inboxItems={inboxItems}
              projects={projects}
              onCreateInboxItem={createInboxItem}
              onDeleteInboxItem={deleteInboxItem}
              onConvertInboxToTask={convertInboxToTask}
              onConvertInboxToIdea={convertInboxToIdea}
              onConvertInboxToProject={convertInboxToProject}
            />
          )}

          {currentView === 'notes' && (
            <NotesView
              notes={notes}
              projects={projects}
              onCreateNote={createNote}
              onUpdateNote={updateNote}
              onDeleteNote={deleteNote}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView
              tasks={tasks}
              projects={projects}
            />
          )}

          {currentView === 'archive' && (
            <ArchiveView
              projects={projects}
              tasks={tasks}
              ideas={ideas}
              notes={notes}
              onUpdateProject={updateProject}
              onDeleteProject={deleteProject}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onUpdateIdea={updateIdea}
              onDeleteIdea={deleteIdea}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              onExportJSON={exportDataAsJSON}
              onImportJSON={importDataFromJSON}
              onSeedReset={seedDataReset}
            />
          )}
        </main>
      </div>

      {/* GLOBAL MODALS */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        projects={projects}
        tasks={tasks}
        ideas={ideas}
        notes={notes}
        onNavigate={view => setCurrentView(view)}
      />

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        projects={projects}
        onCreateTask={createTask}
        onCreateProject={createProject}
        onCreateIdea={createIdea}
        onCreateNote={createNote}
      />

      {/* TOAST MESSAGES */}
      {toastMessage && (
        <div
          className={`fixed bottom-20 md:bottom-6 right-6 px-4 py-3 rounded-xl shadow-elevated z-50 text-xs font-bold border flex items-center space-x-2 transition-all animate-bounce ${
            toastMessage.type === 'error'
              ? 'bg-red-500 text-white border-red-600'
              : toastMessage.type === 'info'
              ? 'bg-blue-600 text-white border-blue-700'
              : 'bg-emerald-600 text-white border-emerald-700'
          }`}
        >
          <span>{toastMessage.message}</span>
        </div>
      )}
    </div>
  );
}

export function AppContent() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark text-gray-500 space-y-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold uppercase tracking-wider">Loading Personal Work OS...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <AuthenticatedWorkspace />;
}
