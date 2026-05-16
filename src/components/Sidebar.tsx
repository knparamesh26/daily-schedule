import type { View, Project } from '../types';

const NAV_ITEMS: { view: View; icon: string; label: string }[] = [
  { view: 'dashboard', icon: 'grid_view',      label: 'Dashboard' },
  { view: 'calendar',  icon: 'calendar_month', label: 'Calendar'  },
  { view: 'tasks',     icon: 'task_alt',       label: 'Tasks'     },
  { view: 'projects',  icon: 'folder',         label: 'Projects'  },
  { view: 'history',   icon: 'history',        label: 'History'   },
  { view: 'settings',  icon: 'settings',       label: 'Settings'  },
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
    <aside className="w-[260px] h-screen fixed left-0 top-0 flex flex-col py-xl px-md z-50" style={{ backgroundColor: '#0f1729' }}>
      {/* Brand */}
      <div className="mb-xl px-sm">
        <h1 className="text-headline-md font-bold text-white tracking-tight">TaskStream</h1>
        <p className="text-body-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>Productivity Workspace</p>
      </div>

      {/* Main nav */}
      <nav className="space-y-[8px]">
        {NAV_ITEMS.map(item => {
          const active = item.view === currentView ||
            (item.view === 'projects' && currentView === 'project-detail');
          return (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`w-full flex items-center gap-sm px-md py-[6px] rounded transition-all duration-150 text-left
                ${active
                  ? 'bg-primary text-white font-semibold'
                  : 'text-white/60 hover:bg-white/[0.07] hover:text-white/90'
                }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="text-body-md">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Projects list */}
      {projects.length > 0 && (
        <div className="mt-lg pt-lg border-t border-white/10 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-sm mb-sm">
            <span className="text-label-sm font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Projects
            </span>
            <button
              onClick={onNewProject}
              className="text-white/40 hover:text-white/80 transition-colors p-xs rounded"
              title="New project"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
          </div>

          <div className="space-y-[2px] overflow-y-auto flex-1">
            {projects.map(project => {
              const active = currentView === 'project-detail' && selectedProjectId === project.id;
              return (
                <button
                  key={project.id}
                  onClick={() => onOpenProject(project.id)}
                  className={`w-full flex items-center gap-sm px-md py-sm rounded-lg transition-all duration-150 text-left
                    ${active
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-white/55 hover:bg-white/[0.07] hover:text-white/85'
                    }`}
                >
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
                  <span className="text-body-md truncate">{project.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* New Project button */}
      <div className="mt-auto pt-md border-t border-white/10">
        <button
          onClick={onNewProject}
          className="w-full flex items-center justify-center gap-sm py-[6px] rounded text-label-md font-medium transition-all duration-150 hover:bg-white/[0.07]"
          style={{ color: 'rgba(255,255,255,0.55)' }}
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Project
        </button>
      </div>
    </aside>
  );
}
