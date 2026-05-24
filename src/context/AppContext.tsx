import { createContext, useContext, useEffect, useState } from 'react';
import type { Task, Project, HistoryEntry, AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../types';
import {
  fetchProjects, createProject, updateProject, deleteProject,
  fetchTasks, createTask, updateTask, updateTaskStatus, deleteTask,
  fetchHistory, addHistoryEntry,
  fetchSettings, saveSettings,
  updateTaskProject,
} from '../lib/db';
import { useAuth } from './AuthContext';
import { useNotifications } from '../hooks/useNotifications';

interface AppCtx {
  tasks: Task[];
  projects: Project[];
  history: HistoryEntry[];
  settings: AppSettings;
  loading: boolean;
  appError: string;
  clearError: () => void;
  handleSaveTask: (data: Omit<Task, 'id'>, editingTask?: Task) => Promise<void>;
  handleDeleteTask: (taskId: string) => Promise<void>;
  handleMarkDone: (taskId: string) => Promise<void>;
  handleAssignProject: (taskId: string, projectName: string) => Promise<void>;
  handleSaveProject: (data: Omit<Project, 'id'>, editingProject?: Project) => Promise<void>;
  handleDeleteProject: (projectId: string) => Promise<void>;
  handleSettingsChange: (s: AppSettings) => Promise<void>;
}

const AppContext = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [appError, setAppError] = useState('');

  useEffect(() => {
    if (!session) { setLoading(false); return; }
    setLoading(true);
    Promise.all([fetchProjects(), fetchTasks(), fetchHistory(), fetchSettings()])
      .then(([p, t, h, s]) => { setProjects(p); setTasks(t); setHistory(h); setSettings(s); })
      .catch(err => setAppError(err instanceof Error ? err.message : 'Failed to load data.'))
      .finally(() => setLoading(false));
  }, [session]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, [settings.darkMode]);

  useNotifications(tasks, settings, session?.user.id);

  const handleSaveTask = async (data: Omit<Task, 'id'>, editingTask?: Task) => {
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
    } catch (err) {
      setAppError(err instanceof Error ? err.message : 'Failed to save task.');
      throw err;
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    try {
      await deleteTask(taskId);
      const entry = await addHistoryEntry(task.id, task.name, 'deleted');
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setHistory(prev => [entry, ...prev]);
    } catch (err) {
      setAppError(err instanceof Error ? err.message : 'Failed to delete task.');
      throw err;
    }
  };

  const handleMarkDone = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === 'done') return;
    try {
      await updateTaskStatus(taskId, 'done');
      const entry = await addHistoryEntry(task.id, task.name, 'completed');
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'done' } : t));
      setHistory(prev => [entry, ...prev]);
    } catch (err) {
      setAppError(err instanceof Error ? err.message : 'Failed to update task.');
      throw err;
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
      throw err;
    }
  };

  const handleSaveProject = async (data: Omit<Project, 'id'>, editingProject?: Project) => {
    try {
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
    } catch (err) {
      setAppError(err instanceof Error ? err.message : 'Failed to save project.');
      throw err;
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    try {
      await deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setTasks(prev => prev.filter(t => t.project !== project.name));
    } catch (err) {
      setAppError(err instanceof Error ? err.message : 'Failed to delete project.');
      throw err;
    }
  };

  const handleSettingsChange = async (s: AppSettings) => {
    const enablingNotification =
      (!settings.dueTodayReminders && s.dueTodayReminders) ||
      (!settings.weeklyDigest && s.weeklyDigest);
    if (enablingNotification && 'Notification' in window && Notification.permission === 'default') {
      // Must be called synchronously within the user gesture chain
      Notification.requestPermission();
    }
    const prev = settings;
    setSettings(s);
    try {
      await saveSettings(s);
    } catch (err) {
      setSettings(prev);
      setAppError(err instanceof Error ? err.message : 'Failed to save settings.');
    }
  };

  return (
    <AppContext.Provider value={{
      tasks, projects, history, settings, loading, appError,
      clearError: () => setAppError(''),
      handleSaveTask, handleDeleteTask, handleMarkDone, handleAssignProject,
      handleSaveProject, handleDeleteProject, handleSettingsChange,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppData must be used within AppProvider');
  return ctx;
}
