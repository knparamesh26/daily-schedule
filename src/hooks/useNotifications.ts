import { useEffect } from 'react';
import type { Task, AppSettings } from '../types';

function todayStr(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function currentWeekKey(): string {
  const d = new Date();
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86_400_000 + startOfYear.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}

function fire(title: string, options?: NotificationOptions) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  new Notification(title, { icon: '/favicon.ico', ...options });
}

export function useNotifications(
  tasks: Task[],
  settings: AppSettings,
  userId: string | undefined,
) {
  useEffect(() => {
    if (!userId || tasks.length === 0) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const today = todayStr();
    const isMonday = new Date().getDay() === 1;

    if (settings.dueTodayReminders) {
      const key = `ts_due_notif_${userId}`;
      if (localStorage.getItem(key) !== today) {
        const due = tasks.filter(t => t.dueDate === today && t.status !== 'done');
        if (due.length > 0) {
          fire(
            `${due.length} task${due.length > 1 ? 's' : ''} due today`,
            {
              body: due.map(t => `• ${t.name}`).join('\n'),
              tag: 'due-today',
            },
          );
        }
        localStorage.setItem(key, today);
      }
    }

    if (settings.weeklyDigest && isMonday) {
      const key = `ts_digest_notif_${userId}`;
      const weekKey = currentWeekKey();
      if (localStorage.getItem(key) !== weekKey) {
        const done       = tasks.filter(t => t.status === 'done').length;
        const inProgress = tasks.filter(t => t.status === 'in_progress').length;
        const todo       = tasks.filter(t => t.status === 'todo').length;
        const overdue    = tasks.filter(
          t => t.status !== 'done' && t.dueDate && t.dueDate < today,
        ).length;

        const lines = [
          `${done} completed`,
          `${inProgress} in progress`,
          `${todo} to do`,
          overdue > 0 ? `${overdue} overdue` : '',
        ].filter(Boolean);

        fire('TaskStream Weekly Digest', {
          body: lines.join('\n'),
          tag: 'weekly-digest',
        });
        localStorage.setItem(key, weekKey);
      }
    }
  }, [tasks, settings.dueTodayReminders, settings.weeklyDigest, userId]);
}
