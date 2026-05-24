import { useParams, useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppContext';
import { useLayout } from '../context/LayoutContext';
import { STATUS_ORDER, STATUS_LABELS, STATUS_DOT, PRIORITY_LABELS, PRIORITY_STYLES } from '../types';

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { tasks, projects, handleDeleteProject } = useAppData();
  const { openProjectModal } = useLayout();

  const project = projects.find(p => p.id === projectId);
  if (!project) return (
    <div className="p-xl text-center text-on-surface-variant">
      <p>Project not found.</p>
      <button onClick={() => navigate('/projects')} className="mt-md text-primary hover:underline text-label-md">Back to Projects</button>
    </div>
  );

  const projectTasks = tasks.filter(t => t.project === project.name);
  const done = projectTasks.filter(t => t.status === 'done').length;
  const total = projectTasks.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  const onDelete = async () => {
    await handleDeleteProject(project.id);
    navigate('/projects');
  };

  return (
    <div className="p-xl max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-xs text-label-md text-on-surface-variant mb-lg">
        <button onClick={() => navigate('/projects')} className="hover:text-primary transition-colors">Projects</button>
        <span className="material-symbols-outlined text-icon-base">chevron_right</span>
        <span className="text-on-surface">{project.name}</span>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl shadow-sm mb-xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-lg">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${project.color}20` }}
            >
              <span className="material-symbols-outlined text-icon-3xl" style={{ color: project.color }}>
                folder
              </span>
            </div>
            <div>
              <div className="flex items-center gap-md">
                <h2 className="text-headline-md text-primary">{project.name}</h2>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
              </div>
              {project.description && (
                <p className="text-body-md text-on-surface-variant mt-xs">{project.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-md shrink-0">
            <button
              onClick={() => openProjectModal(project)}
              className="flex items-center gap-sm px-md py-sm border border-outline-variant rounded text-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-icon-base">edit</span>
              Edit
            </button>
            <button
              onClick={() => navigate(`/tasks/new?fromProject=${project.id}`)}
              className="flex items-center gap-sm bg-primary text-on-primary px-lg py-sm rounded hover:opacity-90 active:scale-95 transition-all text-label-md shadow-sm"
            >
              <span className="material-symbols-outlined text-icon-md">add</span>
              Add Task
            </button>
          </div>
        </div>

        <div className="mt-lg pt-lg border-t border-outline-variant grid grid-cols-3 gap-lg">
          {[
            { label: 'Total Tasks',   value: total },
            { label: 'Completed',     value: done },
            { label: 'Completion',    value: `${pct}%` },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-headline-sm text-primary">{s.value}</p>
              <p className="text-label-sm text-on-surface-variant mt-xs">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-md w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: project.color }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        {STATUS_ORDER.map(status => {
          const col = projectTasks.filter(t => t.status === status);
          return (
            <div key={status} className={`space-y-md ${status === 'done' ? 'opacity-70 hover:opacity-100 transition-opacity' : ''}`}>
              <div className="flex items-center justify-between px-xs">
                <div className="flex items-center gap-sm">
                  <div className={`w-2 h-2 rounded-full ${STATUS_DOT[status]}`} />
                  <h4 className="text-headline-sm">{STATUS_LABELS[status]}</h4>
                  <span className="text-label-sm text-on-surface-variant bg-surface-container px-sm py-1 rounded-full">
                    {col.length}
                  </span>
                </div>
              </div>

              <div className="space-y-md">
                {col.length === 0 ? (
                  <div className="text-label-sm text-on-surface-variant/50 text-center py-lg border-2 border-dashed border-outline-variant rounded-lg">
                    No tasks
                  </div>
                ) : (
                  col.map(task => (
                    <button
                      key={task.id}
                      onClick={() => navigate(`/tasks/${task.id}`)}
                      className={`w-full text-left bg-surface-container-lowest border rounded-lg p-md shadow-sm hover:shadow-md transition-all duration-150
                        ${task.status === 'in_progress' ? 'border-secondary/30 ring-1 ring-secondary/10' : 'border-outline-variant'}`}
                    >
                      <div className="flex justify-between items-start mb-sm">
                        <span className={`text-label-sm px-sm py-xs rounded uppercase ${PRIORITY_STYLES[task.priority].bg} ${PRIORITY_STYLES[task.priority].text}`}>
                          {PRIORITY_LABELS[task.priority]}
                        </span>
                        {task.status === 'done'
                          ? <span className="material-symbols-outlined text-green-600 text-icon-lg">check_circle</span>
                          : task.status === 'in_progress'
                            ? <span className="material-symbols-outlined text-secondary text-icon-lg">play_circle</span>
                            : <span className="material-symbols-outlined text-on-surface-variant text-icon-lg">flag</span>
                        }
                      </div>
                      <p className={`text-label-md text-primary ${task.status === 'done' ? 'line-through' : ''}`}>
                        {task.name}
                      </p>
                      {task.description && (
                        <p className="text-label-sm text-on-surface-variant mt-xs line-clamp-2">{task.description}</p>
                      )}
                      {task.dueDate && (
                        <div className="mt-md pt-md border-t border-outline-variant/30 flex items-center gap-xs text-on-surface-variant">
                          <span className="material-symbols-outlined text-headline-sm">schedule</span>
                          <span className="text-label-sm">{task.dueDate}</span>
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-xl pt-xl border-t border-outline-variant">
        <button
          onClick={onDelete}
          className="text-label-md text-error hover:bg-error/5 px-md py-sm rounded transition-colors"
        >
          Delete project
        </button>
      </div>
    </div>
  );
}
