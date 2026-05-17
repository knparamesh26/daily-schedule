import { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Task, View, HistoryEntry, AppSettings, Project } from './types';
import { DEFAULT_SETTINGS } from './types';
import { supabase } from './lib/supabase';
import {
  fetchProjects, createProject, updateProject, deleteProject,
  fetchTasks, createTask, updateTask, updateTaskStatus, deleteTask,
  fetchHistory, addHistoryEntry,
  fetchSettings, saveSettings,
  updateTaskProject,
} from './lib/db';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Auth from './views/Auth';
import Dashboard from './views/Dashboard';
import TaskForm from './views/TaskForm';
import TaskDetail from './views/TaskDetail';
import Calendar from './views/Calendar';
import History from './views/History';
import Settings from './views/Settings';
import Projects from './views/Projects';
import ProjectDetail from './views/ProjectDetail';
import NewProjectModal from './components/NewProjectModal';
import Tasks from './views/Tasks';

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [appError, setAppError] = useState('');

  const [view, setView] = useState<View>('dashboard');
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [search, setSearch] = useState('');

  // Auth session management
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load all data once authenticated
  useEffect(() => {
    if (!session) return;
    setLoading(true);
    Promise.all([fetchProjects(), fetchTasks(), fetchHistory(), fetchSettings()])
      .then(([p, t, h, s]) => {
        setProjects(p);
        setTasks(t);
        setHistory(h);
        setSettings(s);
      })
      .catch(err => setAppError(err instanceof Error ? err.message : 'Failed to load data.'))
      .finally(() => setLoading(false));
  }, [session]);

  // Sync dark mode to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, [settings.darkMode]);

  const selectedTask    = tasks.find(t => t.id === selectedTaskId);
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // ── Task handlers ──────────────────────────────────────────────────────────

  const handleSave = async (data: Omit<Task, 'id'>) => {
    try {
      const projectId = projects.find(p => p.name === data.project)?.id ?? null;
      if (editingTask) {
        await updateTask(editingTask.id, data, projectId);
        const action: HistoryEntry['action'] =
          data.status === 'done' && editingTask.status !== 'done' ? 'completed' : 'updated';
        const entry = await addHistoryEntry(editingTask.id, data.name, action);
        setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...data, id: t.id } : t));
        setHistory(prev => [entry, ...prev]);
      } else {
        const newTask = await createTask(data, projectId);
        const entry = await addHistoryEntry(newTask.id, data.name, 'created');
        setTasks(prev => [...prev, newTask]);
        setHistory(prev => [entry, ...prev]);
      }
      setEditingTask(undefined);
      setView(selectedProjectId ? 'project-detail' : 'dashboard');
    } catch (err) {
      setAppError(err instanceof Error ? err.message : 'Failed to save task.');
    }
  };

  const handleEdit     = (task: Task) => { setEditingTask(task); setView('edit-task'); };
  const handleViewTask = (id: string) => { setSelectedTaskId(id); setView('task-detail'); };

  const handleMarkDone = async () => {
    if (!selectedTaskId) return;
    const task = tasks.find(t => t.id === selectedTaskId);
    if (!task || task.status === 'done') return;
    try {
      await updateTaskStatus(selectedTaskId, 'done');
      const entry = await addHistoryEntry(task.id, task.name, 'completed');
      setTasks(prev => prev.map(t => t.id === selectedTaskId ? { ...t, status: 'done' } : t));
      setHistory(prev => [entry, ...prev]);
    } catch (err) {
      setAppError(err instanceof Error ? err.message : 'Failed to update task.');
    }
  };

  const handleAssignProject = async (taskId: string, projectName: string) => {
    try {
      const projectId = projects.find(p => p.name === projectName)?.id ?? null;
      await updateTaskProject(taskId, projectId);
      const entry = await addHistoryEntry(taskId, tasks.find(t => t.id === taskId)?.name ?? '', 'updated');
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, project: projectName } : t));
      setHistory(prev => [entry, ...prev]);
    } catch (err) {
      setAppError(err instanceof Error ? err.message : 'Failed to assign project.');
    }
  };

  const handleMoveToProject = async (projectName: string) => {
    if (!selectedTaskId) return;
    await handleAssignProject(selectedTaskId, projectName);
  };

  const handleDelete = async () => {
    if (!selectedTaskId) return;
    const task = tasks.find(t => t.id === selectedTaskId);
    if (!task) return;
    try {
      await deleteTask(selectedTaskId);
      const entry = await addHistoryEntry(task.id, task.name, 'deleted');
      setTasks(prev => prev.filter(t => t.id !== selectedTaskId));
      setHistory(prev => [entry, ...prev]);
      setView(selectedProjectId ? 'project-detail' : 'dashboard');
    } catch (err) {
      setAppError(err instanceof Error ? err.message : 'Failed to delete task.');
    }
  };

  // ── Project handlers ───────────────────────────────────────────────────────

  const handleSaveProject = async (data: Omit<Project, 'id'>) => {
    if (editingProject) {
      await updateProject(editingProject.id, data);
      setProjects(prev => prev.map(p => p.id === editingProject.id ? { ...data, id: p.id } : p));
      if (data.name !== editingProject.name) {
        setTasks(prev => prev.map(t =>
          t.project === editingProject.name ? { ...t, project: data.name } : t
        ));
      }
    } else {
      const newProject = await createProject(data);
      setProjects(prev => [...prev, newProject]);
    }
    setEditingProject(undefined);
    setShowProjectModal(false);
  };

  const handleDeleteProject = async () => {
    if (!selectedProjectId || !selectedProject) return;
    try {
      await deleteProject(selectedProjectId);
      setProjects(prev => prev.filter(p => p.id !== selectedProjectId));
      setTasks(prev => prev.filter(t => t.project !== selectedProject.name));
      setSelectedProjectId(null);
      setView('projects');
    } catch (err) {
      setAppError(err instanceof Error ? err.message : 'Failed to delete project.');
    }
  };

  const handleDeleteProjectById = async (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      setTasks(prev => prev.filter(t => t.project !== project.name));
    } catch (err) {
      setAppError(err instanceof Error ? err.message : 'Failed to delete project.');
    }
  };

  const openNewProject  = () => { setEditingProject(undefined); setShowProjectModal(true); };
  const openEditProject = () => { setEditingProject(selectedProject); setShowProjectModal(true); };
  const navigate = useCallback((v: View) => { setEditingTask(undefined); setView(v); }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      setAppError(err instanceof Error ? err.message : 'Failed to sign out.');
    }
  };

  const handleSettingsChange = async (s: AppSettings) => {
    const prev = settings;
    setSettings(s);
    try {
      await saveSettings(s);
    } catch (err) {
      setSettings(prev);
      setAppError(err instanceof Error ? err.message : 'Failed to save settings.');
    }
  };

  // Sidebar active-state: map child views back to their parent nav item
  const sidebarView: View =
    view === 'add-task' || view === 'edit-task' ? 'tasks' :
    view === 'task-detail' || view === 'project-detail' ? 'projects' :
    view;

  const spinner = (
    <div className="bg-background min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-md text-on-surface-variant">
        <span className="material-symbols-outlined text-[48px] animate-spin" style={{ animationDuration: '1s' }}>
          autorenew
        </span>
        <p className="text-body-md">Loading TaskStream…</p>
      </div>
    </div>
  );

  if (session === undefined) return spinner;
  if (!session) return <Auth />;
  if (loading) return spinner;

  return (
    <div className="bg-background text-on-surface min-h-screen flex font-sans">
      <Sidebar
        currentView={sidebarView}
        onNavigate={navigate}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onOpenProject={id => { setSelectedProjectId(id); setView('project-detail'); }}
        onNewProject={openNewProject}
      />

      <main className="flex-1 ml-[260px] flex flex-col min-h-screen">
        <TopBar
          search={search}
          onSearch={setSearch}
          onAddTask={() => { setEditingTask(undefined); setView('add-task'); }}
          showAddButton={view === 'dashboard' || view === 'tasks'}
          displayName={settings.displayName}
          userEmail={session.user.email}
          onSettings={() => navigate('settings')}
          onSignOut={handleSignOut}
        />

        {/* Global error banner */}
        {appError && (
          <div className="flex items-center justify-between gap-md px-xl py-sm bg-error-container text-on-error-container text-label-sm">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {appError}
            </div>
            <button onClick={() => setAppError('')} aria-label="Dismiss error" className="hover:opacity-70 transition-opacity">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        <div className="flex-1">
          {view === 'dashboard' && (
            <Dashboard tasks={tasks} history={history} onViewTask={handleViewTask}
              onAddTask={() => { setEditingTask(undefined); setView('add-task'); }}
              displayName={settings.displayName} />
          )}
          {view === 'tasks' && (
            <Tasks tasks={tasks} projects={projects} onViewTask={handleViewTask} onAssignProject={handleAssignProject} />
          )}
          {view === 'calendar' && (
            <Calendar tasks={tasks} onViewTask={handleViewTask}
              onAddTask={() => { setEditingTask(undefined); setView('add-task'); }}
              weekStartsOn={settings.weekStartsOn} />
          )}
          {view === 'projects' && (
            <Projects
              projects={projects}
              tasks={tasks}
              onOpenProject={id => { setSelectedProjectId(id); setView('project-detail'); }}
              onNewProject={openNewProject}
              onDeleteProject={handleDeleteProjectById}
            />
          )}
          {view === 'project-detail' && selectedProject && (
            <ProjectDetail
              project={selectedProject}
              tasks={tasks}
              onBack={() => { setSelectedProjectId(null); setView('projects'); }}
              onViewTask={handleViewTask}
              onAddTask={() => { setEditingTask(undefined); setView('add-task'); }}
              onEditProject={openEditProject}
              onDeleteProject={handleDeleteProject}
            />
          )}
          {(view === 'add-task' || view === 'edit-task') && (
            <TaskForm
              task={editingTask}
              defaultPriority={settings.defaultPriority}
              projects={projects}
              onSave={handleSave}
              onCancel={() => setView(selectedProjectId ? 'project-detail' : 'dashboard')}
            />
          )}
          {view === 'task-detail' && selectedTask && (
            <TaskDetail task={selectedTask} projects={projects} onEdit={() => handleEdit(selectedTask)}
              onBack={() => setView(selectedProjectId ? 'project-detail' : 'dashboard')}
              onMarkDone={handleMarkDone} onDelete={handleDelete} onMoveToProject={handleMoveToProject} />
          )}
          {view === 'history' && <History history={history} onViewTask={handleViewTask} />}
          {view === 'settings' && (
            <Settings
              settings={settings}
              onChange={handleSettingsChange}
              userEmail={session.user.email}
              onSignOut={handleSignOut}
            />
          )}
        </div>
      </main>

      {showProjectModal && (
        <NewProjectModal
          project={editingProject}
          onSave={handleSaveProject}
          onClose={() => { setShowProjectModal(false); setEditingProject(undefined); }}
        />
      )}
    </div>
  );
}
