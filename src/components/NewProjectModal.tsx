import { useState, useEffect } from 'react';
import type { Project } from '../types';
import { PROJECT_COLORS } from '../types';

interface Props {
  project?: Project;
  onSave: (data: Omit<Project, 'id'>) => Promise<void>;
  onClose: () => void;
}

const EMPTY = { name: '', color: PROJECT_COLORS[0], description: '' };

export default function NewProjectModal({ project, onSave, onClose }: Props) {
  const [form, setForm]   = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    setForm(project
      ? { name: project.name, color: project.color, description: project.description }
      : EMPTY);
    setError('');
  }, [project]);

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    setError('');
    try {
      await onSave(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSaving(false);
    }
  };

  const isEditing = !!project;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-lg"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" />

      {/* Dialog — xl radius matches the reference */}
      <div className="relative bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-lg pt-lg pb-md">
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-9 h-9 flex items-center justify-center bg-surface-container border border-outline-variant rounded text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>

          <h2 className="text-headline-md text-on-surface font-semibold">
            {isEditing ? 'Edit Project' : 'New Project'}
          </h2>

          {/* Spacer button (keeps title centred) */}
          <div className="w-9 h-9" />
        </div>

        {/* Body */}
        <div className="px-lg pb-lg space-y-sm">

          {/* Color section */}
          <div className="bg-surface-container-low rounded-md p-md">
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-md">Color</p>
            <div className="flex gap-sm flex-wrap">
              {PROJECT_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setForm(f => ({ ...f, color }))}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none shrink-0"
                  style={{ backgroundColor: color }}
                >
                  {form.color === color && (
                    <span className="material-symbols-outlined text-white text-[15px]">check</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Name section */}
          <div className="bg-surface-container-low rounded-md p-md">
            <label htmlFor="project-name" className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-sm">
              Project Name <span className="text-error normal-case">*</span>
            </label>
            <input
              id="project-name"
              autoFocus
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="e.g., Mobile App Redesign"
              className="w-full bg-surface-container-lowest border border-outline-variant rounded px-md py-sm text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Description section */}
          <div className="bg-surface-container-low rounded-md p-md">
            <label htmlFor="project-desc" className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-sm">
              Description
            </label>
            <textarea
              id="project-desc"
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What is this project about?"
              className="w-full bg-surface-container-lowest border border-outline-variant rounded px-md py-sm text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-label-sm text-error bg-error/10 rounded px-md py-sm">{error}</p>
          )}

          {/* Full-width CTA */}
          <button
            onClick={handleSubmit}
            disabled={!form.name.trim() || saving}
            className="w-full bg-on-surface text-inverse-on-surface py-md rounded-md text-label-md font-semibold hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-sm"
          >
            {saving && (
              <span className="material-symbols-outlined text-[16px] animate-spin" style={{ animationDuration: '1s' }}>
                autorenew
              </span>
            )}
            {isEditing ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
}
