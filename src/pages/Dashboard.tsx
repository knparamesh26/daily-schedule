import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppContext';
import type { Task } from '../types';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekDates(): Date[] {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function isOverdue(dueDate: string) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return new Date(dueDate) < today;
}

function isDueToday(dueDate: string) {
  return isSameDay(new Date(dueDate), new Date());
}

function isDueSoon(dueDate: string) {
  const diff = new Date(dueDate).getTime() - Date.now();
  return diff > 0 && diff <= 24 * 60 * 60 * 1000;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { tasks, history, settings } = useAppData();

  const today = new Date();
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const formattedDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const doneCount = tasks.filter(t => t.status === 'done').length;
  const total = tasks.length;
  const score = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  const radius = 64;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - score / 100);

  const weekDates = useMemo(() => getWeekDates(), []);
  const todayIndex = (today.getDay() + 6) % 7;

  const weekData = useMemo(() => weekDates.map(date => {
    const completed = history.filter(h => h.action === 'completed' && isSameDay(new Date(h.timestamp), date)).length;
    const created   = history.filter(h => h.action === 'created'   && isSameDay(new Date(h.timestamp), date)).length;
    return { completed, created, total: completed + created };
  }), [history, weekDates]);

  const maxBar = Math.max(...weekData.map(d => d.total), 1);

  const urgentTasks = useMemo(() =>
    tasks
      .filter(t => t.status !== 'done' && (
        t.priority === 'critical' || t.priority === 'high' ||
        (t.dueDate && (isOverdue(t.dueDate) || isDueToday(t.dueDate) || isDueSoon(t.dueDate)))
      ))
      .sort((a, b) => {
        const s = (t: Task) => (t.dueDate && isOverdue(t.dueDate) ? 3 : t.priority === 'critical' ? 2 : 1);
        return s(b) - s(a);
      })
      .slice(0, 4),
    [tasks]
  );

  const recentActivity = history.slice(0, 6);

  return (
    <div className="p-xl max-w-7xl mx-auto w-full">
      <div className="flex items-start justify-between mb-xl">
        <div>
          <h2 className="text-page-title text-on-surface">{greeting}, {settings.displayName}</h2>
          <p className="text-body-md text-on-surface-variant mt-xs">Here's what's happening in TaskStream today.</p>
        </div>
        <div className="flex items-center gap-sm px-md py-xs border border-outline-variant rounded-lg bg-surface shadow-sm">
          <span className="material-symbols-outlined text-primary text-icon-md">calendar_today</span>
          <span className="text-label-md font-bold text-on-surface">{formattedDate}</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-lg mb-lg">
        <div className="col-span-12 md:col-span-4 bg-primary rounded-xl p-lg flex flex-col">
          <div>
            <h3 className="text-headline-md font-bold text-white">Productivity Boost</h3>
            <p className="text-body-sm text-white/70 mt-xs">
              {total === 0 ? 'Add your first task to get started.'
                : score >= 80 ? `You've completed ${score}% of your tasks. Almost there!`
                : `${doneCount} of ${total} tasks done. Keep it up!`}
            </p>
          </div>
          <div className="flex-1 flex items-center justify-center my-lg">
            <div className="relative" style={{ width: (radius + strokeWidth) * 2, height: (radius + strokeWidth) * 2 }}>
              <svg width="100%" height="100%"
                viewBox={`0 0 ${(radius + strokeWidth) * 2} ${(radius + strokeWidth) * 2}`}
                className="-rotate-90"
              >
                <circle cx={radius + strokeWidth} cy={radius + strokeWidth} r={radius}
                  fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={strokeWidth} />
                <circle cx={radius + strokeWidth} cy={radius + strokeWidth} r={radius}
                  fill="none" stroke="white" strokeWidth={strokeWidth} strokeLinecap="round"
                  strokeDasharray={circumference} strokeDashoffset={dashOffset}
                  style={{ transition: 'stroke-dashoffset 0.7s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-headline-xl font-bold text-white">{score}%</span>
                <span className="text-label-sm uppercase tracking-wider text-white/70">Complete</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/tasks/new')}
            className="w-full bg-white text-primary py-sm rounded-lg text-label-md font-bold hover:bg-white/90 active:scale-95 transition-all duration-150"
          >
            Add New Task
          </button>
        </div>

        <div className="col-span-12 md:col-span-8 bg-surface border border-outline-variant rounded-xl p-lg">
          <div className="flex items-start justify-between mb-lg">
            <div>
              <h3 className="text-headline-md text-on-surface font-bold">Key Reports</h3>
              <p className="text-body-sm text-on-surface-variant mt-xs">Task completion rate per day</p>
            </div>
            <span className="px-sm py-xs border border-outline-variant rounded text-label-sm text-on-surface-variant">This Week</span>
          </div>
          <div className="flex items-end justify-between gap-sm h-chart">
            {weekData.map((d, i) => {
              const isToday = i === todayIndex;
              const barH = Math.max((d.total / maxBar) * 100, history.length === 0 ? 24 : 4);
              const completedH = d.total === 0 ? 0 : (d.completed / d.total) * barH;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-sm">
                  <div className="w-full flex flex-col justify-end h-chart-bar">
                    <div
                      className={`w-full rounded-md overflow-hidden flex flex-col justify-end ${isToday ? 'bg-primary/18' : 'bg-primary/8'}`}
                      style={{ height: `${barH}px` }}
                    >
                      {completedH > 0 && (
                        <div className={`w-full ${isToday ? 'bg-primary' : 'bg-primary/50'}`} style={{ height: `${completedH}px` }} />
                      )}
                    </div>
                  </div>
                  <span className={`text-label-sm ${isToday ? 'text-primary font-semibold' : 'text-on-surface-variant'}`}>
                    {DAYS[i]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-lg">
        <div className="col-span-12 md:col-span-7 bg-surface border border-outline-variant rounded-xl p-lg">
          <div className="flex items-center justify-between mb-lg">
            <h3 className="text-headline-md text-on-surface font-bold">Attention Required</h3>
            {urgentTasks.length > 0 && (
              <span className="px-sm py-xs bg-error/10 text-error rounded-full text-label-sm font-semibold">
                {urgentTasks.length} Urgent {urgentTasks.length === 1 ? 'Task' : 'Tasks'}
              </span>
            )}
          </div>
          {urgentTasks.length === 0 ? (
            <div className="text-center py-xl">
              <span className="material-symbols-outlined text-icon-5xl text-on-surface-variant/30">check_circle</span>
              <p className="text-body-md text-on-surface-variant/50 mt-md">No urgent tasks. All clear!</p>
            </div>
          ) : (
            <div className="space-y-sm">
              {urgentTasks.map(task => {
                const overdue = task.dueDate && isOverdue(task.dueDate);
                const dueToday = task.dueDate && isDueToday(task.dueDate);
                return (
                  <button
                    key={task.id}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    className="w-full flex items-center gap-md p-md rounded-lg border border-outline-variant/50 hover:bg-surface-container-low transition-colors text-left relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-accent bg-error" />
                    <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-error text-icon-base">
                        {overdue ? 'warning' : 'priority_high'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-label-md text-on-surface font-semibold truncate">{task.name}</p>
                      <div className="flex items-center gap-sm mt-0.5">
                        {task.project && <span className="text-label-sm text-on-surface-variant">{task.project}</span>}
                        {task.project && task.dueDate && <span className="text-on-surface-variant/40 text-label-sm">•</span>}
                        {task.dueDate && (
                          <span className={`text-label-sm flex items-center gap-xs ${overdue || dueToday ? 'text-error' : 'text-on-surface-variant'}`}>
                            <span className="material-symbols-outlined text-icon-xs">schedule</span>
                            {overdue ? 'Overdue' : dueToday ? 'Due today' : `Due ${task.dueDate}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="col-span-12 md:col-span-5 bg-surface border border-outline-variant rounded-xl p-lg">
          <h3 className="text-headline-md text-on-surface font-bold mb-lg">Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <div className="text-center py-xl">
              <span className="material-symbols-outlined text-icon-5xl text-on-surface-variant/30">history</span>
              <p className="text-body-md text-on-surface-variant/50 mt-md">No recent activity yet.</p>
            </div>
          ) : (
            <div className="space-y-md">
              {recentActivity.map(entry => {
                const iconMap = { completed: 'check_circle', created: 'add_circle', deleted: 'delete', updated: 'edit' } as const;
                const colorMap = {
                  completed: 'text-green-600 bg-green-500/10',
                  created: 'text-primary bg-primary/10',
                  deleted: 'text-error bg-error/10',
                  updated: 'text-on-surface-variant bg-surface-container',
                } as const;
                const ts = new Date(entry.timestamp);
                const diff = Date.now() - ts.getTime();
                const mins = Math.floor(diff / 60000);
                const timeAgo = mins < 1 ? 'just now' : mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.floor(mins / 60)}h ago` : `${Math.floor(mins / 1440)}d ago`;
                return (
                  <div key={entry.id} className="flex items-center gap-md">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${colorMap[entry.action]}`}>
                      <span className="material-symbols-outlined text-icon-base">{iconMap[entry.action]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-label-md text-on-surface font-medium truncate">{entry.taskName}</p>
                      <p className="text-label-sm text-on-surface-variant capitalize">{entry.action}</p>
                    </div>
                    <span className="text-label-sm text-on-surface-variant/60 shrink-0">{timeAgo}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
