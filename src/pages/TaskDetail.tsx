import { useParams, useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppContext';
import { STATUS_LABELS, PRIORITY_LABELS, PRIORITY_STYLES } from '../types';
import type { Project } from '../types';

const PROGRESS: Record<string, number> = { todo: 0, in_progress: 65, done: 100 };

export default function TaskDetail() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { tasks, projects, handleMarkDone, handleDeleteTask, handleAssignProject } = useAppData();

  const task = tasks.find(t => t.id === taskId);
  if (!task) return (
    <div className="p-xl text-center text-on-surface-variant">
      <p>Task not found.</p>
      <button onClick={() => navigate('/dashboard')} className="mt-md text-primary hover:underline text-label-md">Back to Dashboard</button>
    </div>
  );

  const pStyle   = PRIORITY_STYLES[task.priority];
  const progress = PROGRESS[task.status] ?? 0;

  const onDelete = async () => {
    await handleDeleteTask(task.id);
    navigate(-1);
  };

  const onMarkDone = async () => {
    await handleMarkDone(task.id);
  };

  return (
    <div className="p-xl max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center mb-lg">
        <nav className="flex items-center gap-xs text-on-surface-variant text-label-md">
          <button onClick={() => navigate(-1)} className="hover:text-primary transition-colors">Back</button>
          <span className="material-symbols-outlined text-icon-base">chevron_right</span>
          <span className="text-on-surface">{task.project || 'Task Details'}</span>
        </nav>
        <div className="flex gap-sm">
          <button
            onClick={onDelete}
            className="px-md py-xs border border-error/30 text-error rounded text-label-md hover:bg-error/5 transition-colors duration-150"
          >
            Delete
          </button>
          {task.status !== 'done' && (
            <button
              onClick={onMarkDone}
              className="px-md py-xs border border-outline-variant text-on-surface rounded text-label-md hover:bg-surface-container-low transition-colors duration-150"
            >
              Mark Complete
            </button>
          )}
          <button
            onClick={() => navigate(`/tasks/${task.id}/edit`)}
            className="px-md py-xs bg-primary text-on-primary rounded text-label-md flex items-center gap-xs active:scale-95 transition-transform duration-150"
          >
            <span className="material-symbols-outlined text-icon-base">edit</span>
            Edit
          </button>
        </div>
      </div>

      <div className="mb-lg">
        <div className="flex items-center gap-sm flex-wrap mb-sm">
          <span className={`px-sm py-xs rounded-full text-label-sm uppercase font-semibold ${pStyle.bg} ${pStyle.text}`}>
            {PRIORITY_LABELS[task.priority]}
          </span>
          <span className={`px-sm py-xs rounded-full text-label-sm font-semibold
            ${task.status === 'done'
              ? 'bg-green-500/10 text-green-700'
              : task.status === 'in_progress'
                ? 'bg-primary/10 text-primary'
                : 'bg-surface-container-high text-on-surface-variant'}`}>
            {STATUS_LABELS[task.status]}
          </span>
          {task.project && (
            <span className="px-sm py-xs bg-surface-container rounded-full text-label-sm text-on-surface-variant">{task.project}</span>
          )}
        </div>
        <h2 className="text-headline-lg text-on-surface font-semibold">{task.name}</h2>
      </div>

      <div className="mb-xl bg-surface-container-lowest border border-outline-variant rounded-lg p-lg">
        <div className="flex justify-between items-center mb-sm">
          <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Progress</span>
          <span className="text-label-md text-on-surface font-semibold">{progress}%</span>
        </div>
        <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${task.status === 'done' ? 'bg-green-500' : 'bg-primary'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-sm text-label-sm text-on-surface-variant">
          <span>Not started</span><span>Complete</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-lg">
        <div className="col-span-12 lg:col-span-8 space-y-lg">
          <section className="bg-surface-container-lowest border border-outline-variant p-lg rounded-lg shadow-sm">
            <h3 className="text-headline-sm text-on-surface font-semibold mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-on-surface-variant text-icon-md">description</span>
              Description
            </h3>
            {task.description
              ? <p className="text-body-md text-on-surface-variant whitespace-pre-wrap leading-relaxed">{task.description}</p>
              : <p className="text-body-md text-on-surface-variant/40 italic">No description provided.</p>
            }
          </section>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <section className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm overflow-hidden">
            <div className="px-lg py-sm border-b border-outline-variant bg-surface-container-low/60">
              <h3 className="text-label-sm text-on-surface-variant uppercase tracking-wider font-medium">Details</h3>
            </div>
            <dl className="divide-y divide-outline-variant/40">
              <MetaRow icon="task_alt"       label="Status"   value={STATUS_LABELS[task.status]} />
              <MetaRow icon="low_priority"   label="Priority" value={PRIORITY_LABELS[task.priority]} />
              {task.startDate && <MetaRow icon="event"          label="Start"    value={task.startDate} />}
              {task.dueDate   && <MetaRow icon="calendar_today" label="Due"      value={task.dueDate} />}
              <ProjectRow project={task.project} projects={projects} onChange={name => handleAssignProject(task.id, name)} />
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}

function MetaRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-sm px-lg py-sm">
      <span className="material-symbols-outlined text-on-surface-variant text-icon-base shrink-0">{icon}</span>
      <dt className="text-label-sm text-on-surface-variant flex-1">{label}</dt>
      <dd className="text-label-md text-on-surface font-medium">{value}</dd>
    </div>
  );
}

function ProjectRow({ project, projects, onChange }: { project: string; projects: Project[]; onChange: (name: string) => void }) {
  return (
    <div className="flex items-center gap-sm px-lg py-sm">
      <span className="material-symbols-outlined text-on-surface-variant text-icon-base shrink-0">folder</span>
      <dt className="text-label-sm text-on-surface-variant flex-1">Project</dt>
      <dd>
        <select
          value={project} onChange={e => onChange(e.target.value)}
          className="text-label-md text-on-surface bg-transparent border-none outline-none cursor-pointer hover:text-primary transition-colors text-right appearance-none font-medium"
        >
          <option value="">No Project</option>
          {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
        </select>
      </dd>
    </div>
  );
}
