import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppContext';
import type { Task } from '../types';
import { STATUS_LABELS, PRIORITY_LABELS, PRIORITY_STYLES } from '../types';

type GroupBy = 'status' | 'priority' | 'project';

const STATUS_COLS  = ['todo', 'in_progress', 'done'] as const;
const PRIORITY_COLS = ['critical', 'high', 'medium', 'low'] as const;

const STATUS_DOT: Record<string, string> = {
  todo:        'bg-on-surface-variant/40',
  in_progress: 'bg-primary',
  done:        'bg-green-500',
};

const PRIORITY_DOT: Record<string, string> = {
  critical: 'bg-error',
  high:     'bg-orange-400',
  medium:   'bg-yellow-400',
  low:      'bg-green-400',
};

export default function Tasks() {
  const navigate = useNavigate();
  const { tasks, projects, handleAssignProject } = useAppData();

  const [groupBy, setGroupBy]           = useState<GroupBy>('status');
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterProject,  setFilterProject]  = useState('all');
  const [showFilters, setShowFilters]   = useState(false);
  const groupMenuRef  = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (groupMenuRef.current  && !groupMenuRef.current.contains(e.target as Node))  setShowGroupMenu(false);
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target as Node)) setShowFilters(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = useMemo(() => tasks.filter(t => {
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (filterProject  !== 'all' && t.project  !== filterProject)  return false;
    return true;
  }), [tasks, filterPriority, filterProject]);

  const groups = useMemo(() => {
    if (groupBy === 'status') {
      return STATUS_COLS.map(s => ({
        key: s, label: STATUS_LABELS[s],
        tasks: filtered.filter(t => t.status === s),
        dot: STATUS_DOT[s], color: '',
      }));
    }
    if (groupBy === 'priority') {
      return PRIORITY_COLS.map(p => ({
        key: p, label: PRIORITY_LABELS[p],
        tasks: filtered.filter(t => t.priority === p),
        dot: PRIORITY_DOT[p], color: '',
      }));
    }
    const rows = projects
      .filter(p => filtered.some(t => t.project === p.name))
      .map(p => ({ key: p.id, label: p.name, tasks: filtered.filter(t => t.project === p.name), dot: '', color: p.color }));
    const unassigned = filtered.filter(t => !t.project);
    if (unassigned.length) rows.push({ key: 'none', label: 'No Project', tasks: unassigned, dot: 'bg-outline', color: '' });
    return rows;
  }, [groupBy, filtered, projects]);

  const handleExport = () => {
    const rows = ['Name,Status,Priority,Project,Due Date',
      ...filtered.map(t => `"${t.name}","${t.status}","${t.priority}","${t.project}","${t.dueDate ?? ''}"`)
    ].join('\n');
    const blobUrl = URL.createObjectURL(new Blob([rows], { type: 'text/csv' }));
    const a = Object.assign(document.createElement('a'), { href: blobUrl, download: 'tasks.csv' });
    a.click();
    URL.revokeObjectURL(blobUrl);
  };

  const activeFilters = (filterPriority !== 'all' ? 1 : 0) + (filterProject !== 'all' ? 1 : 0);

  return (
    <div className="p-xl max-w-full mx-auto w-full">
      <div className="flex items-start justify-between mb-xl">
        <div>
          <h2 className="text-page-title text-on-surface">Workspace Tasks</h2>
          <p className="text-body-md text-on-surface-variant mt-xs">
            {filtered.length} tasks across {new Set(filtered.map(t => t.project).filter(Boolean)).size} projects.
          </p>
        </div>
        <div className="flex items-center gap-sm">
          <div className="relative" ref={groupMenuRef}>
            <button
              onClick={() => setShowGroupMenu(v => !v)}
              className="flex items-center gap-sm px-md py-xs border border-outline-variant rounded-lg bg-surface-container-lowest text-label-md text-on-surface hover:bg-surface-container-low transition-colors shadow-sm"
            >
              <span className="text-on-surface-variant text-label-sm font-normal">Group By</span>
              <span className="font-semibold">{groupBy === 'status' ? 'Status' : groupBy === 'priority' ? 'Priority' : 'Project'}</span>
              <span className="material-symbols-outlined text-icon-base text-on-surface-variant">expand_more</span>
            </button>
            {showGroupMenu && (
              <div className="absolute right-0 top-full mt-xs w-40 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg z-20 overflow-hidden">
                {(['status', 'priority', 'project'] as GroupBy[]).map(g => (
                  <button
                    key={g}
                    onClick={() => { setGroupBy(g); setShowGroupMenu(false); }}
                    className={`w-full text-left px-md py-sm text-label-md transition-colors capitalize
                      ${groupBy === g ? 'text-primary bg-primary/5 font-semibold' : 'text-on-surface hover:bg-surface-container-low'}`}
                  >
                    {g === 'status' ? 'Status' : g === 'priority' ? 'Priority' : 'Project'}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={filterMenuRef}>
            <button
              onClick={() => setShowFilters(v => !v)}
              className="flex items-center gap-sm px-md py-xs border border-outline-variant rounded-lg bg-surface-container-lowest text-label-md text-on-surface hover:bg-surface-container-low transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-icon-base text-on-surface-variant">filter_list</span>
              Filters
              {activeFilters > 0 && (
                <span className="w-4 h-4 rounded-full bg-primary text-on-primary text-label-xs flex items-center justify-center font-bold">{activeFilters}</span>
              )}
            </button>
            {showFilters && (
              <div className="absolute right-0 top-full mt-xs w-52 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg z-20 p-md space-y-md">
                <div>
                  <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Priority</p>
                  <select
                    value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant rounded px-sm py-xs text-label-md text-on-surface outline-none"
                  >
                    <option value="all">All priorities</option>
                    {PRIORITY_COLS.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Project</p>
                  <select
                    value={filterProject} onChange={e => setFilterProject(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant rounded px-sm py-xs text-label-md text-on-surface outline-none"
                  >
                    <option value="all">All projects</option>
                    {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                {activeFilters > 0 && (
                  <button onClick={() => { setFilterPriority('all'); setFilterProject('all'); }} className="text-label-sm text-error hover:underline">
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-sm px-md py-xs border border-outline-variant rounded-lg bg-surface-container-lowest text-label-md text-on-surface hover:bg-surface-container-low transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-icon-base text-on-surface-variant">download</span>
            Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-background">
        <div className="flex gap-lg pb-lg">
          {groups.map(group => (
            <div key={group.key} className="flex-shrink-0 w-kanban flex flex-col">
              <div className="flex items-center justify-between mb-md px-xs">
                <div className="flex items-center gap-sm">
                  <div className={`w-2.5 h-2.5 rounded-full ${group.dot}`} style={group.color ? { backgroundColor: group.color } : undefined} />
                  <span className="text-label-md text-on-surface font-semibold">{group.label}</span>
                  <span className="text-label-sm text-on-surface-variant bg-surface-container px-sm py-0.5 rounded-full">{group.tasks.length}</span>
                </div>
                <button className="text-on-surface-variant hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-icon-md">more_horiz</span>
                </button>
              </div>
              <div className="space-y-sm">
                {group.tasks.map(task => (
                  <TaskCard
                    key={task.id} task={task} groupBy={groupBy}
                    projects={projects}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    onAssignProject={handleAssignProject}
                  />
                ))}
                {group.tasks.length === 0 && (
                  <div className="border-2 border-dashed border-outline-variant rounded-xl py-lg text-center text-label-sm text-on-surface-variant/40">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, groupBy, projects, onClick, onAssignProject }: {
  task: Task;
  groupBy: GroupBy;
  projects: { id: string; name: string; color: string; description: string }[];
  onClick: () => void;
  onAssignProject: (taskId: string, projectName: string) => void;
}) {
  const isDone         = task.status === 'done';
  const isInProgress   = task.status === 'in_progress';
  const pStyle         = PRIORITY_STYLES[task.priority];
  const isHighPriority = task.priority === 'critical' || task.priority === 'high';
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showPicker) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowPicker(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPicker]);

  const dueFmt = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <div
      onClick={onClick}
      className={`bg-surface border border-outline-variant rounded-xl p-md shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer ${isDone ? 'opacity-75' : ''} ${isInProgress ? 'border-primary/30' : ''}`}
    >
      <div className="flex items-center justify-between mb-sm">
        <div className="flex items-center gap-xs flex-wrap">
          {isDone && <span className="material-symbols-outlined text-green-500 text-icon-sm">check_circle</span>}
          {groupBy !== 'project' && task.project && (
            <span className="text-label-sm text-on-surface bg-surface-container px-sm py-0.5 rounded-full">{task.project}</span>
          )}
          {groupBy !== 'priority' && (
            <span className={`text-label-sm px-sm py-0.5 rounded-full ${pStyle.bg} ${pStyle.text}`}>{PRIORITY_LABELS[task.priority]}</span>
          )}
        </div>
        {isInProgress && <span className="material-symbols-outlined text-on-surface-variant/50 text-icon-sm">edit</span>}
      </div>

      <h4 className={`text-headline-sm text-on-surface font-bold mb-xs leading-snug ${isDone ? 'line-through opacity-50' : ''}`}>
        {task.name}
      </h4>

      {task.description && (
        <p className="text-body-sm text-on-surface-variant line-clamp-2 mb-sm">{task.description}</p>
      )}

      {isInProgress && (
        <div className="w-full bg-surface-container-high rounded-full overflow-hidden mb-sm h-1.25">
          <div className="bg-primary h-full w-3/5 rounded-full" />
        </div>
      )}

      {!task.project && projects.length > 0 && (
        <div className="relative mt-sm" ref={pickerRef}>
          <button
            onClick={e => { e.stopPropagation(); setShowPicker(v => !v); }}
            className="flex items-center gap-xs text-label-sm text-on-surface-variant border border-dashed border-outline-variant rounded-full px-sm py-0.75 hover:border-primary hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-icon-2xs">add</span>
            Add to project
          </button>
          {showPicker && (
            <div className="absolute left-0 top-full mt-xs w-48 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg z-30 overflow-hidden">
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider px-md pt-sm pb-xs">Assign to</p>
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={e => { e.stopPropagation(); onAssignProject(task.id, p.name); setShowPicker(false); }}
                  className="w-full flex items-center gap-sm px-md py-sm text-label-md text-on-surface hover:bg-surface-container-low transition-colors text-left"
                >
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {(isHighPriority || dueFmt) && (
        <div className="flex items-center justify-between pt-sm border-t border-outline-variant/30 mt-sm">
          <div>
            {isHighPriority && !isDone && groupBy === 'priority' && (
              <span className={`text-label-sm font-semibold flex items-center gap-xs ${task.priority === 'critical' ? 'text-error' : 'text-orange-500'}`}>
                <span className="material-symbols-outlined text-icon-2xs">priority_high</span>
                {PRIORITY_LABELS[task.priority]}
              </span>
            )}
          </div>
          {dueFmt && (
            isDone
              ? <span className="text-label-sm text-on-surface-variant">Completed {dueFmt}</span>
              : <div className="flex items-center gap-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-icon-2xs">calendar_today</span>
                  <span className="text-label-sm">{dueFmt}</span>
                </div>
          )}
        </div>
      )}
    </div>
  );
}
