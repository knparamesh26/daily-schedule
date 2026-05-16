import { useState, useMemo } from 'react';
import type { Project, Task } from '../types';

interface Props {
  projects: Project[];
  tasks: Task[];
  onOpenProject: (id: string) => void;
  onNewProject: () => void;
  onDeleteProject: (id: string) => void;
}

const ICONS = ['folder', 'analytics', 'group', 'design_services', 'security', 'code', 'campaign', 'build'];

export default function Projects({ projects, tasks, onOpenProject, onNewProject, onDeleteProject }: Props) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () => projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase())),
    [projects, search]
  );

  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const atRisk = projects.filter(p =>
    tasks.some(t => t.project === p.name && t.status !== 'done' && t.dueDate && new Date(t.dueDate) < today)
  ).length;

  return (
    <div className="p-xl max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-xl">
        <div>
          <h2 className="text-headline-xl text-on-surface font-bold">Active Projects</h2>
          <p className="text-body-md text-on-surface-variant mt-xs">Manage and track your ongoing initiatives.</p>
        </div>
        <div className="flex items-center gap-sm px-md py-xs border border-outline-variant rounded-lg bg-surface-container-lowest shadow-sm">
          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">search</span>
          <input
            className="bg-transparent border-none outline-none text-label-md w-44 placeholder:text-on-surface-variant/50 text-on-surface"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Project rows */}
      <div className="space-y-sm mb-xl">
        {filtered.map((project, i) => {
          const pts        = tasks.filter(t => t.project === project.name);
          const done       = pts.filter(t => t.status === 'done').length;
          const inProgress = pts.filter(t => t.status === 'in_progress').length;
          const total      = pts.length;
          const pct        = total === 0 ? 0 : Math.round((done / total) * 100);

          const now = new Date(); now.setHours(0, 0, 0, 0);
          const overdue = pts.filter(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < now).length;

          const upcoming = pts
            .filter(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) >= now)
            .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())[0];
          const nearestDue = upcoming?.dueDate
            ? new Date(upcoming.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : null;

          return (
            <div
              key={project.id}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl px-lg py-md flex items-center gap-lg shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: project.color + '22' }}
              >
                <span className="material-symbols-outlined text-[22px]" style={{ color: project.color }}>
                  {ICONS[i % ICONS.length]}
                </span>
              </div>

              {/* Name */}
              <div className="w-40 shrink-0">
                <p className="text-label-md text-on-surface font-bold leading-tight">{project.name}</p>
                {project.description && (
                  <p className="text-label-sm uppercase tracking-wider mt-[2px] truncate" style={{ color: 'rgba(0,0,0,0.38)' }}>
                    {project.description}
                  </p>
                )}
              </div>

              {/* Progress */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-xs">
                  <span className="text-label-sm font-semibold text-primary">{pct}% Complete</span>
                  <span className="text-label-sm text-on-surface-variant">{done}/{total} Tasks</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full overflow-hidden" style={{ height: '6px' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: project.color }}
                  />
                </div>
              </div>

              {/* Metadata chips */}
              <div className="flex items-center gap-xs shrink-0">
                {overdue > 0 && (
                  <span className="flex items-center gap-xs text-label-sm text-error bg-error/10 px-sm py-[3px] rounded-full font-medium">
                    <span className="material-symbols-outlined text-[12px]">warning</span>
                    {overdue} overdue
                  </span>
                )}
                {inProgress > 0 && (
                  <span className="flex items-center gap-xs text-label-sm text-primary bg-primary/8 px-sm py-[3px] rounded-full">
                    <span className="material-symbols-outlined text-[12px]">play_circle</span>
                    {inProgress} active
                  </span>
                )}
                {nearestDue && (
                  <span className="flex items-center gap-xs text-label-sm text-on-surface-variant bg-surface-container px-sm py-[3px] rounded-full">
                    <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                    {nearestDue}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-lg shrink-0 ml-lg">
                <button
                  onClick={() => onOpenProject(project.id)}
                  className="text-label-md font-bold text-primary hover:opacity-75 transition-opacity"
                >
                  View Tasks
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onDeleteProject(project.id); }}
                  className="text-on-surface-variant hover:text-error transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            </div>
          );
        })}

        {/* New project CTA */}
        <button
          onClick={onNewProject}
          className="w-full border-2 border-dashed border-outline-variant rounded-xl py-xl flex flex-col items-center gap-sm hover:border-primary/40 hover:bg-surface-container-low/40 transition-all duration-150 group"
        >
          <div className="w-10 h-10 rounded-full border-2 border-outline-variant group-hover:border-primary/40 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">add</span>
          </div>
          <div className="text-center">
            <p className="text-label-md text-on-surface font-semibold">Initiate New Project</p>
            <p className="text-label-sm text-on-surface-variant mt-[2px]">Define goals, milestones, and track progress.</p>
          </div>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-lg">
        <StatCard
          icon="trending_up"
          badge={`${projects.length} total`}
          badgeStyle="bg-primary/10 text-primary"
          label="PROJECTS"
          value={String(projects.length)}
          sub="Active initiatives"
        />
        <StatCard
          icon="groups"
          badge="Active"
          badgeStyle="bg-green-500/10 text-green-600"
          label="COMPLETION RATE"
          value={`${completionRate}%`}
          sub="Tasks completed overall"
        />
        <StatCard
          icon="timer"
          badge={atRisk > 0 ? 'At Risk' : 'On Track'}
          badgeStyle={atRisk > 0 ? 'bg-error/10 text-error' : 'bg-green-500/10 text-green-600'}
          label="DEADLINES"
          value={String(atRisk).padStart(2, '0')}
          sub="Projects requiring attention"
        />
      </div>
    </div>
  );
}

function StatCard({ icon, badge, badgeStyle, label, value, sub }: {
  icon: string;
  badge: string;
  badgeStyle: string;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
      <div className="flex items-start justify-between mb-md">
        <span className="material-symbols-outlined text-on-surface-variant text-[22px]">{icon}</span>
        <span className={`text-label-sm font-semibold px-sm py-[2px] rounded-full ${badgeStyle}`}>{badge}</span>
      </div>
      <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">{label}</p>
      <p className="text-headline-xl text-on-surface font-bold">{value}</p>
      <p className="text-label-sm text-on-surface-variant mt-xs">{sub}</p>
    </div>
  );
}
