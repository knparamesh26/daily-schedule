import type { View, Project } from '../types';

const NAV_ITEMS: { view: View; icon: string; label: string }[] = [
  { view: 'dashboard', icon: 'dashboard',      label: 'Dashboard' },
  { view: 'calendar',  icon: 'calendar_month', label: 'Calendar'  },
  { view: 'add-task',  icon: 'add_circle',     label: 'Add Task'  },
  { view: 'history',   icon: 'history',         label: 'History'   },
  { view: 'settings',  icon: 'settings',        label: 'Settings'  },
];

interface Props {
  currentView: View;
  onNavigate: (view: View) => void;
  projects: Project[];
  selectedProjectId: string | null;
  onOpenProject: (id: string) => void;
  onNewProject: () => void;
}

export default function Sidebar({ currentView, onNavigate, projects, selectedProjectId, onOpenProject, onNewProject }: Props) {
  return (
    <aside className="w-[260px] h-screen fixed left-0 top-0 bg-surface shadow-sm flex flex-col py-xl px-md z-50">
      <div className="mb-xl px-sm">
        <h1 className="text-headline-md font-bold text-primary tracking-tight">TaskStream</h1>
        <p className="text-body-md text-on-surface-variant opacity-70">Productivity Workspace</p>
      </div>

      <nav className="space-y-xs">
        {NAV_ITEMS.map(item => {
          const active = item.view === currentView;
          return (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`w-full flex items-center gap-md px-md py-sm rounded transition-colors duration-150 text-left
                ${active
                  ? 'text-primary font-bold border-r-2 border-primary bg-surface-container-low'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-body-md">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Projects section */}
      <div className="mt-lg pt-lg border-t border-outline-variant flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-sm mb-sm">
          <button
            onClick={() => onNavigate('projects')}
            className={`text-label-md font-semibold transition-colors ${currentView === 'projects' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
          >
            Projects
          </button>
          <button
            onClick={onNewProject}
            className="text-on-surface-variant hover:text-primary transition-colors p-xs rounded"
            title="New project"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
        </div>

        <div className="space-y-xs overflow-y-auto flex-1">
          {projects.map(project => {
            const active = currentView === 'project-detail' && selectedProjectId === project.id;
            return (
              <button
                key={project.id}
                onClick={() => onOpenProject(project.id)}
                className={`w-full flex items-center gap-sm px-md py-sm rounded transition-colors duration-150 text-left
                  ${active
                    ? 'bg-surface-container-low text-primary font-semibold border-r-2 border-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                  }`}
              >
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
                <span className="text-body-md truncate">{project.name}</span>
              </button>
            );
          })}

          {projects.length === 0 && (
            <p className="text-label-sm text-on-surface-variant/50 px-md py-sm">No projects yet</p>
          )}
        </div>
      </div>

      <div className="mt-auto pt-md border-t border-outline-variant">
        <button
          onClick={onNewProject}
          className="w-full flex items-center justify-center gap-sm bg-primary text-on-primary py-md rounded hover:opacity-90 active:scale-95 transition-all duration-150"
        >
          <span className="material-symbols-outlined">add</span>
          <span className="text-label-md">New Project</span>
        </button>
      </div>
    </aside>
  );
}
