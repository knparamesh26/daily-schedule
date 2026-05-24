import { useNavigate, useLocation } from 'react-router-dom';
import { useAppData } from '../context/AppContext';
import { useLayout } from '../context/LayoutContext';

const NAV_ITEMS = [
  { path: '/dashboard', icon: 'grid_view',      label: 'Dashboard' },
  { path: '/calendar',  icon: 'calendar_month', label: 'Calendar'  },
  { path: '/tasks',     icon: 'task_alt',       label: 'Tasks'     },
  { path: '/projects',  icon: 'folder',         label: 'Projects'  },
  { path: '/history',   icon: 'history',        label: 'History'   },
  { path: '/settings',  icon: 'settings',       label: 'Settings'  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { projects } = useAppData();
  const { openProjectModal } = useLayout();

  return (
    <aside className="w-sidebar-w h-screen fixed left-0 top-0 flex flex-col py-xl px-md z-50 bg-sidebar">
      <div className="mb-xl px-sm">
        <h1 className="text-headline-md font-bold text-white tracking-tight">TaskStream</h1>
        <p className="text-body-sm text-white/45">Productivity Workspace</p>
      </div>

      <nav className="space-y-xs">
        {NAV_ITEMS.map(item => {
          const active = item.path === '/projects'
            ? pathname.startsWith('/projects')
            : pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-sm px-md py-1.5 rounded transition-all duration-150 text-left
                ${active
                  ? 'bg-primary text-white font-semibold'
                  : 'text-white/60 hover:bg-white/10 hover:text-white/90'
                }`}
            >
              <span className="material-symbols-outlined text-icon-lg">{item.icon}</span>
              <span className="text-body-md">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {projects.length > 0 && (
        <div className="mt-lg pt-lg border-t border-white/10 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-sm mb-sm">
            <span className="text-label-sm font-semibold uppercase tracking-wider text-white/35">
              Projects
            </span>
            <button
              onClick={() => openProjectModal()}
              className="text-white/40 hover:text-white/80 transition-colors p-xs rounded"
              aria-label="Create new project"
            >
              <span className="material-symbols-outlined text-icon-base">add</span>
            </button>
          </div>

          <div className="space-y-0.5 overflow-y-auto flex-1">
            {projects.map(project => {
              const active = pathname === `/projects/${project.id}`;
              return (
                <button
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className={`w-full flex items-center gap-sm px-md py-sm rounded-lg transition-all duration-150 text-left
                    ${active
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-white/55 hover:bg-white/10 hover:text-white/85'
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

      <div className="mt-auto pt-md border-t border-white/10">
        <button
          onClick={() => openProjectModal()}
          className="w-full flex items-center justify-center gap-sm py-1.5 rounded text-label-md font-medium transition-all duration-150 hover:bg-white/10 text-white/55"
        >
          <span className="material-symbols-outlined text-icon-md">add</span>
          New Project
        </button>
      </div>
    </aside>
  );
}
