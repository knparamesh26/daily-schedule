import { supabase } from './supabase';
import type { Task, Project, HistoryEntry, AppSettings } from '../types';

async function uid(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
}

// ── Projects ────────────────────────────────────────────────────────────────

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at');
  if (error) throw error;
  return data.map(r => ({ id: r.id, name: r.name, color: r.color, description: r.description }));
}

export async function createProject(data: Omit<Project, 'id'>): Promise<Project> {
  const { data: row, error } = await supabase
    .from('projects')
    .insert({ name: data.name, color: data.color, description: data.description, user_id: await uid() })
    .select()
    .single();
  if (error) throw error;
  return { id: row.id, name: row.name, color: row.color, description: row.description };
}

export async function updateProject(id: string, data: Omit<Project, 'id'>): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({ name: data.name, color: data.color, description: data.description })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
}

// ── Tasks ────────────────────────────────────────────────────────────────────

function rowToTask(r: Record<string, unknown> & { projects?: { name: string } | null }): Task {
  return {
    id: r.id as string,
    name: r.name as string,
    description: r.description as string,
    startDate: r.start_date as string,
    dueDate: r.due_date as string,
    status: r.status as Task['status'],
    priority: r.priority as Task['priority'],
    project: r.projects?.name ?? '',
  };
}

export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, projects(name)')
    .order('created_at');
  if (error) throw error;
  return data.map(rowToTask);
}

export async function createTask(
  data: Omit<Task, 'id'>,
  projectId: string | null,
): Promise<Task> {
  const { data: row, error } = await supabase
    .from('tasks')
    .insert({
      name: data.name,
      description: data.description,
      start_date: data.startDate,
      due_date: data.dueDate,
      status: data.status,
      priority: data.priority,
      project_id: projectId,
      user_id: await uid(),
    })
    .select('*, projects(name)')
    .single();
  if (error) throw error;
  return rowToTask(row);
}

export async function updateTask(
  id: string,
  data: Omit<Task, 'id'>,
  projectId: string | null,
): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({
      name: data.name,
      description: data.description,
      start_date: data.startDate,
      due_date: data.dueDate,
      status: data.status,
      priority: data.priority,
      project_id: projectId,
    })
    .eq('id', id);
  if (error) throw error;
}

export async function updateTaskStatus(id: string, status: Task['status']): Promise<void> {
  const { error } = await supabase.from('tasks').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function updateTaskProject(id: string, projectId: string | null): Promise<void> {
  const { error } = await supabase.from('tasks').update({ project_id: projectId }).eq('id', id);
  if (error) throw error;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

// ── History ──────────────────────────────────────────────────────────────────

export async function fetchHistory(): Promise<HistoryEntry[]> {
  const { data, error } = await supabase
    .from('history')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(200);
  if (error) throw error;
  return data.map(r => ({
    id: r.id,
    taskId: r.task_id,
    taskName: r.task_name,
    action: r.action as HistoryEntry['action'],
    timestamp: new Date(r.timestamp),
  }));
}

export async function addHistoryEntry(
  taskId: string,
  taskName: string,
  action: HistoryEntry['action'],
): Promise<HistoryEntry> {
  const { data, error } = await supabase
    .from('history')
    .insert({ task_id: taskId, task_name: taskName, action, user_id: await uid() })
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    taskId: data.task_id,
    taskName: data.task_name,
    action: data.action as HistoryEntry['action'],
    timestamp: new Date(data.timestamp),
  };
}

// ── Settings ─────────────────────────────────────────────────────────────────

export async function fetchSettings(): Promise<AppSettings> {
  const userId = await uid();
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return { displayName: 'Alex', defaultPriority: 'medium', weekStartsOn: 0, darkMode: false };
  return {
    displayName: data.display_name,
    defaultPriority: data.default_priority,
    weekStartsOn: data.week_starts_on,
    darkMode: data.dark_mode,
  };
}

export async function saveSettings(s: AppSettings): Promise<void> {
  const userId = await uid();
  const { error } = await supabase.from('settings').upsert({
    user_id: userId,
    display_name: s.displayName,
    default_priority: s.defaultPriority,
    week_starts_on: s.weekStartsOn,
    dark_mode: s.darkMode,
  }, { onConflict: 'user_id' });
  if (error) throw error;
}
