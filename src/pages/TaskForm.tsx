import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppData } from '../context/AppContext';
import type { Status, Priority } from '../types';
import { STATUS_ORDER, STATUS_LABELS, PRIORITY_ORDER, PRIORITY_LABELS } from '../types';

const EMPTY_FORM = {
  name: '', description: '', startDate: '', dueDate: '',
  status: 'todo' as Status, priority: 'medium' as Priority, project: '',
};

export default function TaskForm() {
  const { taskId } = useParams<{ taskId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { tasks, projects, settings, handleSaveTask } = useAppData();

  const editingTask = taskId ? tasks.find(t => t.id === taskId) : undefined;
  const fromProject = searchParams.get('fromProject');

  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (editingTask) setForm(editingTask);
    else {
      const preselectedProject = fromProject
        ? (projects.find(p => p.id === fromProject)?.name ?? '')
        : '';
      setForm({ ...EMPTY_FORM, priority: settings.defaultPriority, project: preselectedProject });
    }
  }, [editingTask, settings.defaultPriority, fromProject, projects]);

  const isEditing = !!editingTask;

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    await handleSaveTask(form, editingTask);
    if (fromProject) navigate(`/projects/${fromProject}`);
    else if (isEditing) navigate(`/tasks/${taskId}`);
    else navigate('/dashboard');
  };

  const handleCancel = () => navigate(-1);

  return (
    <div className="p-xl max-w-5xl mx-auto w-full">
      <div className="mb-xl">
        <h2 className="text-headline-lg text-primary">{isEditing ? 'Edit Task' : 'Create New Task'}</h2>
        <p className="text-body-md text-on-surface-variant mt-xs">
          {isEditing ? 'Update task details below.' : 'Define your next milestone and stay organized.'}
        </p>
      </div>

      <div className="grid grid-cols-12 gap-lg">
        <div className="col-span-12 lg:col-span-8 space-y-lg">
          <div className="bg-surface-container-lowest border border-outline-variant p-xl rounded-xl shadow-sm">
            <div className="space-y-xl">
              <div>
                <label className="block text-label-md text-on-surface mb-sm" htmlFor="task-title">
                  Task Title <span className="text-error">*</span>
                </label>
                <input
                  id="task-title" autoFocus
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-md focus:ring-2 focus:ring-secondary focus:border-transparent text-body-md outline-none transition-all"
                  placeholder="e.g., Finalize Q4 Marketing Strategy"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>
              <div>
                <label className="block text-label-md text-on-surface mb-sm" htmlFor="description">Description</label>
                <textarea
                  id="description" rows={6}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-md focus:ring-2 focus:ring-secondary focus:border-transparent text-body-md outline-none transition-all resize-none"
                  placeholder="Describe the objectives, key results, and any relevant links..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-lg">
          <div className="bg-surface-container-lowest border border-outline-variant p-xl rounded-xl shadow-sm">
            <div className="space-y-xl">
              <div>
                <label className="block text-label-md text-on-surface mb-sm" htmlFor="status">Status</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">task_alt</span>
                  <select id="status"
                    className="w-full pl-12 pr-md py-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-body-md outline-none transition-all appearance-none"
                    value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Status }))}
                  >
                    {STATUS_ORDER.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                </div>
              </div>

              <div>
                <label className="block text-label-md text-on-surface mb-sm" htmlFor="priority">Priority</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">low_priority</span>
                  <select id="priority"
                    className="w-full pl-12 pr-md py-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-body-md outline-none transition-all appearance-none"
                    value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}
                  >
                    {PRIORITY_ORDER.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                </div>
              </div>

              <div>
                <label className="block text-label-md text-on-surface mb-sm" htmlFor="due-date">Due Date</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">calendar_today</span>
                  <input id="due-date" type="date"
                    className="w-full pl-12 pr-md py-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-body-md outline-none transition-all"
                    value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-label-md text-on-surface mb-sm" htmlFor="start-date">Start Date</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">event</span>
                  <input id="start-date" type="date"
                    className="w-full pl-12 pr-md py-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-body-md outline-none transition-all"
                    value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-label-md text-on-surface mb-sm" htmlFor="project">Project</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">folder</span>
                  <select id="project"
                    className="w-full pl-12 pr-md py-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-body-md outline-none transition-all appearance-none"
                    value={form.project} onChange={e => setForm(f => ({ ...f, project: e.target.value }))}
                  >
                    <option value="">— None —</option>
                    {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 flex justify-end items-center gap-md pt-lg">
          <button
            onClick={handleCancel}
            className="px-xl py-md border border-outline-variant rounded-lg text-label-md text-on-surface-variant hover:bg-surface-container-low transition-all duration-150 active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.name.trim()}
            className="px-xl py-md bg-primary text-on-primary rounded-lg text-label-md shadow-sm hover:opacity-90 transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isEditing ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
