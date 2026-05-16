import type { Task, Project } from '../types';
import { STATUS_ORDER, STATUS_LABELS, STATUS_DOT, PRIORITY_LABELS, PRIORITY_STYLES } from '../types';

interface Props {
  tasks: Task[];
  projects: Project[];
  search: string;
  onViewTask: (id: string) => void;
  onAddTask: () => void;
  displayName?: string;
}

export default function Dashboard({ tasks, projects, search, onViewTask, onAddTask, displayName = 'Alex' }: Props) {
  const filtered = tasks.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  const todoCount      = tasks.filter(t => t.status === 'todo').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const doneCount      = tasks.filter(t => t.status === 'done').length;
  const total          = tasks.length;
  const score          = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  const activeProjects = projects
    .map(p => {
      const pts   = tasks.filter(t => t.project === p.name);
      const done  = pts.filter(t => t.status === 'done').length;
      const active = pts.filter(t => t.status === 'in_progress').length;
      const pct   = pts.length === 0 ? 0 : Math.round((done / pts.length) * 100);
      return { ...p, total: pts.length, done, active, pct };
    })
    .filter(p => p.total > 0)
    .sort((a, b) => b.active - a.active)
    .slice(0, 3);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="p-xl space-y-xl max-w-7xl mx-auto w-full">
      {/* Greeting & Actions */}
      <section className="flex justify-between items-end">
        <div>
          <h2 className="text-headline-lg text-on-surface font-semibold">{greeting}, {displayName}</h2>
          <p className="text-body-md text-on-surface-variant mt-xs">
            {todoCount + inProgressCount > 0
              ? `You have ${todoCount + inProgressCount} tasks pending across ${projects.filter(p => tasks.some(t => t.project === p.name && t.status !== 'done')).length || 1} projects.`
              : 'All caught up! Great work.'}
          </p>
        </div>
        <div className="flex gap-sm">
          <button className="flex items-center gap-xs border border-outline-variant px-md py-xs rounded text-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors duration-150">
            <span className="material-symbols-outlined text-[16px]">filter_list</span>
            Filter
          </button>
          <button
            onClick={onAddTask}
            className="flex items-center gap-xs bg-primary text-on-primary px-md py-xs rounded text-label-md hover:opacity-90 active:scale-95 transition-all duration-150"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Add Task
          </button>
        </div>
      </section>

      {/* Stats bento */}
      <div className="grid grid-cols-12 gap-lg">

        {/* Productivity Score */}
        <div className="col-span-12 md:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-sm">
          <div className="flex justify-between items-start mb-md">
            <div className="p-xs bg-primary/10 rounded">
              <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
            </div>
            <span className="text-label-sm text-green-600 bg-green-500/10 px-sm py-xs rounded-full font-semibold">
              {doneCount} done
            </span>
          </div>
          <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Productivity Score</p>
          <div className="flex items-end gap-xs mt-xs">
            <span className="text-headline-xl text-on-surface font-semibold">{score}</span>
            <span className="text-body-md text-on-surface-variant mb-[3px]">/100</span>
          </div>
          <div className="mt-md w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-700"
              style={{ width: `${score}%` }}
            />
          </div>
          <div className="mt-sm flex justify-between text-label-sm text-on-surface-variant">
            <span>{todoCount} to do</span>
            <span>{inProgressCount} in progress</span>
          </div>
        </div>

        {/* Active Projects */}
        <div className="col-span-12 md:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-sm">
          <div className="flex items-center justify-between mb-md">
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Active Projects</p>
            <span className="text-label-sm text-on-surface-variant">{activeProjects.length} active</span>
          </div>

          {activeProjects.length === 0 ? (
            <p className="text-body-md text-on-surface-variant/50 text-center py-lg">No active projects yet.</p>
          ) : (
            <div className="space-y-sm">
              {activeProjects.map(p => (
                <div key={p.id} className="flex items-center gap-md p-sm rounded-lg hover:bg-surface-container-low transition-colors">
                  <div className="w-2 h-8 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-xs">
                      <span className="text-label-md text-on-surface font-medium truncate">{p.name}</span>
                      <span className="text-label-sm text-on-surface-variant shrink-0 ml-sm">{p.pct}%</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${p.pct}%`, backgroundColor: p.color }}
                      />
                    </div>
                    <div className="flex items-center gap-md mt-xs">
                      <span className="text-label-sm text-on-surface-variant">{p.total} tasks</span>
                      {p.active > 0 && (
                        <span className="text-label-sm text-primary bg-primary/8 px-xs py-[2px] rounded-full">
                          {p.active} active
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        {STATUS_ORDER.map(status => {
          const col = filtered.filter(t => t.status === status);
          return (
            <div key={status} className={`space-y-sm ${status === 'done' ? 'opacity-70 hover:opacity-100 transition-opacity' : ''}`}>
              <div className="flex items-center justify-between px-xs">
                <div className="flex items-center gap-sm">
                  <div className={`w-2 h-2 rounded-full ${STATUS_DOT[status]}`} />
                  <h4 className="text-headline-sm text-on-surface">{STATUS_LABELS[status]}</h4>
                  <span className="text-label-sm text-on-surface-variant bg-surface-container px-sm py-[2px] rounded-full">
                    {col.length}
                  </span>
                </div>
                <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-[18px]">
                  more_horiz
                </button>
              </div>

              <div className="space-y-sm custom-scrollbar overflow-y-auto max-h-[600px] pr-xs">
                {col.length === 0 ? (
                  <div className="text-label-sm text-on-surface-variant/50 text-center py-lg border-2 border-dashed border-outline-variant rounded-lg">
                    No tasks
                  </div>
                ) : (
                  col.map(task => <TaskCard key={task.id} task={task} onClick={() => onViewTask(task.id)} />)
                )}
              </div>
            </div>
          );
        })}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-margin">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">task_alt</span>
          <p className="text-body-md text-on-surface-variant mt-md">No tasks yet. Add your first task to get started.</p>
          <button
            onClick={onAddTask}
            className="mt-lg bg-primary text-on-primary px-xl py-sm rounded text-label-md hover:opacity-90 transition-all"
          >
            Add Task
          </button>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const pStyle = PRIORITY_STYLES[task.priority];
  const isDone = task.status === 'done';

  return (
    <div
      onClick={onClick}
      className={`bg-surface-container-lowest border rounded-lg p-md shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer group
        ${task.status === 'in_progress' ? 'border-primary/20 ring-1 ring-primary/8' : 'border-outline-variant'}`}
    >
      <div className="flex justify-between items-start mb-sm">
        <span className={`text-label-sm px-xs py-[2px] rounded-full uppercase ${pStyle.bg} ${pStyle.text}`}>
          {PRIORITY_LABELS[task.priority]}
        </span>
        {isDone
          ? <span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span>
          : task.status === 'in_progress'
            ? <span className="material-symbols-outlined text-primary text-[18px]">play_circle</span>
            : <span className="material-symbols-outlined text-on-surface-variant text-[18px]">radio_button_unchecked</span>
        }
      </div>

      <h5 className={`text-label-md text-on-surface font-medium mb-xs ${isDone ? 'line-through opacity-60' : ''}`}>
        {task.name}
      </h5>

      {task.description && (
        <p className="text-label-sm text-on-surface-variant line-clamp-2">{task.description}</p>
      )}

      {task.status === 'in_progress' && (
        <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden my-sm">
          <div className="bg-primary h-full w-[60%] rounded-full" />
        </div>
      )}

      {(task.dueDate || task.project) && (
        <div className="mt-sm pt-sm border-t border-outline-variant/30 flex justify-between items-center">
          {task.dueDate
            ? <div className="flex items-center gap-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-[13px]">schedule</span>
                <span className="text-label-sm">{task.dueDate}</span>
              </div>
            : <span />
          }
          {task.project && (
            <span className="text-label-sm text-primary/70 bg-primary/8 px-xs py-[2px] rounded-full">{task.project}</span>
          )}
        </div>
      )}
    </div>
  );
}
