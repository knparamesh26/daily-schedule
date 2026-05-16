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

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

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
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session]);

  // Sync dark mode to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, [settings.darkMode]);

  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // ── Task handlers ──────────────────────────────────────────────────────────

  const handleSave = async (data: Omit<Task, 'id'>) => {
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
  };

  const handleEdit = (task: Task) => { setEditingTask(task); setView('edit-task'); };
  const handleViewTask = (id: string) => { setSelectedTaskId(id); setView('task-detail'); };

  const handleMarkDone = async () => {
    if (!selectedTaskId) return;
    const task = tasks.find(t => t.id === selectedTaskId);
    if (!task || task.status === 'done') return;
    await updateTaskStatus(selectedTaskId, 'done');
    const entry = await addHistoryEntry(task.id, task.name, 'completed');
    setTasks(prev => prev.map(t => t.id === selectedTaskId ? { ...t, status: 'done' } : t));
    setHistory(prev => [entry, ...prev]);
  };

  const handleMoveToProject = async (projectName: string) => {
    if (!selectedTaskId) return;
    const projectId = projects.find(p => p.name === projectName)?.id ?? null;
    await updateTaskProject(selectedTaskId, projectId);
    const entry = await addHistoryEntry(selectedTaskId, tasks.find(t => t.id === selectedTaskId)?.name ?? '', 'updated');
    setTasks(prev => prev.map(t => t.id === selectedTaskId ? { ...t, project: projectName } : t));
    setHistory(prev => [entry, ...prev]);
  };

  const handleDelete = async () => {
    if (!selectedTaskId) return;
    const task = tasks.find(t => t.id === selectedTaskId);
    if (!task) return;
    await deleteTask(selectedTaskId);
    const entry = await addHistoryEntry(task.id, task.name, 'deleted');
    setTasks(prev => prev.filter(t => t.id !== selectedTaskId));
    setHistory(prev => [entry, ...prev]);
    setView(selectedProjectId ? 'project-detail' : 'dashboard');
  };

  // ── Project handlers ───────────────────────────────────────────────────────

  const handleSaveProject = async (data: Omit<Project, 'id'>) => {
    if (editingProject) {
      await updateProject(editingProject.id, data);
      setProjects(prev => prev.map(p => p.id === editingProject.id ? { ...data, id: p.id } : p));
      // If project name changed, update local task state (project_id FK handles DB side)
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
    await deleteProject(selectedProjectId); // tasks cascade to null via FK, then we clean up
    setProjects(prev => prev.filter(p => p.id !== selectedProjectId));
    setTasks(prev => prev.filter(t => t.project !== selectedProject.name));
    setSelectedProjectId(null);
    setView('projects');
  };

  const openNewProject = () => { setEditingProject(undefined); setShowProjectModal(true); };
  const openEditProject = () => { setEditingProject(selectedProject); setShowProjectModal(true); };

  const navigate = useCallback((v: View) => { setEditingTask(undefined); setView(v); }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSettingsChange = async (s: AppSettings) => {
    setSettings(s);
    await saveSettings(s).catch(console.error);
  };

  const activeView: View =
    view === 'edit-task' || view === 'add-task' ? view :
    view === 'task-detail' ? (selectedProjectId ? 'project-detail' : 'dashboard') :
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
        currentView={activeView}
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
          showAddButton={view === 'dashboard'}
          displayName={settings.displayName}
          userEmail={session.user.email}
          onSettings={() => navigate('settings')}
          onSignOut={handleSignOut}
        />

        <div className="flex-1">
          {view === 'dashboard' && (
            <Dashboard tasks={tasks} projects={projects} search={search} onViewTask={handleViewTask}
              onAddTask={() => { setEditingTask(undefined); setView('add-task'); }}
              displayName={settings.displayName} />
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
