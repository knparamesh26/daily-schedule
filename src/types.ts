export type Status = 'todo' | 'in_progress' | 'done';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type View =
  | 'dashboard' | 'calendar' | 'tasks' | 'projects' | 'project-detail'
  | 'add-task' | 'edit-task' | 'task-detail'
  | 'history' | 'settings';
export type HistoryAction = 'created' | 'updated' | 'completed' | 'deleted';

export interface Task {
  id: string;
  name: string;
  description: string;
  startDate: string;
  dueDate: string;
  status: Status;
  priority: Priority;
  project: string; // project name
}

export interface Project {
  id: string;
  name: string;
  color: string;
  description: string;
}

export interface HistoryEntry {
  id: string;
  taskId: string;
  taskName: string;
  action: HistoryAction;
  timestamp: Date;
}

export interface AppSettings {
  displayName: string;
  defaultPriority: Priority;
  weekStartsOn: 0 | 1;
  darkMode: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  displayName: 'Alex',
  defaultPriority: 'medium',
  weekStartsOn: 0,
  darkMode: false,
};

export const PROJECT_COLORS = [
  '#4648d4', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316', '#ec4899',
  '#6b7280', '#1c1b1b',
];

export const STATUS_LABELS: Record<Status, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const STATUS_ORDER: Status[] = ['todo', 'in_progress', 'done'];
export const PRIORITY_ORDER: Priority[] = ['critical', 'high', 'medium', 'low'];

export const PRIORITY_STYLES: Record<Priority, { bg: string; text: string }> = {
  critical: { bg: 'bg-error/10', text: 'text-error' },
  high:     { bg: 'bg-error/10', text: 'text-error' },
  medium:   { bg: 'bg-secondary/10', text: 'text-secondary' },
  low:      { bg: 'bg-outline-variant/30', text: 'text-on-surface-variant' },
};

export const STATUS_DOT: Record<Status, string> = {
  todo: 'bg-outline',
  in_progress: 'bg-secondary',
  done: 'bg-green-500',
};

export const HISTORY_META: Record<HistoryAction, { icon: string; label: string; color: string }> = {
  created:   { icon: 'add_circle',   label: 'Created',   color: 'text-secondary' },
  updated:   { icon: 'edit',         label: 'Updated',   color: 'text-on-surface-variant' },
  completed: { icon: 'check_circle', label: 'Completed', color: 'text-green-600' },
  deleted:   { icon: 'delete',       label: 'Deleted',   color: 'text-error' },
};
