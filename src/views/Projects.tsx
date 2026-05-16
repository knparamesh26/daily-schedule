import type { Project, Task } from '../types';

interface Props {
  projects: Project[];
  tasks: Task[];
  onOpenProject: (id: string) => void;
  onNewProject: () => void;
}

export default function Projects({ projects, tasks, onOpenProject, onNewProject }: Props) {
  return (
    <div className="p-xl max-w-7xl mx-auto w-full">
      <div className="flex items-end justify-between mb-xl">
        <div>
          <h2 className="text-headline-lg text-primary">Projects</h2>
          <p className="text-body-md text-on-surface-variant mt-xs">
            {projects.length === 0
              ? 'No projects yet. Create one to get started.'
              : `${projects.length} project${projects.length !== 1 ? 's' : ''} · ${tasks.length} total tasks`}
          </p>
        </div>
        <button
          onClick={onNewProject}
          className="flex items-center gap-sm bg-primary text-on-primary px-lg py-sm rounded hover:opacity-90 active:scale-95 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span className="text-label-md">New Project</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-margin border-2 border-dashed border-outline-variant rounded-xl">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">folder_open</span>
          <p className="text-body-md text-on-surface-variant mt-md">No projects yet</p>
          <button
            onClick={onNewProject}
            className="mt-lg bg-primary text-on-primary px-xl py-md rounded text-label-md hover:opacity-90 transition-all"
          >
            Create your first project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {projects.map(project => {
            const projectTasks = tasks.filter(t => t.project === project.name);
            const done = projectTasks.filter(t => t.status === 'done').length;
            const total = projectTasks.length;
            const pct = total === 0 ? 0 : Math.round((done / total) * 100);

            return (
              <button
                key={project.id}
                onClick={() => onOpenProject(project.id)}
                className="text-left bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm hover:shadow-md transition-all duration-150 group"
              >
                {/* Color bar */}
                <div className="h-1 w-full rounded-full mb-lg" style={{ backgroundColor: project.color }} />

                {/* Header */}
                <div className="flex items-start justify-between mb-sm">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${project.color}20` }}
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ color: project.color }}>
                      folder
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                    arrow_forward
                  </span>
                </div>

                <h3 className="text-headline-sm text-primary mt-md">{project.name}</h3>
                {project.description && (
                  <p className="text-label-md text-on-surface-variant mt-xs line-clamp-2">
                    {project.description}
                  </p>
                )}

                {/* Stats */}
                <div className="mt-lg pt-md border-t border-outline-variant/50">
                  <div className="flex justify-between items-center mb-sm">
                    <span className="text-label-sm text-on-surface-variant">{done}/{total} tasks done</span>
                    <span className="text-label-sm font-bold" style={{ color: project.color }}>{pct}%</span>
                  </div>
                  <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: project.color }}
                    />
                  </div>
                </div>

                {/* Task status pills */}
                {total > 0 && (
                  <div className="flex gap-xs mt-md flex-wrap">
                    {(['todo', 'in_progress', 'done'] as const).map(s => {
                      const count = projectTasks.filter(t => t.status === s).length;
                      if (!count) return null;
                      return (
                        <span key={s} className="text-label-sm text-on-surface-variant bg-surface-container px-sm py-xs rounded-full">
                          {s === 'todo' ? 'To Do' : s === 'in_progress' ? 'In Progress' : 'Done'}: {count}
                        </span>
                      );
                    })}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
